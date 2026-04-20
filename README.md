# 🧠 Visual AI Image Classifier

A production-ready deep learning web app that classifies images into **5 categories** using a **Convolutional Neural Network (CNN)** powered by **TensorFlow** and **MobileNetV2**.

---

## 👤 Student Info

| Field              | Value                              |
|--------------------|------------------------------------|
| **Name**           | ANTHONY OLUEBUBECHUKWU STEPHEN     |
| **Department**     | CYBERSECURITY                      |
| **Reg. Number**    | 20231388422                        |

---

## 🎯 What It Classifies

| Category | Examples                              |
|----------|---------------------------------------|
| 🐕 Dog   | Any dog breed, puppies, canines       |
| 🐱 Cat   | Domestic cats, kittens, big cats      |
| 🏠 House | Buildings, houses, barns, churches    |
| 🔤 Letter| Text, letters A–Z, documents          |
| 🔢 Number| Digits 0–9, clocks, calculators       |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Flask (Python), TensorFlow 2.x, MobileNetV2 CNN
- **Deployment:** Render.com (free tier supported)

---

## 📁 Project Structure

```
visual-ai-classifier/
├── backend/
│   ├── app.py               ← Flask API + TensorFlow model
│   ├── requirements.txt     ← Python dependencies
│   ├── Procfile             ← Render start command
│   └── .env.example         ← Backend env template
├── frontend/
│   ├── src/
│   │   ├── App.jsx          ← Main React component
│   │   ├── main.jsx         ← React entry point
│   │   └── index.css        ← Tailwind CSS
│   ├── index.html           ← HTML template
│   ├── package.json         ← npm dependencies
│   ├── vite.config.js       ← Vite config
│   ├── tailwind.config.js   ← Tailwind config
│   ├── postcss.config.js    ← PostCSS config
│   └── .env.example         ← Frontend env template
├── render.yaml              ← Render deployment config
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup (Run on Your Computer)

### Prerequisites
- Python 3.9+ → https://python.org
- Node.js 16+  → https://nodejs.org
- Git           → https://git-scm.com

---

### Step 1 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies (TensorFlow will download ~500MB)
pip install -r requirements.txt

# Create your .env file
cp .env.example .env

# Start the backend server
python app.py
# ✅ Running at http://localhost:5000
```

### Step 2 — Frontend Setup

```bash
# Open a NEW terminal window
cd frontend

# Install npm packages
npm install

# Create your environment file
cp .env.example .env.local
# Edit .env.local — make sure VITE_API_URL=http://localhost:5000

# Start the frontend
npm run dev
# ✅ Open http://localhost:5173 in your browser
```

### Step 3 — Test It

1. Open **http://localhost:5173**
2. Upload a dog/cat/house image
3. Click **Classify Image**
4. See your result with confidence score!

---

## 🌐 Deploy to Render (Free Hosting)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Visual AI Classifier"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/visual-ai-classifier.git
git push -u origin main
```

### Step 2 — Deploy Backend

1. Go to **https://render.com** and sign up (free)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Set these settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
5. Click **Create Web Service**
6. Wait ~5 minutes for deploy
7. Copy your backend URL (e.g. `https://visual-ai-classifier-api.onrender.com`)

### Step 3 — Deploy Frontend

1. Click **New → Static Site**
2. Connect same GitHub repository
3. Set these settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: paste your backend URL from Step 2
5. Click **Create Static Site**
6. Wait ~3 minutes
7. Your site is live! 🎉

---

## 🔧 API Endpoints

| Method | Endpoint    | Description                        |
|--------|-------------|------------------------------------|
| GET    | `/health`   | Check if the server is running     |
| POST   | `/classify` | Classify an uploaded image         |
| GET    | `/info`     | Get model and API information      |

### Example `/classify` Request

```bash
curl -X POST http://localhost:5000/classify \
  -F "image=@/path/to/your/image.jpg"
```

### Example Response

```json
{
  "success": true,
  "class": "dog",
  "confidence": 0.87,
  "emoji": "🐕",
  "description": "A canine/dog was detected in this image.",
  "raw_label": "Golden Retriever",
  "top_predictions": [
    { "label": "Golden Retriever", "confidence": 0.87 },
    { "label": "Labrador Retriever", "confidence": 0.06 },
    ...
  ]
}
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| `pip install` fails | Make sure you activated your virtual environment |
| TensorFlow install slow | Normal — it's ~500MB, wait for it |
| `npm run dev` fails | Run `npm install` first |
| CORS error in browser | Make sure backend is running on port 5000 |
| "Model not loaded" error | Check backend terminal for TensorFlow errors |
| Image not classified | Try a clearer, well-lit image |

---

## 📦 First Run Note

On first startup, the backend will **download the MobileNetV2 weights** (~14MB) from the internet. This is automatic and only happens once. Subsequent starts are fast.

---

## 🎓 Concepts Used

- **CNN (Convolutional Neural Network)** — extracts spatial features from images
- **Transfer Learning** — MobileNetV2 pretrained on 1000 ImageNet classes
- **REST API** — Flask serves the model as an HTTP endpoint
- **React SPA** — single-page app with dark/light mode and responsive design
- **Gunicorn** — production WSGI server for Python

---

*Built with ❤️ using TensorFlow, Flask & React*
