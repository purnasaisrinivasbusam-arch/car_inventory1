const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, employeeId } = req.body;
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !employeeId) return res.status(400).json({ message: 'All fields are required' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
    if (employeeId.length > 16) return res.status(400).json({ message: 'Employee ID must be 16 characters or less' });

    // Check if email already exists in verified User collection
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    // Check if pending user exists
    const pendingExists = await PendingUser.findOne({ email });
    
    // If pending user exists, check if OTP has expired
    if (pendingExists) {
      const now = new Date();
      // If OTP has expired, allow re-registration by deleting the old pending user
      if (pendingExists.otpExpires < now) {
        console.log('Expired pending user found, deleting and allowing re-registration for email:', email);
        await PendingUser.deleteOne({ email });
      } else {
        // OTP is still valid, don't allow registration
        return res.status(400).json({ message: 'Email already registered. Please verify your OTP or wait for it to expire.' });
      }
    }

    const hash = await bcrypt.hash(password, 10);
    const name = `${firstName} ${lastName}`;

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const pendingUser = await PendingUser.create({ firstName, lastName, name, email, phone, password: hash, employeeId, otp, otpExpires });

    // Send OTP email
    await sendEmail(
      email,
      'OTP Verification - Car Portal',
      `Your OTP for account verification is: ${otp}. This OTP will expire in 10 minutes.`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">OTP Verification</h2>
          <p>You have successfully registered for the Car Portal.</p>
          <p>Your OTP for account verification is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0;">${otp}</div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">Car Portal Support Team</p>
        </div>
      `
    );

    res.json({ message: 'Registration successful. Please check your email for OTP verification.', userId: pendingUser._id });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
};

// exports.login = async (req, res) => {
//   try {
//     const { email, password, loginType } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ message: 'Invalid credentials' });
//     // Use ternary operator to check role match
//     user.role !== loginType ? res.status(403).json({ message: `You are not authorized to login as ${loginType}` }) : (() => {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
//       res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
//     })();
//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { email, password, loginType } = req.body;

    // 1️⃣ Check email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2️⃣ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Check role match
    if (user.role !== loginType) {
      return res.status(403).json({ message: `You are not authorized to login as ${loginType}` });
    }

    // 4️⃣ Generate JWT (role comes from DB ✅)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // 5️⃣ Success response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Forgot password request for:', email);
    
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    console.log('User found, generating reset token...');
    
    // Generate reset token (valid for 1 hour) with email included for verification
    const resetToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create reset link with explicit localhost:5173 if FRONTEND_URL not set
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    console.log('Reset link:', resetLink);
    console.log('Sending email to:', email);

    // Send email
    await sendEmail(
      email,
      'Password Reset Request - Car Portal',
      `Click the link to reset your password: ${resetLink}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>You requested to reset your password for your Car Portal account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #667eea; word-break: break-all;">${resetLink}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">Car Portal Support Team</p>
        </div>
      `
    );

    console.log('✅ Email sent successfully to:', email);
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.', token: resetToken, userId: user._id });
  } catch (err) {
    console.error('❌ Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) return res.status(400).json({ message: 'All fields are required' });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    // Generate new JWT token for the user after password reset
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    console.log('✅ Password reset successfully for user:', user.email);
    res.json({ 
      message: 'Password reset successfully', 
      token: newToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Reset password error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }
    res.status(500).json({ message: 'Password reset failed. Please try again.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ message: 'User ID and OTP are required' });

    const pendingUser = await PendingUser.findById(userId);
    if (!pendingUser) return res.status(404).json({ message: 'Pending user not found' });

    if (!pendingUser.otp || pendingUser.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    if (pendingUser.otpExpires < new Date()) return res.status(400).json({ message: 'OTP has expired' });

    // Create verified user from pending user data
    const user = await User.create({
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      name: pendingUser.name,
      email: pendingUser.email,
      phone: pendingUser.phone,
      password: pendingUser.password,
      employeeId: pendingUser.employeeId,
      role: pendingUser.role,
      isVerified: true
    });

    // Delete pending user
    await PendingUser.deleteOne({ _id: userId });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get single user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { firstName, lastName, email, phone, employeeId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (firstName || lastName) user.name = `${user.firstName} ${user.lastName}`;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (employeeId) user.employeeId = employeeId;

    await user.save();
    res.json({ message: 'User updated successfully', user: user.toObject() });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: err.message });
  }
};