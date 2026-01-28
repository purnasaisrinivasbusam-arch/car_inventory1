import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', { ...data, loginType });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('login'));
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="login-card card border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="login-title mb-3">Car Portal Login</h1>
                  <p className="text-muted">Welcome back, please login to your account.</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Enter your email"
                      {...register('email')}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        id="password"
                        placeholder="Enter your password"
                        {...register('password')}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  <div className="d-grid gap-3">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      onClick={() => setLoginType('user')}
                    >
                      {loading && loginType === 'user' ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        'Login as User'
                      )}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-secondary"
                      disabled={loading}
                      onClick={() => setLoginType('admin')}
                    >
                      {loading && loginType === 'admin' ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        'Login as Admin'
                      )}
                    </button>
                  </div>
                </form>
                <div className="text-center mt-4">
                  <Link to="/forgot-password" className="text-decoration-none">
                    Forgot your password?
                  </Link>
                </div>
                <div className="text-center mt-3">
                  <p className="text-muted">
                    Don't have an account? <Link to="/register">Sign up</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}