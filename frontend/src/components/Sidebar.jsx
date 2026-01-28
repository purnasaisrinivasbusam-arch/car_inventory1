import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar(){
  const user = typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user && user.role === 'admin';
  return (
    <aside className="bg-light p-3" style={{ width: 220 }}>
      <nav className="nav flex-column">
        <NavLink
          to="/"
          className="nav-link"
          style={({ isActive }) => ({
            backgroundColor: isActive ? '#007bff' : 'transparent',
            color: isActive ? 'white' : 'inherit',
            borderRadius: '4px',
            padding: '8px 12px',
            marginBottom: '4px',
            textDecoration: 'none',
            transition: 'background-color 0.3s ease'
          })}
          onMouseEnter={(e) => {
            if (!e.target.classList.contains('active')) {
              e.target.style.backgroundColor = '#e9ecef';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.classList.contains('active')) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          Dashboard
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/entry"
            className="nav-link"
            style={({ isActive }) => ({
              backgroundColor: isActive ? '#007bff' : 'transparent',
              color: isActive ? 'white' : 'inherit',
              borderRadius: '4px',
              padding: '8px 12px',
              marginBottom: '4px',
              textDecoration: 'none',
              transition: 'background-color 0.3s ease'
            })}
            onMouseEnter={(e) => {
              if (!e.target.classList.contains('active')) {
                e.target.style.backgroundColor = '#e9ecef';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.classList.contains('active')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            Car Entry
          </NavLink>
        )}
        <NavLink
          to="/records"
          className="nav-link"
          style={({ isActive }) => ({
            backgroundColor: isActive ? '#007bff' : 'transparent',
            color: isActive ? 'white' : 'inherit',
            borderRadius: '4px',
            padding: '8px 12px',
            marginBottom: '4px',
            textDecoration: 'none',
            transition: 'background-color 0.3s ease'
          })}
          onMouseEnter={(e) => {
            if (!e.target.classList.contains('active')) {
              e.target.style.backgroundColor = '#e9ecef';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.classList.contains('active')) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          Records
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/user-records"
            className="nav-link"
            style={({ isActive }) => ({
              backgroundColor: isActive ? '#007bff' : 'transparent',
              color: isActive ? 'white' : 'inherit',
              borderRadius: '4px',
              padding: '8px 12px',
              marginBottom: '4px',
              textDecoration: 'none',
              transition: 'background-color 0.3s ease'
            })}
            onMouseEnter={(e) => {
              if (!e.target.classList.contains('active')) {
                e.target.style.backgroundColor = '#e9ecef';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.classList.contains('active')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            User Records
          </NavLink>
        )}
      </nav>
    </aside>
  )
}
