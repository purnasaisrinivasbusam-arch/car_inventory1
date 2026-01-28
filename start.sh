#!/bin/bash

echo "Starting Car Portal Application..."
echo ""

# Start backend in background
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Function to kill both processes on script exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
