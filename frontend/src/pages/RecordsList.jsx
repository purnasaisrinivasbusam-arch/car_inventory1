import React, { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate, useLocation } from 'react-router-dom'
import MediaModal from '../components/MediaModal'

export default function RecordsList(){
  const [records, setRecords] = useState([]);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const user = typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user && user.role === 'admin';

  // pagination & sorting state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('inOutDateTime');
  const [sortDir, setSortDir] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState([]);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);
  const [hoveredImage, setHoveredImage] = useState(null); // { recordId, index }

  const fetchRecords = async (opts = {}) => {
    try {
      const params = {
        search: q,
        status: statusFilter,
        page,
        limit,
        sortBy,
        sortDir,
        ...opts,
      };

      const res = await API.get('/car-records', { params });

      // backend may return { total, page, limit, items }
      if (res.data && Array.isArray(res.data.items)) {
        setRecords(res.data.items);
        setTotal(res.data.total || 0);
        setPage(res.data.page || page);
        setLimit(res.data.limit || limit);
      } else if (Array.isArray(res.data)) {
        // fallback to older format
        setRecords(res.data);
        setTotal(res.data.length);
      } else {
        setRecords([]);
        setTotal(0);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching records');
    }
  }

  // initialize from query params if provided
  useEffect(()=>{
    const qp = new URLSearchParams(location.search);
    const s = qp.get('search');
    const p = qp.get('page');
    const l = qp.get('limit');
    const sb = qp.get('sortBy');
    const sd = qp.get('sortDir');
    if (s !== null) setQ(s);
    if (p) setPage(Number(p));
    if (l) setLimit(Number(l));
    if (sb) setSortBy(sb);
    if (sd) setSortDir(sd);
    fetchRecords();
  }, [location.search]);

  useEffect(()=>{ fetchRecords(); }, [page, limit, sortBy, sortDir, statusFilter]);

  const onSearch = () => { setPage(1); fetchRecords({ page: 1 }); }

  const handleExport = async () => {
    try {
      const response = await API.get('/admin/export-cars', {
        responseType: 'blob' // Important for file download
      });

      // Create a blob link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `car_inventory_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="d-flex mb-3">
        <input className="form-control me-2" placeholder="Search regNo, person, make, Referral ID..." value={q} onChange={e=>setQ(e.target.value)} />
        <button className="btn btn-outline-primary me-3" onClick={onSearch}>Search</button>

        <div className="me-2 d-flex align-items-center">
          <label className="me-2 mb-0">Sort</label>
          <select className="form-select me-2" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:160}}>
            <option value="inOutDateTime">Date</option>
            <option value="regNo">Reg No</option>
            <option value="personName">Person</option>
          </select>
          <select className="form-select" value={sortDir} onChange={e=>setSortDir(e.target.value)} style={{width:120}}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        <div className="d-flex align-items-center me-2">
          <label className="me-2 mb-0">Status</label>
          <select className="form-select" value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value); setPage(1); }} style={{width:120}}>
            <option value="">All</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
        </div>

        <div className="d-flex align-items-center">
          <label className="me-2 mb-0">Page size</label>
          <select className="form-select" value={limit} onChange={e=>{ setLimit(Number(e.target.value)); setPage(1); }} style={{width:100}}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="mb-2 d-flex justify-content-between">
        <div>Showing {records.length} of {total} results</div>
        <div className="d-flex align-items-center">
          {isAdmin && (
            <button className="btn btn-success me-3" onClick={handleExport}>
              <i className="bi bi-download me-2"></i>Export to Excel
            </button>
          )}
          Page {page} / {totalPages}
        </div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Reg No</th>
            <th>Person</th>
            <th>Referral ID</th>
            <th>In/Out</th>
            <th>Date</th>
            <th>Media</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r._id}>
              <td>{r.regNo}</td>
              <td>{r.personName}</td>
              <td>{r.referralId}</td>
              <td>{r.inOutStatus}</td>
              <td>{r.inOutDateTime ? new Date(r.inOutDateTime).toLocaleString() : ''}</td>
              <td>
                <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                  {r.photos && r.photos.slice(0, 3).map((p,i)=> (
                    <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={p.startsWith('http') ? p : `https://car-inventory1-hc9s.onrender.com${p}`} alt="photo" style={{ height: 80, width: 80, objectFit: 'cover', marginRight: 6, cursor: 'pointer', borderRadius: '4px' }}
                        onMouseEnter={() => setHoveredImage({ recordId: r._id, index: i })}
                        onMouseLeave={() => setHoveredImage(null)}
                        onClick={() => {
                          const allMedia = [...(r.photos || []), ...(r.video ? [r.video] : [])];
                          setModalMedia(allMedia);
                          setModalInitialIndex(i);
                          setModalOpen(true);
                        }}
                      />
                      {hoveredImage && hoveredImage.recordId === r._id && hoveredImage.index === i && (
                        <div style={{ position: 'absolute', top: '-210px', left: '0', zIndex: 1000, background: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <img src={p.startsWith('http') ? p : `https://car-inventory1-hc9s.onrender.com${p}`} alt="preview" style={{ height: '200px', width: '200px', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  ))}
                  {r.photos && r.photos.length > 3 && (
                    <div
                      className="d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle"
                      style={{ height: 80, width: 80, cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      onClick={() => {
                        const allMedia = [...(r.photos || []), ...(r.video ? [r.video] : [])];
                        setModalMedia(allMedia);
                        setModalInitialIndex(0);
                        setModalOpen(true);
                      }}
                    >
                      +{r.photos.length - 3}
                    </div>
                  )}
                  {r.video && (
                    <button
                      className="btn btn-link p-0"
                      onClick={() => {
                        const allMedia = [...(r.photos || []), r.video];
                        setModalMedia(allMedia);
                        setModalInitialIndex((r.photos || []).length);
                        setModalOpen(true);
                      }}
                    >
                      View Video
                    </button>
                  )}
                </div>
              </td>
              <td>
                <button className="btn btn-sm btn-info me-2" onClick={()=>{ navigate(`/record/${r._id}`) }}>View Details</button>
                {isAdmin && (
                  <>
                    <button className="btn btn-sm btn-secondary me-2" onClick={()=>{ navigate(`/entry?edit=${r._id}`) }}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={async ()=>{
                      if (!confirm('Delete?')) return;
                      try {
                        await API.delete(`/car/${r._id}`);
                        fetchRecords();
                      } catch (err) { console.error(err); alert('Delete failed') }
                    }}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center">
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={()=>{ if (page>1) setPage(p=>p-1); }} disabled={page<=1}>Prev</button>
          <button className="btn btn-outline-secondary" onClick={()=>{ if (page<totalPages) setPage(p=>p+1); }} disabled={page>=totalPages}>Next</button>
        </div>

        <div>
          <small className="text-muted">Go to page:</small>
          <input type="number" min={1} max={totalPages} value={page} onChange={e=>{ const v = Number(e.target.value) || 1; setPage(Math.min(Math.max(1, v), totalPages)); }} style={{width:80, marginLeft:8}} />
        </div>
      </div>

      <MediaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mediaUrls={modalMedia}
        initialIndex={modalInitialIndex}
      />


    </div>
  )
}
