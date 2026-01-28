import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const { register, handleSubmit, watch } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    try {
      const res = await API.post('/auth/register', data);
      // Store userId for OTP verification
      localStorage.setItem('pendingUserId', res.data.userId);
      navigate('/verify-otp');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="register-form-container">
      <div className="register-form">
        <div className="text-center">
          <h2>Create an Account</h2>
          <p>Join our car portal community and find your dream car</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter first name"
                {...register('firstName')}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter last name"
                {...register('lastName')}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              {...register('email')}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Enter phone number"
              {...register('phone')}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Employee ID</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter employee ID (max 16 characters)"
              {...register('employeeId')}
              maxLength="16"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Create a password"
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

          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                required
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Create Account
          </button>

          <div className="text-center mt-3">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}