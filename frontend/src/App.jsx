import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import CarForm from './pages/CarForm'
import RecordsList from './pages/RecordsList'
import RecordDetails from './pages/RecordDetails'
import UserRecordsList from './pages/UserRecordsList'
import UserRecordDetails from './pages/UserRecordDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'

import Welcome from './pages/Welcome';

export default function App(){
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add global error handler
    const errorHandler = (event) => {
      console.error('Global error:', event.error);
      setError(event.error?.message || 'An error occurred');
    };
    window.addEventListener('error', errorHandler);

    // Verify token on app load
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await fetch('https://car-inventory1-hc9s.onrender.com/api/auth/verify', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            setToken(storedToken);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    verifyToken();

    // Listen for login event to update token state
    const handleLogin = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('login', handleLogin);

    // Listen for logout event to clear token state
    const handleLogout = () => {
      setToken(null);
    };
    window.addEventListener('logout', handleLogout);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      <Header />
      {error && (
        <div className="alert alert-danger m-2" role="alert">
          {error}
          <button type="button" className="btn-close float-end" onClick={() => setError(null)}></button>
        </div>
      )}
      <div className="d-flex flex-grow-1">
        {token && <Sidebar />}
        <main className="flex-grow-1 main-content">
          <div className="container-fluid py-4">
            <Routes>
              <Route path="/" element={token ? <Dashboard /> : <Navigate to="/welcome" />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard/>
                </ProtectedRoute>
              } />
              <Route path="/user-records" element={
                <ProtectedRoute adminOnly={true}>
                  <UserRecordsList/>
                </ProtectedRoute>
              } />
              <Route path="/user-records/:id" element={
                <ProtectedRoute adminOnly={true}>
                  <UserRecordDetails/>
                </ProtectedRoute>
              } />
              <Route path="/user-records/:id/edit" element={
                <ProtectedRoute adminOnly={true}>
                  <UserRecordDetails/>
                </ProtectedRoute>
              } />
              <Route path="/entry" element={
                <ProtectedRoute>
                  <CarForm/>
                </ProtectedRoute>
              } />
              <Route path="/records" element={
                <ProtectedRoute>
                  <RecordsList/>
                </ProtectedRoute>
              } />
              <Route path="/record/:id" element={
                <ProtectedRoute>
                  <RecordDetails/>
                </ProtectedRoute>
              } />
              <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login/>} />
              <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register/>} />
              <Route path="/verify-otp" element={token ? <Navigate to="/" replace /> : <VerifyOtp/>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
