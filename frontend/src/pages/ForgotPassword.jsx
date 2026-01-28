import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import API from '../api'

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [resetToken, setResetToken] = useState(null)

  const onSubmit = async (data) => {
    if (submitted) return
    setLoading(true)
    setError('')
    setSuccess('')
    setSubmitted(true)
    try {
      const res = await API.post('/auth/forgot-password', data)
      setSuccess(res.data.message || 'Password reset instructions sent to your email')
      // Store the reset token if provided by the backend
      if (res.data.token) {
        setResetToken(res.data.token)
        sessionStorage.setItem('resetToken', res.data.token)
        sessionStorage.setItem('resetEmail', data.email)
      }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to send reset instructions. Please try again.')
      setSubmitted(false)
    } finally {
      setLoading(false)
    }
  }

  // Sports-themed background image from a free source
  const backgroundImage = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1470&q=80'  // Mercedes-Benz car image

  return (
    <div
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }}
      />
      {/* Centered form container */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '2rem 3rem',
          width: '100%',
          maxWidth: '400px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <input
            type="email"
            placeholder="Enter your email address"
            {...register('email')}
            required
            disabled={loading || submitted}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginBottom: '1.25rem',
              outline: 'none',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              transition: 'border-color 0.3s ease',
              width: '100%',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#667eea')}
            onBlur={(e) => (e.target.style.borderColor = '#ccc')}
          />
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px',
                fontSize: '0.9rem',
                border: '1px solid #f5c6cb',
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
                fontSize: '0.9rem',
                border: '1px solid #c3e6cb',
              }}
            >
              {success}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || submitted}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              padding: '0.75rem 1rem',
              fontSize: '1.1rem',
              fontWeight: '700',
              borderRadius: '8px',
              border: 'none',
              cursor: loading || submitted ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 8px rgba(102, 126, 234, 0.5)',
              transition: 'background-color 0.3s ease',
              width: '100%',
              opacity: loading || submitted ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading && !submitted) e.currentTarget.style.backgroundColor = '#556cd6'
            }}
            onMouseLeave={(e) => {
              if (!loading && !submitted) e.currentTarget.style.backgroundColor = '#667eea'
            }}
          >
            {loading ? 'Sending...' : submitted ? 'Check your email' : 'Send Reset Instructions'}
          </button>
        </form>
      </div>
    </div>
  )
}
