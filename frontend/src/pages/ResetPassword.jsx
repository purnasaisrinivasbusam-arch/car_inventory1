 import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api';

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenValidating, setTokenValidating] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage('Invalid reset link. No token provided.');
      setTokenValidating(false);
    } else {
      // Token is present, we can proceed - it will be validated when form is submitted
      setIsValidToken(true);
      setTokenValidating(false);
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      setMessage(res.data.message);
      
      // Store the new token and user info if provided
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.dispatchEvent(new Event('login'));
      }
      
      // Redirect to login or dashboard after successful reset
      setTimeout(() => {
        if (res.data.user && res.data.token) {
          // Auto-login user to their dashboard
          if (res.data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          navigate('/login');
        }
      }, 2000);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Password reset failed');
      console.error('Reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (tokenValidating) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="card-title text-center mb-4">Reset Password</h2>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Validating...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !isValidToken) {
    return (
      <div className="container mt-5" style={{ backgroundImage: `url('c:\Users\DELL\Pictures\download (1).jpg')` }}>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="card-title text-center mb-4">Reset Password</h2>
                <div className="alert alert-danger">{message}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ backgroundImage: `url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxATEhUSEhIVFhUVFRUVFhUXFxcYFhcVFhUXFxUVFRUZHSggGB0lHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFxAQGi8dHR8tLS0tLS0rLS0tKy0tKy0tLS0tLSstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAI8BYQMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAADAAIEBQYBBwj/xABMEAACAAQDAwcHCQYCCQUAAAABAgADERIEITEFQVEGE2FxgZGhFCIyUrHB0RVCU3KSotLh8CMzQ2KCwpOyBxZEY3ODlOLxJDSEo8P/xAAZAQEBAQEBAQAAAAAAAAAAAAAAAQIDBAX/xAAhEQEBAQACAQUBAQEAAAAAAAAAARECEiEDBDFRYUFxIv/aAAwDAQACEQMRAD8A...')` }}>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Reset Password</h2>
              {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                  {message}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                    disabled={loading}
                  />
                  {errors.newPassword && <div className="invalid-feedback">{errors.newPassword.message}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === watch('newPassword') || 'Passwords do not match'
                    })}
                    disabled={loading}
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}