import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Loader2, CheckCircle2, AlertCircle, Menu, X,
  Moon, Sun, Home, User, Info, Shield, Hash, Cpu,
  Zap, Target, Brain, ChevronRight, RotateCcw, Image
} from 'lucide-react';

const USER_INFO = {
  name: 'ANTHONY OLUEBUBECHUKWU STEPHEN',
  department: 'CYBERSECURITY',
  regNumber: '20231388422',
  initials: 'AOS',
};

const CLASS_CONFIG = {
  dog:     { emoji: '🐕', label: 'Dog',     gradient: 'from-orange-500 to-amber-400',    bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  cat:     { emoji: '🐱', label: 'Cat',     gradient: 'from-purple-600 to-pink-500',     bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  house:   { emoji: '🏠', label: 'House',   gradient: 'from-sky-500 to-cyan-400',        bg: 'bg-sky-500/10',    border: 'border-sky-500/30',    text: 'text-sky-400'    },
  letter:  { emoji: '🔤', label: 'Letter',  gradient: 'from-emerald-500 to-green-400',   bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',text: 'text-emerald-400'},
  number:  { emoji: '🔢', label: 'Number',  gradient: 'from-yellow-500 to-orange-400',   bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  unknown: { emoji: '❓', label: 'Unknown', gradient: 'from-slate-500 to-slate-400',     bg: 'bg-slate-500/10',  border: 'border-slate-500/30',  text: 'text-slate-400'  },
};

const CATEGORIES = [
  { key: 'dog',    emoji: '🐕', label: 'Dogs',    desc: 'Any breed or canine' },
  { key: 'cat',    emoji: '🐱', label: 'Cats',    desc: 'Felines & big cats' },
  { key: 'house',  emoji: '🏠', label: 'Houses',  desc: 'Buildings & structures' },
  { key: 'letter', emoji: '🔤', label: 'Letters', desc: 'Text, A–Z characters' },
  { key: 'number', emoji: '🔢', label: 'Numbers', desc: 'Digits 0–9' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [darkMode, setDarkMode]       = useState(true);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [activeTab, setActiveTab]     = useState('home');
  const [image, setImage]             = useState(null);       // File object
  const [preview, setPreview]         = useState(null);       // base64 URL
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [history, setHistory]         = useState([]);
  const fileInputRef = useRef(null);
  const menuRef      = useRef(null);

  // Apply dark class to html root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP, GIF, BMP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Maximum allowed size is 10 MB.');
      return;
    }
    setImage(file);
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  }, []);

  const handleClassify = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await fetch(`${API_URL}/classify`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Classification failed. Please try again.');
      }

      setResult(data);

      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        preview,
        filename: image.name,
        ...data,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 9)]);  // keep last 10

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Theme helpers ──────────────────────────────────────────────────────────
  const dm = darkMode;
  const bg    = dm ? 'bg-slate-950'           : 'bg-gray-50';
  const card  = dm ? 'bg-slate-900'           : 'bg-white';
  const cardB = dm ? 'border-slate-800'       : 'border-gray-200';
  const text  = dm ? 'text-slate-100'         : 'text-slate-900';
  const muted = dm ? 'text-slate-400'         : 'text-slate-500';
  const sub   = dm ? 'text-slate-300'         : 'text-slate-600';
  const navBg = dm ? 'bg-slate-950/90'        : 'bg-white/90';
  const navB  = dm ? 'border-slate-800'       : 'border-gray-200';
  const inp   = dm ? 'bg-slate-800'           : 'bg-gray-100';

  // ─── Result config ───────────────────────────────────────────────────────────
  const cfg = result ? (CLASS_CONFIG[result.class] || CLASS_CONFIG.unknown) : null;
  const pct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>

      {/* ── Animated background grid ── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${dm ? '#94a3b8' : '#64748b'} 1px,transparent 1px),
                            linear-gradient(90deg,${dm ? '#94a3b8' : '#64748b'} 1px,transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <nav className={`sticky top-0 z-40 ${navBg} ${navB} border-b backdrop-blur-md transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-bold leading-none bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent`}>
                Visual AI
              </p>
              <p className={`text-[10px] ${muted} leading-none mt-0.5`}>Image Classifier</p>
            </div>
          </div>

          {/* Nav links – desktop */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { id: 'home',    icon: Home,   label: 'Classify' },
              { id: 'about',   icon: Info,   label: 'About'    },
              { id: 'history', icon: Target, label: `History ${history.length > 0 ? `(${history.length})` : ''}` },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
                  ${activeTab === id
                    ? 'bg-blue-500/15 text-blue-400'
                    : `${sub} hover:${text} hover:bg-white/5`}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2" ref={menuRef}>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!dm)}
              title="Toggle theme"
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200
                ${dm ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-200 text-slate-600 hover:bg-gray-300'}`}
            >
              {dm ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              title="Menu"
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200
                ${dm ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-200 text-slate-600 hover:bg-gray-300'}`}
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Hamburger dropdown */}
            {menuOpen && (
              <div className={`absolute top-[68px] right-4 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50
                ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}
                style={{ animation: 'slideDown 0.2s ease' }}
              >
                {/* Profile header */}
                <div className="p-5 bg-gradient-to-br from-blue-600 to-cyan-500">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg border-2 border-white/40 shadow-lg">
                      {USER_INFO.initials}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-snug">{USER_INFO.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Shield className="w-3 h-3 text-white/70" />
                        <p className="text-white/80 text-xs font-medium">{USER_INFO.department}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`mt-4 rounded-lg px-3 py-2 bg-white/10 backdrop-blur border border-white/20 flex items-center gap-2`}>
                    <Hash className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-white/70 text-xs">Reg. No:</span>
                    <span className="text-white text-xs font-mono font-bold">{USER_INFO.regNumber}</span>
                  </div>
                </div>

                {/* Mobile nav links */}
                <div className="p-3 md:hidden">
                  <p className={`text-[10px] uppercase tracking-widest font-semibold ${muted} px-2 mb-2`}>Navigation</p>
                  {[
                    { id: 'home',    icon: Home,   label: 'Classify Image' },
                    { id: 'about',   icon: Info,   label: 'About Project'  },
                    { id: 'history', icon: Target, label: 'History'        },
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => { setActiveTab(id); setMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200
                        ${activeTab === id
                          ? 'bg-blue-500/15 text-blue-400'
                          : `${sub} hover:${text} hover:bg-white/5`}`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tech stack pill */}
                <div className={`px-4 pb-4 ${dm ? '' : ''}`}>
                  <div className={`rounded-xl p-3 border ${dm ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-[10px] uppercase tracking-widest font-semibold ${muted} mb-2`}>Powered by</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['TensorFlow', 'MobileNetV2', 'CNN', 'Flask', 'React'].map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-xs font-medium border border-blue-500/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ═══════════════ HOME / CLASSIFY TAB ═══════════════ */}
        {activeTab === 'home' && (
          <div>
            {/* Hero */}
            {!preview && (
              <div className="text-center mb-12" style={{ animation: 'fadeIn 0.6s ease' }}>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                  <Zap className="w-3.5 h-3.5" />
                  Deep Learning · CNN · TensorFlow
                </div>

                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 ${text}`}>
                  Welcome to{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Visual AI
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Image Classifier
                  </span>
                </h1>

                <p className={`text-base sm:text-lg max-w-2xl mx-auto mb-3 leading-relaxed ${sub}`}>
                  Harness the power of a{' '}
                  <span className={`font-semibold ${text}`}>Convolutional Neural Network (CNN)</span>{' '}
                  to instantly identify what's inside any image. Powered by{' '}
                  <span className="text-orange-400 font-semibold">TensorFlow</span> and a pretrained
                  MobileNetV2 model, this classifier can recognise:
                </p>
                <p className={`text-sm ${muted} mb-10`}>
                  🐕 Dogs &nbsp;·&nbsp; 🐱 Cats &nbsp;·&nbsp; 🏠 Houses &nbsp;·&nbsp; 🔤 Letters &nbsp;·&nbsp; 🔢 Numbers
                </p>

                {/* Category cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto mb-8">
                  {CATEGORIES.map(({ key, emoji, label, desc }) => {
                    const c = CLASS_CONFIG[key];
                    return (
                      <div key={key}
                        className={`rounded-2xl p-4 border ${card} ${cardB}
                          hover:border-blue-500/40 hover:scale-105 transition-all duration-200 cursor-default`}
                      >
                        <div className="text-3xl mb-2">{emoji}</div>
                        <p className={`font-bold text-sm ${text}`}>{label}</p>
                        <p className={`text-[11px] ${muted} mt-0.5`}>{desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload zone */}
            {!preview && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer rounded-3xl border-2 border-dashed p-12 sm:p-20 transition-all duration-300
                  ${dragOver
                    ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                    : `${dm ? 'border-slate-700 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-800/60'
                              : 'border-gray-300 bg-white/50 hover:border-blue-400 hover:bg-blue-50/30'}`
                  }`}
                style={{ animation: 'fadeIn 0.5s ease' }}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110
                    bg-gradient-to-br from-blue-500 to-cyan-400 shadow-blue-500/30`}
                  >
                    <Upload className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <p className={`text-xl sm:text-2xl font-bold ${text} mb-1`}>
                      {dragOver ? 'Drop it here!' : 'Upload Your Image'}
                    </p>
                    <p className={`${muted} text-sm`}>
                      Drag & drop, or <span className="text-blue-400 font-semibold">click to browse</span>
                    </p>
                  </div>
                  <div className={`flex flex-wrap justify-center gap-2 mt-2`}>
                    {['JPG', 'PNG', 'WebP', 'GIF', 'BMP'].map(f => (
                      <span key={f} className={`px-2.5 py-1 rounded-full text-xs font-medium border
                        ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-100 border-gray-200 text-slate-500'}`}>
                        {f}
                      </span>
                    ))}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                      ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-100 border-gray-200 text-slate-500'}`}>
                      Max 10 MB
                    </span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Image preview + classify */}
            {preview && !result && (
              <div className="max-w-xl mx-auto" style={{ animation: 'fadeIn 0.4s ease' }}>
                <div className={`rounded-3xl overflow-hidden border shadow-2xl ${card} ${cardB}`}>
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <button
                      onClick={reset}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur text-white text-xs font-medium hover:bg-black/70 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Change
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white text-xs font-medium bg-black/50 backdrop-blur rounded-lg px-2.5 py-1 truncate max-w-[200px]">
                        {image?.name}
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className={`text-sm ${muted} mb-4 text-center`}>
                      Ready to classify this image using our CNN model
                    </p>
                    <button
                      onClick={handleClassify}
                      disabled={loading}
                      className={`w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-300 flex items-center justify-center gap-2
                        ${loading
                          ? 'bg-slate-600 cursor-not-allowed opacity-70'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]'
                        }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analysing image…
                        </>
                      ) : (
                        <>
                          <Cpu className="w-5 h-5" />
                          Classify Image
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Result */}
            {result && cfg && (
              <div className="max-w-2xl mx-auto" style={{ animation: 'fadeIn 0.5s ease' }}>
                {/* Result card */}
                <div className={`rounded-3xl overflow-hidden border shadow-2xl ${card} ${cardB} mb-4`}>
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-br ${cfg.gradient} p-6 sm:p-8 text-white`}>
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{cfg.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-1">
                          Classification Result
                        </p>
                        <h2 className="text-4xl font-extrabold tracking-tight">{cfg.label}</h2>
                        <p className="text-sm opacity-80 mt-1">{result.description}</p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 opacity-80 flex-shrink-0" />
                    </div>

                    {/* Confidence bar */}
                    <div className="mt-5">
                      <div className="flex justify-between items-center mb-1.5 text-sm">
                        <span className="font-medium opacity-80">Confidence Score</span>
                        <span className="font-extrabold text-xl">{pct}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-white/90 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image + top predictions */}
                  <div className="grid sm:grid-cols-2 gap-4 p-5">
                    {/* Preview thumbnail */}
                    <div className="rounded-2xl overflow-hidden border h-48 sm:h-auto">
                      <img src={preview} alt="Classified" className="w-full h-full object-cover" />
                    </div>

                    {/* Top predictions */}
                    <div>
                      <p className={`text-xs uppercase tracking-widest font-semibold ${muted} mb-3`}>
                        Top ImageNet Predictions
                      </p>
                      <div className="space-y-2">
                        {result.top_predictions?.slice(0, 5).map((p, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={`text-xs w-4 text-right ${muted}`}>{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-0.5">
                                <span className={`font-medium truncate ${sub}`}>{p.label}</span>
                                <span className={muted}>{(p.confidence * 100).toFixed(1)}%</span>
                              </div>
                              <div className={`h-1.5 rounded-full overflow-hidden ${inp}`}>
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-500`}
                                  style={{ width: `${p.confidence * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`px-5 pb-5 flex gap-3`}>
                    <button
                      onClick={reset}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border
                        ${dm
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          : 'bg-gray-100 border-gray-200 text-slate-700 hover:bg-gray-200'}`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Classify Again
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 transition-opacity"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Target className="w-4 h-4" /> View History
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className={`max-w-xl mx-auto mt-4 rounded-2xl p-4 border flex items-start gap-3
                ${dm ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}
                style={{ animation: 'fadeIn 0.3s ease' }}
              >
                <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${dm ? 'text-red-400' : 'text-red-600'}`} />
                <div>
                  <p className={`font-semibold text-sm mb-0.5 ${dm ? 'text-red-300' : 'text-red-700'}`}>Error</p>
                  <p className={`text-sm ${dm ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ ABOUT TAB ═══════════════ */}
        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto" style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 className={`text-3xl font-extrabold ${text} mb-2`}>About This Project</h2>
            <p className={`${muted} mb-8`}>A deep learning image classifier built with TensorFlow & CNN</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: Brain,  label: 'Concept',    value: 'Deep Learning · Convolutional Neural Network (CNN)' },
                { icon: Cpu,    label: 'Model',      value: 'MobileNetV2 (pretrained on ImageNet)' },
                { icon: Zap,    label: 'Framework',  value: 'TensorFlow 2.x + Flask REST API' },
                { icon: Target, label: 'Categories', value: 'Dogs · Cats · Houses · Letters · Numbers' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className={`rounded-2xl p-5 border ${card} ${cardB} flex items-start gap-4`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-widest font-semibold ${muted} mb-1`}>{label}</p>
                    <p className={`text-sm font-medium ${text}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Student info card */}
            <div className={`rounded-2xl border overflow-hidden ${card} ${cardB}`}>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
                    {USER_INFO.initials}
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-lg leading-tight">{USER_INFO.name}</p>
                    <p className="text-white/70 text-sm mt-0.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> {USER_INFO.department}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs uppercase tracking-widest font-semibold ${muted} mb-1`}>Department</p>
                  <p className={`font-semibold ${text}`}>{USER_INFO.department}</p>
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-widest font-semibold ${muted} mb-1`}>Registration No.</p>
                  <p className={`font-mono font-bold ${text}`}>{USER_INFO.regNumber}</p>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className={`rounded-2xl border p-5 mt-4 ${card} ${cardB}`}>
              <p className={`font-bold ${text} mb-4`}>How It Works</p>
              <div className="space-y-3">
                {[
                  { step: '01', title: 'Upload',   desc: 'Select or drag in any image (JPG, PNG, WebP…)' },
                  { step: '02', title: 'Preprocess',desc: 'Image is resized to 224×224 and normalised for MobileNetV2' },
                  { step: '03', title: 'Inference', desc: 'TensorFlow CNN runs a forward pass and returns top-10 predictions' },
                  { step: '04', title: 'Classify',  desc: 'Predictions are mapped to 5 custom categories with a confidence score' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${text}`}>{title}</p>
                      <p className={`text-xs ${muted}`}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ HISTORY TAB ═══════════════ */}
        {activeTab === 'history' && (
          <div className="max-w-3xl mx-auto" style={{ animation: 'fadeIn 0.4s ease' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-3xl font-extrabold ${text}`}>History</h2>
                <p className={`${muted} text-sm`}>{history.length} classification{history.length !== 1 ? 's' : ''} this session</p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                    ${dm ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-200 text-slate-500 hover:bg-gray-100'}`}
                >
                  Clear all
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className={`rounded-3xl border ${card} ${cardB} p-16 text-center`}>
                <Image className={`w-12 h-12 mx-auto mb-4 ${muted}`} />
                <p className={`font-bold ${text} mb-1`}>No classifications yet</p>
                <p className={`${muted} text-sm`}>Upload an image and classify it to see results here.</p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="mt-4 inline-flex items-center gap-1.5 text-blue-400 text-sm font-semibold hover:underline"
                >
                  Go classify an image <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => {
                  const c = CLASS_CONFIG[item.class] || CLASS_CONFIG.unknown;
                  return (
                    <div key={item.id} className={`rounded-2xl border overflow-hidden flex items-center gap-4 p-4 ${card} ${cardB} hover:border-blue-500/30 transition-colors`}>
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.preview} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xl">{c.emoji}</span>
                          <span className={`font-bold ${text}`}>{c.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text} border ${c.border}`}>
                            {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                        <p className={`text-xs ${muted} truncate`}>{item.filename}</p>
                        <p className={`text-xs ${muted}`}>{item.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className={`mt-20 border-t ${navB} py-6 px-4 text-center`}>
        <p className={`text-xs ${muted}`}>
          Visual AI Classifier · Built with TensorFlow & React ·{' '}
          <span className="text-blue-400 font-medium">{USER_INFO.name}</span> · {USER_INFO.department} · {USER_INFO.regNumber}
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:none } }
      `}</style>
    </div>
  );
}
