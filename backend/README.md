# Car Portal Backend

This is the backend for the Car Inventory project, built with Node.js, Express, and MongoDB.

## Features

- User authentication (register, login, forgot password, reset password)
- Car inventory management
- File uploads
- Email notifications (Nodemailer with Gmail SMTP)

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file
4. Run the server: `npm start` or `npm run dev` (with nodemon)

## Environment Variables

Create a `.env` file in the backend root with the following variables:

```
# Database
MONGO_URI=mongodb://localhost:27017/car_portal

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail SMTP)
EMAIL_USER=noreply@carportal.com
EMAIL_PASS=your-gmail-app-password-here

# Frontend URL
FRONTEND_URL=http://localhost:5174

# Server Port
PORT=5000
```

## Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: Go to Google Account settings > Security > App passwords
3. Use the app password as `EMAIL_PASS` in the `.env` file
4. The `EMAIL_USER` should be `noreply@carportal.com` (or your Gmail address if testing)

## Scripts

* `npm start`: Starts the backend server.
* `npm run dev`: Starts the server with nodemon for development.
* `npm run create-admin`: Creates an admin user.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify` - Verify JWT token

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get a single car by ID
- `POST /api/cars` - Add a new car (authenticated)
- `PUT /api/cars/:id` - Update a car (authenticated)
- `DELETE /api/cars/:id` - Delete a car (authenticated)

## Forgot Password Flow

1. User submits email on forgot password form
2. Backend generates JWT token (60 seconds expiry)
3. Email sent with reset link: `${FRONTEND_URL}/reset-password?token=${token}`
4. User clicks link, enters new password
5. Backend verifies token, hashes password with bcrypt, updates DB
6. Success/error messages returned

## Testing with Postman

1. Start server: `npm start`
2. Import endpoints and test authentication flow
3. For forgot password: POST to `/api/auth/forgot-password` with `{"email": "user@example.com"}`
4. For reset password: POST to `/api/auth/reset-password` with `{"token": "jwt-token", "newPassword": "newpass", "confirmPassword": "newpass"}`
<!-- MONGO_URI=mongodb://localhost:27017/car_portal
MONGO_URI="mongodb+srv://bharath:bharath@cluster0.mcnlrgp.mongodb.net/?appName=Cluster0"
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=bharath200214@gmail.com
EMAIL_PASS=zvqd jteg vnhq qqbh
FRONTEND_URL=http://localhost:5174
PORT=5000 -->