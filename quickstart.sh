#!/bin/bash

echo ""
echo "============================================"
echo "  VISUAL AI CLASSIFIER - QUICK START"
echo "  ANTHONY OLUEBUBECHUKWU STEPHEN"
echo "  CYBERSECURITY - 20231388422"
echo "============================================"
echo ""

# ── Backend setup ────────────────────────────────────────────────────────────
echo "[1/4] Setting up Python backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
[ ! -f .env ] && cp .env.example .env
echo "✅ Backend dependencies installed"
echo ""

# ── Start backend in background ──────────────────────────────────────────────
echo "[2/4] Starting backend server on port 5000..."
python app.py &
BACKEND_PID=$!
sleep 3
echo "✅ Backend running (PID $BACKEND_PID)"
echo ""

# ── Frontend setup ───────────────────────────────────────────────────────────
echo "[3/4] Setting up frontend..."
cd ../frontend
npm install
[ ! -f .env.local ] && cp .env.example .env.local
echo "✅ Frontend dependencies installed"
echo ""

# ── Start frontend ───────────────────────────────────────────────────────────
echo "[4/4] Starting frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo "============================================"
echo "  ✅  BOTH SERVERS ARE RUNNING!"
echo ""
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "  Open http://localhost:5173 in your browser"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "============================================"
echo ""

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID
