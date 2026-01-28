import React, { useState } from 'react';

const PasswordInput = ({
  id,
  placeholder = "Enter your password",
  register,
  required = false,
  className = "form-control border-start-0 border-end-0 ps-0 shadow-none",
  style = { borderLeft: 'none', borderRight: 'none', transition: 'border-color 0.3s' },
  size = "input-group-lg",
  icon = "bi-lock-fill",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`input-group ${size}`}>
      <span className="input-group-text bg-white border-end-0">
        <i className={`bi ${icon} text-primary`}></i>
      </span>
      <input
        type={showPassword ? 'text' : 'password'}
        className={className}
        id={id}
        placeholder={placeholder}
        {...register}
        required={required}
        style={style}
        {...props}
      />
      <span
        className="input-group-text bg-white border-start-0"
        style={{ cursor: 'pointer', transition: 'color 0.3s' }}
        onClick={() => setShowPassword(!showPassword)}
      >
        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-primary`}></i>
      </span>
    </div>
  );
};

export default PasswordInput;
