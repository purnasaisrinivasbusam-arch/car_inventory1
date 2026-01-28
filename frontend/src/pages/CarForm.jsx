import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import API from '../api'
import { useLocation, useNavigate } from 'react-router-dom'
import FilePreview from '../components/FilePreview'

export default function CarForm(){
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const photoInput = useRef();
  const videoInput = useRef();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('edit');
    if (id) {
      setIsEdit(true);
      setEditingId(id);
      // fetch record and prefill
      API.get(`/car/${id}`).then(res => {
        const data = res.data;
        // convert datetime to input-local format if present
        if (data.inOutDateTime) {
          const d = new Date(data.inOutDateTime);
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISOTime = new Date(d - tzOffset).toISOString().slice(0,16);
          data.inOutDateTime = localISOTime;
        }
        setExistingPhotos(data.photos || []);
        reset(data);
      }).catch(err => {
        console.error(err);
        alert('Failed to load record');
      });
    }
  }, [location.search, reset]);

  const onSubmit = async (data) => {
    try {
      setUploadProgress(0);
      const form = new FormData();
      // append non-file fields; convert inOutDateTime (datetime-local) to full ISO
      Object.keys(data).forEach(key => {
        if (key === 'photos' || key === 'video' || key === 'inOutDateTime') return;
        if (data[key] !== undefined && data[key] !== null) form.append(key, data[key]);
      });
      if (data.inOutDateTime) {
        // `data.inOutDateTime` comes from <input type="datetime-local"> (no timezone)
        // Build a Date using numeric components so the value is interpreted
        // as local time reliably across browsers, then send the UTC ISO string.
        try {
          const s = data.inOutDateTime; // expected like 'YYYY-MM-DDTHH:mm'
          const [datePart, timePart] = (s || '').split('T');
          if (datePart && timePart) {
            const [y, m, d] = datePart.split('-').map(Number);
            const [hh, mm] = timePart.split(':').map(Number);
            const localDate = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
            form.append('inOutDateTime', localDate.toISOString());
          } else {
            // fallback
            const d = new Date(s);
            form.append('inOutDateTime', Number.isNaN(d.getTime()) ? s : d.toISOString());
          }
        } catch (e) {
          // fallback to raw value
          form.append('inOutDateTime', data.inOutDateTime);
        }
      }
      // append files
      selectedPhotos.forEach(photo => form.append('photos', photo));
      if (selectedVideo) form.append('video', selectedVideo);

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const progress = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(progress);
        }
      };

      if (isEdit && editingId) {
        const res = await API.put(`/car/${editingId}`, form, config);
        alert('Updated');
        navigate('/records');
      } else {
        const res = await API.post('/car-entry', form, config);
        alert('Saved');
        reset();
        setSelectedPhotos([]);
        setSelectedVideo(null);
        setUploadProgress(0);
        navigate('/records');
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Error');
    }
  }

  return (
    <div>
      <h2>{isEdit ? 'Edit Car Entry' : 'Car Entry'}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">In/Out Status</label>
          <select className="form-select" {...register('inOutStatus', { required: true })}>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
          {errors.inOutStatus && <small className="text-danger">Required</small>}
        </div>

        <div className="mb-3">
          <label className="form-label">In/Out Date & Time</label>
          <input type="datetime-local" className="form-control" {...register('inOutDateTime', { required: true })} />
          {errors.inOutDateTime && <small className="text-danger">Required</small>}
        </div>

        <div className="mb-3">
          <label className="form-label">Vehicle Reg No</label>
          <input className="form-control" {...register('regNo', { required: true })} />
          {errors.regNo && <small className="text-danger">Required</small>}
        </div>

        <div className="row">
          <div className="col-md-4 mb-3"><label className="form-label">Make</label><input className="form-control" {...register('make', { required: true })} />{errors.make && <small className="text-danger">Required</small>}</div>
          <div className="col-md-4 mb-3"><label className="form-label">Model</label><input className="form-control" {...register('model', { required: true })} />{errors.model && <small className="text-danger">Required</small>}</div>
          <div className="col-md-4 mb-3"><label className="form-label">Variant</label><input className="form-control" {...register('variant', { required: true })} />{errors.variant && <small className="text-danger">Required</small>}</div>
        </div>

        <div className="row">
          <div className="col-md-3 mb-3"><label className="form-label">Year</label><input type="number" className="form-control" {...register('year', { required: true })} />{errors.year && <small className="text-danger">Required</small>}</div>
          <div className="col-md-3 mb-3"><label className="form-label">Colour</label><input className="form-control" {...register('colour', { required: true })} />{errors.colour && <small className="text-danger">Required</small>}</div>
          <div className="col-md-3 mb-3"><label className="form-label">KMP</label><input type="number" className="form-control" {...register('kmp', { required: true })} />{errors.kmp && <small className="text-danger">Required</small>}</div>
        </div>

        <div className="mb-3"><label className="form-label">Person Name</label><input className="form-control" {...register('personName', { required: true })} />{errors.personName && <small className="text-danger">Required</small>}</div>
        <div className="mb-3"><label className="form-label">Cell No</label><input className="form-control" {...register('cellNo', { required: true })} />{errors.cellNo && <small className="text-danger">Required</small>}</div>
        <div className="mb-3"><label className="form-label">Price</label><input type="number" className="form-control" {...register('price', { required: true })} />{errors.price && <small className="text-danger">Required</small>}</div>
        <div className="mb-3"><label className="form-label">Referral ID</label><input className="form-control" {...register('referralId', { required: true })} maxLength="16" />{errors.referralId && <small className="text-danger">Required</small>}</div>

        <div className="mb-3">
          <label className="form-label">Vehicle Photos</label>
          <input 
            ref={photoInput}
            className="form-control" 
            type="file" 
            multiple 
            accept="image/*"
            onChange={(e) => setSelectedPhotos(Array.from(e.target.files))}
          />
          <FilePreview 
            files={selectedPhotos} 
            onRemove={(index) => {
              setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
              photoInput.current.value = '';
            }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Vehicle Video</label>
          <input 
            ref={videoInput}
            className="form-control" 
            type="file" 
            accept="video/*"
            onChange={(e) => setSelectedVideo(e.target.files[0])}
          />
          {selectedVideo && (
            <div className="mt-2">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">{selectedVideo.name}</span>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    setSelectedVideo(null);
                    videoInput.current.value = '';
                  }}
                >Remove</button>
              </div>
            </div>
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-3">
            <div className="progress">
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ width: `${uploadProgress}%` }} 
                aria-valuenow={uploadProgress} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                {uploadProgress}%
              </div>
            </div>
          </div>
        )}

        <button className="btn btn-primary">{isEdit ? 'Save Changes' : 'Submit'}</button>
      </form>
    </div>
  )
}
