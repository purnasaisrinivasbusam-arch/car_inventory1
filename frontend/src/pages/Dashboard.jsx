import React, { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Shared date helpers so chart labels and the "Dates:" line match exactly
function parseDateGlobal(s) {
  if (!s) return null;
  try {
    if (s.includes('T') || s.includes(' ')) return new Date(s);
    return new Date(s + 'T00:00:00');
  } catch (e) { return null; }
}

function fmtDateGlobal(s) {
  const d = parseDateGlobal(s);
  if (!d || Number.isNaN(d.getTime())) return s;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString(undefined, { month: 'short' });
  return `${day} ${month}`; // e.g. '13 Nov'
}

function BarChart({ data = [], color = '#0d6efd', title = '' }){
  if (!data || data.length === 0) return <div style={{fontSize:12,color:'#666'}}>No data</div>;

  // prepare labels (sorted) and dataset
  const sorted = (data || []).slice().sort((a,b)=>{
    const da = parseDateGlobal(a.date);
    const db = parseDateGlobal(b.date);
    return (da?.getTime() || 0) - (db?.getTime() || 0);
  });

  const labels = sorted.map(d => fmtDateGlobal(d.date));
  const counts = sorted.map(d => d.count);

  // custom plugin to draw count labels above bars (small)
  const barLabelPlugin = {
    id: 'barLabelPlugin',
    afterDatasetsDraw(chart) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        meta.data.forEach((bar, index) => {
          const value = dataset.data[index];
          ctx.save();
          ctx.fillStyle = '#333';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(value, bar.x, bar.y - 6);
          ctx.restore();
        });
      });
    }
  };

  const dataObj = {
    labels,
    datasets: [
      {
        label: title,
        data: counts,
        backgroundColor: color,
        borderRadius: 4,
        barThickness: 18
      }
    ]
  };

  const options = {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#666', font: { size: 10 } }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#999', font: { size: 10 } },
        grid: { color: '#eee' }
      }
    }
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <strong style={{fontSize:13}}>{title}</strong>
        <div style={{fontSize:11,color:'#666'}}>Total: {counts.reduce((s,c)=>s+c,0)}</div>
      </div>
      <div style={{width:320,height:120}}>
        <Bar data={dataObj} options={options} plugins={[barLabelPlugin]} width={320} height={120} />
      </div>
    </div>
  )
}

export default function Dashboard(){
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      // send client's timezone offset and local today so backend groups by client-local dates
      const tzMinutes = -new Date().getTimezoneOffset(); // minutes ahead of UTC
      const sign = tzMinutes >= 0 ? '+' : '-';
      const abs = Math.abs(tzMinutes);
      const tzOffset = `${sign}${String(Math.floor(abs/60)).padStart(2,'0')}:${String(abs%60).padStart(2,'0')}`;
      const now = new Date();
      const localToday = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const res = await API.get('/dashboard', { params: { tzOffset, today: localToday } });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>No data</div>;

  const goFilterBy = (type, value) => {
    // navigate to records with search param
    if (!value) return;
    const search = encodeURIComponent(value);
    navigate(`/records?search=${search}`);
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="row mb-3">
        <div className="col-md-3">
          <div className="card p-3 mb-3">
            <h5>Total entries</h5>
            <div className="display-6">{stats.total}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 mb-3">
            <h5>Today</h5>
            <div className="display-6">{stats.today}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 mb-3">
            <h5>This week</h5>
            <div className="display-6">{stats.thisWeek}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 mb-3">
            <h5>Recent</h5>
            <div>{stats.recent ? stats.recent.length : 0} items</div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card p-3 mb-3">
            <h6>Last 7 days</h6>
            <div style={{display:'flex',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
              <div style={{flex:'0 0 auto',minWidth:220}}>
                <BarChart data={stats.dailyCountsIn || []} color="#0d6efd" title="IN" />
              </div>
              <div style={{flex:'0 0 auto',minWidth:220}}>
                <BarChart data={stats.dailyCountsOut || []} color="#ff7a00" title="OUT" />
              </div>
            </div>
            <div className="mt-2 small text-muted">Dates: {(() => {
              const src = stats.dailyCounts || stats.dailyCountsIn || stats.dailyCountsOut || [];
              // build sorted unique date list (guard if both IN and OUT present)
              const uniq = Array.from(new Set(src.map(d => d.date)));
              const sortedDates = uniq.slice().sort((a,b)=>{
                const da = parseDateGlobal(a);
                const db = parseDateGlobal(b);
                return (da?.getTime() || 0) - (db?.getTime() || 0);
              });
              return sortedDates.map(d => fmtDateGlobal(d)).join(', ');
            })()}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h6>Top Reg Nos</h6>
            <ul className="list-unstyled">
              {stats.topReg && stats.topReg.map(t => (
                <li key={t._id}>
                  <a href="#" onClick={(e)=>{ e.preventDefault(); goFilterBy('regNo', t._id); }}>{t._id}</a>
                  <small className="text-muted"> ({t.count})</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card p-3 mb-3">
            <h6>Recent entries</h6>
            <ul className="list-unstyled">
              {stats.recent && stats.recent.map(r => (
                <li key={r._id}>
                  <a href="#" onClick={(e)=>{ e.preventDefault(); navigate(`/records?search=${encodeURIComponent(r.regNo)}`); }}>{r.regNo}</a>
                  <div className="small text-muted">{r.personName} — {new Date(r.inOutDateTime).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
