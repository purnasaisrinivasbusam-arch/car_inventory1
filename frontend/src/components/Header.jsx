import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Header(){
  const navigate = useNavigate();
  const location = useLocation();
  const user = typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user && user.role === 'admin';
  const isDashboard = location.pathname === '/';
  const isRecords = location.pathname === '/records';
  const isEntry = location.pathname === '/entry';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch custom event to update token state in App.jsx
    window.dispatchEvent(new Event('logout'));
    navigate('/login');
  }

  return (
    <header className="navbar navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Car Portal</Link>
        <div>
          {user && !isRecords && !isEntry && <Link to="/records" className="btn btn-sm btn-outline-light me-2">Records</Link>}
          {user && isAdmin && !isRecords && !isEntry && <Link to="/entry" className="btn btn-sm btn-outline-light me-2">New Entry</Link>}
          {!user && <Link to="/login" className="btn btn-sm btn-outline-light me-2">Login</Link>}
          {!user && <Link to="/register" className="btn btn-sm btn-outline-light">Register</Link>}
          {user && <span className="text-light me-2">{user.name} {isAdmin && '(Admin)'}</span>}
          {user && <button className="btn btn-sm btn-outline-light" onClick={logout}>Logout</button>}
        </div>
      </div>
    </header>
  )
}
