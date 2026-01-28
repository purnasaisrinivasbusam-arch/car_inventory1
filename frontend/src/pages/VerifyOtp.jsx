import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('pendingUserId');
    if (!userId) {
      navigate('/register');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const userId = localStorage.getItem('pendingUserId');
    if (!userId) {
      setError('No pending verification found. Please register first.');
      setLoading(false);
      return;
    }

    try {
      const res = await API.post('/auth/verify-otp', { userId, otp });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.removeItem('pendingUserId');
      window.dispatchEvent(new Event('login'));
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundImage: `url(https://wallpaperaccess.com/full/229227.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="card p-4" style={{ width: '400px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Verify Your Account</h2>
          <p className="text-center text-muted mb-4">
            Enter the 6-digit OTP sent to your email
          </p>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">OTP</label>
              <input
                type="text"
                className="form-control text-center"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
                style={{ fontSize: '1.2rem', letterSpacing: '0.5rem' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
          <div className="text-center mt-3">
            <button
              className="btn btn-link"
              onClick={() => navigate('/register')}
            >
              Back to Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
