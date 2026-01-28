import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api'

export default function RecordDetails(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const user = typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await API.get(`/car/${id}`);
        setRecord(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load record details');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleDeletePhoto = async (index) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      await API.delete(`/car/${id}/photos/${index}`);
      // reload record
      const res = await API.get(`/car/${id}`);
      setRecord(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to delete photo');
    }
  };

  const handleDeleteVideo = async () => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await API.delete(`/car/${id}/video`);
      // reload record
      const res = await API.get(`/car/${id}`);
      setRecord(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to delete video');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
        <button className="btn btn-secondary ms-2" onClick={() => navigate('/records')}>Back to Records</button>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="alert alert-warning m-3" role="alert">
        Record not found
        <button className="btn btn-secondary ms-2" onClick={() => navigate('/records')}>Back to Records</button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Record Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/records')}>Back to Records</button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5 className="card-title">Basic Information</h5>
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td><strong>Registration Number:</strong></td>
                    <td>{record.regNo}</td>
                  </tr>
                  <tr>
                    <td><strong>Person Name:</strong></td>
                    <td>{record.personName}</td>
                  </tr>
                  <tr>
                    <td><strong>Make:</strong></td>
                    <td>{record.make}</td>
                  </tr>
                  <tr>
                    <td><strong>Model:</strong></td>
                    <td>{record.model}</td>
                  </tr>
                  <tr>
                    <td><strong>Colour:</strong></td>
                    <td>{record.colour}</td>
                  </tr>
                  <tr>
                    <td><strong>In/Out Status:</strong></td>
                    <td>{record.inOutStatus}</td>
                  </tr>
                  <tr>
                    <td><strong>Date & Time:</strong></td>
                    <td>{record.inOutDateTime ? new Date(record.inOutDateTime).toLocaleString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Created:</strong></td>
                    <td>{record.createdAt ? new Date(record.createdAt).toLocaleString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Updated:</strong></td>
                    <td>{record.updatedAt ? new Date(record.updatedAt).toLocaleString() : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h5 className="card-title">Media</h5>
              {record.photos && record.photos.length > 0 && (
                <div className="mb-3">
                  <h6>Photos:</h6>
                  <div className="d-flex flex-wrap">
                    {record.photos.map((photo, index) => (
                      <div key={index} className="position-relative d-inline-block me-2 mb-2">
                        <img
                          src={photo.startsWith('http') ? photo : `https://car-inventory1-1.onrender.com${photo}`}
                          alt={`Photo ${index + 1}`}
                          className="img-thumbnail"
                          style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => setSelectedMedia({ type: 'image', src: photo.startsWith('http') ? photo : `https://car-inventory1-1.onrender.com${photo}`, alt: `Photo ${index + 1}` })}
                        />
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm position-absolute"
                            style={{ top: '5px', right: '5px' }}
                            onClick={() => handleDeletePhoto(index)}
                            title="Delete this photo"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {record.video && (
                <div className="mb-3">
                  <h6>Video:</h6>
                  <div className="d-flex align-items-start">
                  <video
                      controls
                      className="me-2"
                      style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => setSelectedMedia({ type: 'video', src: record.video.startsWith('http') ? record.video : `https://car-inventory1-hc9s.onrender.com${record.video}` })}
                    >
                      <source src={record.video.startsWith('http') ? record.video : `https://car-inventory1-hc9s.onrender.com${record.video}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {isAdmin && (
                      <button
                        className="btn btn-danger"
                        onClick={handleDeleteVideo}
                        title="Delete this video"
                      >
                        <i className="bi bi-trash me-1"></i>Delete Video
                      </button>
                    )}
                  </div>
                </div>
              )}
              {(!record.photos || record.photos.length === 0) && !record.video && (
                <p className="text-muted">No media files attached</p>
              )}
            </div>
          </div>
          {record.notes && (
            <div className="mt-3">
              <h5>Notes</h5>
              <p>{record.notes}</p>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-3">
          <button className="btn btn-secondary me-2" onClick={() => navigate(`/entry?edit=${record._id}`)}>Edit Record</button>
          <button className="btn btn-danger" onClick={async () => {
            if (!confirm('Are you sure you want to delete this record?')) return;
            try {
              await API.delete(`/car/${record._id}`);
              navigate('/records');
            } catch (err) {
              console.error(err);
              alert('Delete failed');
            }
          }}>Delete Record</button>
        </div>
      )}

      {/* Media Modal */}
      {selectedMedia && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={() => setSelectedMedia(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedMedia.alt || 'Media'}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedMedia(null)}></button>
              </div>
              <div className="modal-body text-center">
                {selectedMedia.type === 'image' && (
                  <img src={selectedMedia.src} alt={selectedMedia.alt} className="img-fluid" />
                )}
                {selectedMedia.type === 'video' && (
                  <video controls autoPlay className="w-100">
                    <source src={selectedMedia.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
