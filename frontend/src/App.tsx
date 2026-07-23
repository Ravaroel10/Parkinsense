/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ViewType, ParticipantInfo, LiveDataPoint, DatasetItem, SystemSettings } from './types';
import ChamberIllustration from './components/ChamberIllustration';
import LiveCharts from './components/LiveCharts';
import RawDataTable from './components/RawDataTable';
import AcquisitionWizard from './components/AcquisitionWizard';
import DatasetsPage from './components/DatasetsPage';
import AboutView from './components/AboutView';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Cpu,
  Database,
  FileText,
  TrendingUp,
  Settings,
  HelpCircle,
  Clock,
  Sun,
  Moon,
  ChevronRight,
  Shield,
  Layers,
  FlaskConical,
  LogOut,
  Atom,
  Calendar,
  Search,
  Bell,
} from 'lucide-react';

// Refined Minimalist Helper Components
const CalendarWidget = ({ localTime }: { localTime: string }) => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const daysInJuly2026 = Array.from({ length: 31 }, (_, i) => i + 1);
  const startOffset = 3; // July 2026 starts on Wednesday (offset 3)
  const activeTrialDays = [8, 15, 21, 28];

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-zinc-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Research Calendar</h4>
        <span className="text-[10px] font-mono text-zinc-400 font-semibold">July 2026</span>
      </div>
      
      <div className="grid grid-cols-7 gap-y-2 text-center text-[10px] font-medium text-zinc-400">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="font-semibold text-zinc-400 text-[9px]">{day}</div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}
        {daysInJuly2026.map((day) => {
          const isActive = activeTrialDays.includes(day);
          const isToday = day === 21; // Our current local date is July 21, 2026
          return (
            <div key={day} className="relative py-0.5 flex flex-col items-center justify-center">
              <span className={`w-6 h-6 flex items-center justify-center text-[10px] rounded-full transition-all ${
                isToday 
                  ? 'bg-black text-white font-bold shadow-xs' 
                  : isActive 
                    ? 'text-black font-bold bg-zinc-100 border border-zinc-200' 
                    : 'text-zinc-600'
              }`}>
                {day}
              </span>
              {isActive && !isToday && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-black"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SystemDetailsCard = () => {
  const details = [
    { label: 'Patient Cohort', value: 'PHASE-II' },
    { label: 'Chamber Temp', value: '28.4 °C' },
    { label: 'Baseline Gas', value: '245.5 kΩ' },
    { label: 'Chamber Flow', value: '1.2 L/min' },
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-zinc-200 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Chamber Details</h4>
        <span className="text-[9px] font-mono text-zinc-400">Real-Time</span>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        {details.map((d, i) => (
          <div key={i} className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/80">
            <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">{d.label}</span>
            <span className="block text-[11px] font-mono font-bold text-black mt-0.5">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResearchBulletinCard = () => {
  const bulletins = [
    { title: 'What is Sebum VOC Desorption?', date: '21 July 2026', icon: '⚡', color: 'bg-zinc-100 text-black border-zinc-200' },
    { title: 'Parkinson biomarker mapping insights', date: '19 July 2026', icon: '🧠', color: 'bg-zinc-100 text-black border-zinc-200' },
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-zinc-200 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Publications</h4>
        <span className="text-[9px] font-mono text-zinc-400">Library</span>
      </div>
      
      <div className="space-y-3">
        {bulletins.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${b.color} border flex items-center justify-center text-sm font-semibold flex-shrink-0`}>
              {b.icon}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-black truncate">{b.title}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{b.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CalibrationCard = () => {
  const protocols = [
    { name: 'Active Sensor Drift bias', status: 'Compensating', val: '0.1 Hz', dot: 'bg-zinc-400' },
    { name: 'Headspace chamber purge', status: 'Stable', val: '1.2 L/m', dot: 'bg-black' },
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-zinc-200 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Array Parameters</h4>
        <span className="text-[9px] font-mono text-zinc-400">Live Calibration</span>
      </div>
      
      <div className="space-y-3">
        {protocols.map((p, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-2 h-2 rounded-full ${p.dot} flex-shrink-0`}></span>
              <div className="text-left min-w-0">
                <p className="text-xs font-semibold text-black truncate">{p.name}</p>
                <p className="text-[10px] text-zinc-500">{p.status}</p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-black bg-zinc-100 px-2 py-1 rounded">
              {p.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};



export default function App() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Navigation / Workspace state
  const [inDashboard, setInDashboard] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewType>('Dashboard');

  // Datasets Database State (clean initial state, persist to localStorage)
  const [datasetsList, setDatasetsList] = useState<DatasetItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const saved = localStorage.getItem('parkinsense_datasets');

    if (saved) {
      try {
        return JSON.parse(saved) as DatasetItem[];
      } catch {
        return [];
      }
    }

    return [];
  });

  useEffect(() => {
    const loadDatasets = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/datasets`);
        if (!response.ok) {
          return;
        }

        const remoteDatasets = await response.json();
        if (Array.isArray(remoteDatasets) && remoteDatasets.length > 0) {
          const normalized = remoteDatasets.map((item: Partial<DatasetItem> & { seriesData?: unknown }) => ({
            ...item,
            seriesData: Array.isArray(item.seriesData) ? item.seriesData : [],
          })) as DatasetItem[];

          setDatasetsList(normalized);
          localStorage.setItem('parkinsense_datasets', JSON.stringify(normalized));
        }
      } catch {
        // Fall back to localStorage state if the backend is unavailable.
      }
    };

    loadDatasets();
  }, []);

  // Persist datasets changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('parkinsense_datasets', JSON.stringify(datasetsList));
    }
  }, [datasetsList]);

  // Active serial session readings (Step 5 logs)
  const [activeReadings, setActiveReadings] = useState<LiveDataPoint[]>([]);

  // Hardware connection states
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);

  // Local Time Clock state
  const [localTime, setLocalTime] = useState<string>('');

  // System Settings state
  const [settings, setSettings] = useState<SystemSettings>({
    theme: 'light',
    language: 'en',
    recordingInterval: 1000,
    samplingRate: 1,
    autoConnect: false,
    autoDownload: true,
    csvDelimiter: ',',
    timeFormat: '24h',
  });

  // Appointment Modal State
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // Clock tick effect
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      if (settings.timeFormat === '12h') {
        setLocalTime(now.toLocaleTimeString('en-US', { hour12: true }));
      } else {
        setLocalTime(now.toLocaleTimeString('en-US', { hour12: false }));
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [settings.timeFormat]);

  // Dark / Light Mode HTML Element toggle - Locked to light mode as requested by user
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  // Append newly finished sessions to Datasets State
 const handleSessionFinished = async (
  participant: ParticipantInfo,
  readings: LiveDataPoint[]
) => {
  const newId = `REC-${Date.now().toString().slice(-6)}`;

  const newFile: DatasetItem = {
    id: newId,
    filename: `VOC_${participant.diagnosis.toUpperCase()}_${participant.participantId}_${participant.sampleId}.csv`,
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    participantId: participant.participantId,
    sampleId: participant.sampleId,
    diagnosis: participant.diagnosis,
    duration:
      readings.length > 0
        ? readings[readings.length - 1].elapsed
        : 0,
    samplesCount: readings.length,
    fileSize: `${((JSON.stringify(readings).length) / 1024).toFixed(1)} KB`,
    operator: participant.operatorName,
    seriesData: readings,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/datasets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFile),
    });

    if (response.ok) {
      const savedDataset = await response.json();
      setDatasetsList((prev) => [savedDataset, ...prev]);
      return;
    }
  } catch {
    // Fall back to local state if the backend is unavailable.
  }

  setDatasetsList((prev) => [newFile, ...prev]);
};

const handleAddDataset = async (newDataset: DatasetItem) => {
  try {
    const response = await fetch(`${API_BASE_URL}/datasets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDataset),
    });

    if (response.ok) {
      const savedDataset = await response.json();
      setDatasetsList((prev) => [savedDataset, ...prev]);
      return;
    }
  } catch {
    // Fall back to local state if the backend is unavailable.
  }

  setDatasetsList((prev) => [newDataset, ...prev]);
};

const handleDeleteDataset = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/datasets/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setDatasetsList((prev) => prev.filter((d) => d.id !== id));
      return;
    }
  } catch {
    // Fall back to local state if the backend is unavailable.
  }

  setDatasetsList((prev) => prev.filter((d) => d.id !== id));
};

  return (
    <div className="min-h-screen font-sans bg-[#f4f4f5] text-black transition-colors duration-150">
      
      {/* LANDING PAGE ROUTE */}
      {!inDashboard ? (
        <div className="flex flex-col bg-[#f4f4f5] text-zinc-900 w-full overflow-x-hidden font-sans min-h-screen">
          
          {/* Appointment Modal */}
          <AnimatePresence>
            {appointmentOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 relative overflow-hidden"
                >
                  <button
                    onClick={() => { setAppointmentOpen(false); setAppointmentSuccess(false); }}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                  >
                    ✕
                  </button>

                  {!appointmentSuccess ? (
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 px-2.5 py-1 rounded-full text-zinc-600">
                          Clinical Diagnostics
                        </span>
                        <h3 className="text-xl font-bold font-sans text-black pt-1">
                          Schedule Diagnostic Session
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Book a non-invasive skin sebum volatile organic compound (VOC) screening at ParkinSense Central Laboratory.
                        </p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setAppointmentSuccess(true);
                        }}
                        className="space-y-3.5 text-xs font-sans"
                      >
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Full Name</label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. John Doe"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Email / Phone</label>
                          <input
                            required
                            type="email"
                            placeholder="patient@medical.org"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Preferred Date</label>
                          <input
                            required
                            type="date"
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-md mt-2"
                        >
                          Confirm Reservation
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-4">
                      <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto text-xl">
                        ✓
                      </div>
                      <h3 className="text-lg font-bold text-black">Reservation Requested!</h3>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        Our research coordinator will contact you shortly to finalize your diagnostic appointment.
                      </p>
                      <button
                        onClick={() => { setAppointmentOpen(false); setAppointmentSuccess(false); }}
                        className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* HEADER BAR */}
          <header className="w-full px-6 lg:px-12 py-5 flex items-center justify-between border-b border-zinc-200/80 bg-[#f4f4f5]/90 backdrop-blur-md sticky top-0 z-40">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs tracking-wider">
                P
              </div>
              <span className="font-sans font-bold text-lg tracking-tight text-black">
                PARKINSENSE
              </span>
            </div>
            
            {/* Minimalist Navigation Bar */}
            <nav className="hidden md:flex items-center bg-zinc-200/60 rounded-full px-2 py-1 text-xs font-semibold text-zinc-600 gap-1">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-1.5 rounded-full bg-white text-black shadow-xs transition-all cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => document.getElementById('mission-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-1.5 rounded-full hover:text-black transition-colors cursor-pointer"
              >
                Mission
              </button>
              <button
                onClick={() => document.getElementById('science-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-1.5 rounded-full hover:text-black transition-colors cursor-pointer"
              >
                Science & Specs
              </button>
              <button
                onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-1.5 rounded-full hover:text-black transition-colors cursor-pointer"
              >
                Contact
              </button>
            </nav>
            
            {/* Header Right Action */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setAppointmentOpen(true)}
                className="hidden sm:flex items-center gap-1.5 border border-zinc-300 hover:border-black bg-white text-black font-semibold text-xs px-4 py-2 rounded-full transition-all cursor-pointer"
              >
                <span>Make An Appointment</span>
              </button>

              <button
                onClick={() => setInDashboard(true)}
                className="bg-black hover:bg-zinc-800 text-white font-semibold text-xs px-5 py-2 rounded-full transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>Enter Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* MAIN HERO SECTION */}
          <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 pt-10 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* LEFT COLUMN: HERO HEADLINE */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-7 space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-600 bg-zinc-200/80 px-3 py-1 rounded-full border border-zinc-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                  PURPOSE OF PARKINSENSE
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-black leading-[1.1] tracking-tight"
                >
                  Detailed diagnostic of skin sebum VOCs
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-sm sm:text-base text-zinc-600 max-w-xl leading-relaxed font-sans"
                >
                  Health is the most important thing. So don't put it off for later. Discover non-invasive early Parkinson screening powered by 4-channel e-Nose gas sensing arrays and trained machine learning models.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="pt-2 flex flex-wrap items-center gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setAppointmentOpen(true)}
                    className="px-7 py-3.5 bg-black hover:bg-zinc-800 text-white font-semibold text-xs rounded-full transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>MAKE AN APPOINTMENT</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setInDashboard(true)}
                    className="px-7 py-3.5 border border-zinc-300 hover:border-black bg-white text-black font-semibold text-xs rounded-full transition-all cursor-pointer shadow-xs"
                  >
                    OPEN CLINICAL DASHBOARD
                  </motion.button>
                </motion.div>

                {/* NUMBERED CARD 01 - FLOATING ANIMATION */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="pt-6"
                >
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08)" }}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-start justify-between gap-6 relative overflow-hidden transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-4xl font-display font-bold text-zinc-300">01</span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold block">
                          2026-07-21
                        </span>
                        <h3 className="font-bold text-base text-black font-sans">
                          First Central Laboratory in VOC Research
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-md pt-1">
                          ParkinSense is a global clinical research laboratory specializing in non-invasive early neurodegenerative screening using metal-oxide gas resistance signatures.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* RIGHT COLUMN: INTERACTIVE 3D BIOLOGICAL CHAMBER GRAPHIC WITH FLOATING CARDS */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="lg:col-span-5 relative"
              >
                {/* FLOATING ACTION BADGE 1 */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -top-4 -right-2 z-20 bg-white/95 border border-zinc-200/90 shadow-lg backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-2.5"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <p className="text-[10px] font-bold text-zinc-800 leading-none">Chamber Active</p>
                    <p className="text-[8px] font-mono text-zinc-400">4x Sensors Live</p>
                  </div>
                </motion.div>

                {/* FLOATING ACTION BADGE 2 */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-5 -left-3 z-20 bg-zinc-900 text-white border border-zinc-700 shadow-xl backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-3"
                >
                  <Atom className="w-4 h-4 text-zinc-400 animate-spin" />
                  <div>
                    <p className="text-[10px] font-bold leading-none">VOC Desorption</p>
                    <p className="text-[8px] font-mono text-zinc-400">94.2% AI Model Precision</p>
                  </div>
                </motion.div>

                {/* MAIN CHAMBER DISPLAY CARD */}
                <motion.div
                  whileHover={{ rotateY: 2, rotateX: -2, scale: 1.01 }}
                  className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-800 relative overflow-hidden flex flex-col justify-between min-h-[470px] transition-transform duration-300"
                >
                  {/* Card Header Tag */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-2">
                      <Atom className="w-5 h-5 text-zinc-300 animate-spin" />
                      <span className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase">
                        Chamber Desorption Core
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700">
                      BME680 QUAD ARRAY
                    </span>
                  </div>

                  {/* Chamber Visual Component with floating animation */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="my-auto py-4"
                  >
                    <ChamberIllustration isRecording={true} className="transform scale-110" />
                  </motion.div>

                  {/* Floating Interactive Badge overlay */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-zinc-800/90 border border-zinc-700 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between text-xs font-sans shadow-lg"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-white">Good Interaction With Volatile Molecules</p>
                      <p className="text-[10px] text-zinc-400 font-mono">Octanal • Hexyl Acetate • Eicosane</p>
                    </div>
                    <button
                      onClick={() => setInDashboard(true)}
                      className="px-3.5 py-2 bg-white text-black rounded-xl text-[11px] font-bold hover:bg-zinc-200 transition-colors cursor-pointer flex-shrink-0"
                    >
                      Analyze
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>

            </div>
          </section>

          {/* INFINITE MARQUEE TICKER BANNER */}
          <div className="w-full bg-black text-white py-4 overflow-hidden border-y border-zinc-800 font-mono text-xs uppercase tracking-widest flex">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
              className="flex whitespace-nowrap min-w-max"
            >
              {[0, 1, 2, 3].map((group) => (
                <div key={group} className="flex space-x-12 items-center pr-12">
                  <span>HEALTH PRECISION</span>
                  <span>/</span>
                  <span>BIOMARKER INSIGHT</span>
                  <span>/</span>
                  <span>NON-INVASIVE DIAGNOSTICS</span>
                  <span>/</span>
                  <span>SEBUM VOC ANALYSIS</span>
                  <span>/</span>
                  <span>4-CHANNEL MULTIPLEXING</span>
                  <span>/</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* MISSION & METRICS SECTION */}
          <section id="mission-section" className="w-full bg-white py-20 px-6 lg:px-12 border-b border-zinc-200">
            <div className="max-w-[1440px] mx-auto space-y-16">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start overflow-hidden py-4">
                <motion.div
                  initial={{ opacity: 0, x: -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="lg:col-span-6 space-y-4"
                >
                  <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                    ParkinSense Precision Diagnostics
                  </span>
                  <h2 className="font-sans font-bold text-3xl sm:text-4xl text-black leading-tight">
                    Our mission is to unravel the intricacies of skin sebum VOC signatures, providing you with the most detailed diagnostic insights.
                  </h2>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="lg:col-span-6 grid grid-cols-2 gap-6 pt-2"
                >
                  {[
                    { num: '15', label: 'Years Of Expertise', sub: 'In volatile organic compound research' },
                    { num: '4 Ch', label: 'Gas Multiplexing', sub: 'PCA9548A spatial sensor array' },
                    { num: '84%', label: 'Accuracy Rate', sub: 'Early-stage Parkinson screening' },
                    { num: '30k+', label: 'Satisfied Datasets', sub: 'Processed across global trials' },
                  ].map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200/80 shadow-xs cursor-default transition-all"
                    >
                      <p className="text-4xl font-display font-bold text-black">{m.num}</p>
                      <p className="text-xs font-semibold text-zinc-600 mt-1">{m.label}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{m.sub}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* INTERACTIVE FLOATING TILTED CARDS SHOWCASE */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="py-6 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                      Interactive Diagnostics Showcase
                    </span>
                    <h3 className="text-2xl font-bold text-black font-sans">
                      Personalized Care & Precision Services
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500">Hover or drag cards to explore screening modalities</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    { title: 'Genetic Health Assessments', badge: 'Services', desc: 'Comprehensive lipid oxidation & sebum biomarker mapping', tilt: '-rotate-2' },
                    { title: 'Oncology & Parkinson Testing', badge: 'Services', desc: '4-channel gas array sensing with machine learning decision trees', tilt: 'rotate-1' },
                    { title: 'Biomarker Counseling', badge: 'Consultation', desc: 'Personalized clinical report generation & physician guidance', tilt: '-rotate-1' },
                  ].map((card, idx) => (
                    <motion.div
                      key={card.title}
                      whileHover={{ rotate: 0, scale: 1.04, y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`bg-zinc-900 text-white rounded-3xl p-7 border border-zinc-800 shadow-xl flex flex-col justify-between min-h-[260px] cursor-grab active:cursor-grabbing ${card.tilt} transition-all`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {card.badge}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
                        </div>
                        <h4 className="text-xl font-bold font-sans text-white leading-snug">{card.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{card.desc}</p>
                      </div>

                      <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">PARKINSENSE LAB</span>
                        <button
                          onClick={() => setInDashboard(true)}
                          className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
                        >
                          Explore
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* DIAGNOSTIC WORKFLOW DIAGRAM */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="bg-zinc-900 text-white rounded-3xl p-8 border border-zinc-800 space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white font-sans">Clinical Diagnostic Process</h3>
                    <p className="text-xs text-zinc-400">Standardized end-to-end non-invasive screening protocol</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInDashboard(true)}
                    className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Start Acquisition Session
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-center font-sans">
                  {[
                    { step: '01', title: 'Sample Collection', desc: 'Upper back / neck sebum swab' },
                    { step: '02', title: 'Thermal Desorption', desc: 'Controlled chamber heating' },
                    { step: '03', title: '4-Ch Gas Sensing', desc: 'Resistance shift logging' },
                    { step: '04', title: 'Data Interpretation', desc: 'Machine learning classification' },
                    { step: '05', title: 'Diagnostic Report', desc: 'Probability output & report' },
                  ].map((s, idx) => (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="p-4 bg-zinc-800/80 rounded-2xl border border-zinc-700/60 space-y-1.5 cursor-default transition-all"
                    >
                      <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2.5 py-0.5 rounded-full">{s.step}</span>
                      <h4 className="font-bold text-xs text-white pt-1">{s.title}</h4>
                      <p className="text-[10px] text-zinc-400">{s.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            </div>
          </section>

          {/* ADVANTAGES SECTION */}
          <section className="w-full bg-[#f4f4f5] py-20 px-6 lg:px-12 border-b border-zinc-200">
            <div className="max-w-[1440px] mx-auto space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="space-y-2"
                >
                  <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                    Your Health, Our Expertise
                  </span>
                  <h2 className="font-sans font-bold text-3xl sm:text-4xl text-black">
                    Our Key Advantages
                  </h2>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden py-4">
                {[
                  { num: '01', title: 'Personalized Health Solutions', desc: 'Tailored VOC profile analysis matching individual sebum lipid compositions.' },
                  { num: '02', title: 'Precision And Accuracy', desc: '4-channel multiplexed BME680 sensors eliminate environmental thermal drift.' },
                  { num: '03', title: 'Scientific Innovation', desc: 'Powered by peer-reviewed research on lipid peroxidation biomarkers.' },
                ].map((card, i) => (
                  <motion.div
                    key={card.num}
                    initial={{ opacity: 0, x: 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                    whileHover={{ scale: 1.03, y: -6, borderColor: '#000000' }}
                    className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-xs flex flex-col justify-between space-y-8 transition-all"
                  >
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full uppercase">
                        Advantage
                      </span>
                      <h3 className="text-xl font-bold text-black font-sans">{card.title}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">{card.desc}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                      <span className="text-4xl font-display font-bold text-zinc-300">{card.num}</span>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setInDashboard(true)}
                        className="p-2.5 rounded-full bg-zinc-100 hover:bg-black hover:text-white transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* SCIENTIFIC SPECIFICATIONS SECTION */}
          <section id="science-section" className="w-full bg-white py-20 px-6 lg:px-12 border-b border-zinc-200">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="text-center space-y-3">
                <span className="text-xs font-mono font-bold text-black uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full border border-zinc-300">
                  Research Spectrum
                </span>
                <h2 className="font-sans font-bold text-3xl sm:text-4xl text-black tracking-tight">
                  The Science Behind Our Platform
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
                  Pioneering healthcare innovation, we leverage cutting-edge technologies, from 4-channel e-nose gas sensing to AI-driven analysis.
                </p>
              </div>

              <AboutView />
            </div>
          </section>

          {/* CONTACT US FOOTER SECTION */}
          <section id="contact-section" className="w-full bg-black text-white py-20 px-6 lg:px-12 relative overflow-hidden">
            <div className="max-w-[1440px] mx-auto space-y-12">
              
              <div className="text-center space-y-4">
                <motion.h2
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="font-sans font-black text-5xl sm:text-7xl lg:text-9xl text-white tracking-tighter opacity-90"
                >
                  CONTACT US
                </motion.h2>
                
                {/* Floating Laboratory Contact Badge */}
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  whileHover={{ scale: 1.05, rotate: 0 }}
                  className="max-w-md mx-auto bg-zinc-900/90 border border-zinc-700 rounded-2xl p-6 text-center space-y-2 shadow-2xl backdrop-blur-md cursor-pointer"
                >
                  <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">PARKINSENSE CENTRAL LABORATORY</p>
                  <p className="text-xs text-zinc-400 font-mono">(555) 123-4567 • RESEARCH@PARKINSENSE.ORG</p>
                  <p className="text-[11px] text-zinc-500 font-sans">678 REDWOOD WAY, SEATTLE, WA</p>
                </motion.div>
              </div>

              {/* Minimalist Contact Form */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4 shadow-2xl"
              >
                <h3 className="text-lg font-bold text-white text-center font-sans">Send Inquiry To Research Team</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Thank you! Your inquiry has been logged with the clinical team.');
                  }}
                  className="space-y-3.5 text-xs font-sans"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-black text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Your Email"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-black text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Your Message / Research Collaboration Request"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-black text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md"
                  >
                    SEND MESSAGE
                  </motion.button>
                </form>
              </motion.div>

              {/* Footer copyright line */}
              <div className="pt-10 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono gap-4">
                <p>© 2026 ParkinSense Research Alliance. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => setInDashboard(true)} className="hover:text-white transition-colors cursor-pointer">
                    Open Clinical Dashboard
                  </button>
                </div>
              </div>

            </div>
          </section>

        </div>
      ) : (
        
        /* DASHBOARD LAYOUT */
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans w-full">
          
          {/* Edge-to-edge Premium Dashboard Container */}
          <div className="flex-1 flex flex-col md:flex-row min-h-screen overflow-hidden w-full">
            
            {/* Slim Minimalist Left Sidebar */}
            <aside className="w-full md:w-[76px] flex md:flex-col items-center justify-between py-3 md:py-8 px-3 md:px-0 border-b md:border-b-0 md:border-r border-zinc-200 flex-shrink-0 bg-white">
              
              {/* Brand Logo inside subtle shape */}
              <div 
                onClick={() => setInDashboard(false)}
                className="w-9 h-9 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center text-white font-semibold text-base md:text-lg shadow-xs cursor-pointer hover:scale-[1.03] transition-all flex-shrink-0"
                title="Return to Home screen"
              >
                P
              </div>

              {/* Vertical Navigation Items (Centered, horizontally scrollable on mobile) */}
              <div className="flex-1 md:flex-initial overflow-x-auto scrollbar-none mx-2 sm:mx-4 md:mx-0 py-1 flex md:justify-center">
                <nav className="flex flex-row md:flex-col gap-1.5 xs:gap-3 md:gap-4 items-center flex-shrink-0">
                  {([
                    { id: 'Dashboard', label: 'Overview', icon: Activity },
                    { id: 'Acquisition', label: 'Data Acquisition', icon: Cpu },
                    { id: 'Datasets', label: 'Dataset Vault', icon: Database },
                    { id: 'About', label: 'Scientific Specs', icon: HelpCircle },
                  ] as const).map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = currentView === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setCurrentView(tab.id as any)}
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all relative group cursor-pointer flex-shrink-0 ${
                          isSelected
                            ? 'bg-black text-white shadow-xs'
                            : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'
                        }`}
                        title={tab.label}
                      >
                        <Icon className="w-4 h-4 md:w-4.5 md:h-4.5" />
                        
                        {/* Tooltip on hover (desktop only) */}
                        <span className="hidden md:block absolute left-14 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-black text-white text-[10px] font-semibold px-2 py-1 rounded shadow-xs whitespace-nowrap z-30">
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Exit/Logout Button */}
              <button
                onClick={() => setInDashboard(false)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-black transition-all cursor-pointer flex-shrink-0"
                title="Exit Dashboard"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>

            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#f4f4f5]">
              
              {/* Premium Minimalist Top Header */}
              <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-zinc-200 bg-white">
                
                {/* Search Bar - Aesthetic Placeholders */}
                <div className="flex items-center gap-2 px-3 py-1.5 md:py-2 bg-zinc-50 rounded-lg border border-zinc-200 shadow-xs w-48 sm:w-64">
                  <Search className="w-4 h-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search subject, sensor ID..." 
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-black placeholder-zinc-400"
                  />
                </div>

                {/* Header Controls */}
                <div className="flex items-center gap-3">
                  
                  {/* Status Indicator */}
                  <div className={`hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase border ${
                    isDeviceConnected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isDeviceConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span>{isDeviceConnected ? 'USB Connected' : 'Disconnected'}</span>
                  </div>

                  {/* Calibrated State Tag */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 text-[10px] font-semibold">
                    <span>VOC Calibrated</span>
                  </div>

                  {/* Operator Avatar */}
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-zinc-200 rounded-lg shadow-xs">
                    <div className="w-5.5 h-5.5 rounded bg-black text-white flex items-center justify-center text-[8px] font-bold">
                      OP
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-[9px] font-bold text-black leading-none">Operator</p>
                      <p className="text-[7px] text-zinc-400 font-mono leading-none mt-0.5">LAB-3</p>
                    </div>
                  </div>

                </div>

              </header>

              {/* Main Workspace Content Area */}
              <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full bg-[#f4f4f5]">
                
                {/* Title and Calendar Date */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-sans font-bold text-xl md:text-2xl text-black tracking-tight">
                      {currentView === 'Dashboard' ? 'Dashboard' : currentView}
                    </h2>
                    <p className="text-[10px] md:text-[11px] text-zinc-500 mt-0.5 font-sans">
                      {currentView === 'Dashboard' && 'Volatile Sebum telemetry and active diagnostic model accuracy'}
                      {currentView === 'Acquisition' && 'Clinical trial acquisition wizard & chamber stabilization'}
                      {currentView === 'Datasets' && 'Stored diagnostic CSV files and plot previews'}
                      {currentView === 'About' && 'Explore hyperosmia biometrics and metal-oxide sensors'}
                    </p>
                  </div>

                  {/* Mini Calendar Date */}
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 bg-white px-3 py-1.5 md:py-2 rounded-lg border border-zinc-200 shadow-xs flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>21 July 2026</span>
                  </div>
                </div>

                {/* Switch Workspace Panels with Transitions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-6"
                  >
                    
                    {/* CASE 1: OVERVIEW DASHBOARD */}
                    {currentView === 'Dashboard' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        
                        {/* LEFT COLUMN: 2/3 WIDTH (8 of 12) */}
                        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
                          
                          {/* Activity Live Telemetry Chart */}
                          <div className="flex-1 min-h-[360px]">
                            <LiveCharts data={activeReadings}/>
                          </div>

                          {/* Double Row: Publication Recommendations & Parameter Calibrations */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ResearchBulletinCard />
                            <CalibrationCard />
                          </div>

                        </div>

                        {/* RIGHT COLUMN: 1/3 WIDTH (4 of 12) */}
                        <div className="lg:col-span-4 space-y-6">
                          
                          {/* Details */}
                          <SystemDetailsCard />

                          {/* Action Card: Export Dataset */}
                          <div className="bg-white rounded-xl p-5 shadow-xs border border-zinc-200 flex flex-col justify-between min-h-[180px]">
                            <div className="space-y-1.5 z-10">
                              <h4 className="text-xs font-semibold tracking-tight text-black">Export Dataset Package</h4>
                              <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[240px]">
                                Generate and download fully formatted research matrices with 17 clinical VOC channels.
                              </p>
                            </div>

                            <div className="z-10 pt-4">
                              <button
                                onClick={() => {
                                  const headers = ['Timestamp', 'S1_Gas', 'S2_Gas', 'S3_Gas', 'S4_Gas'];
                                  const rows = activeReadings.map(r => [r.timestamp, r.s1Gas, r.s2Gas, r.s3Gas, r.s4Gas,]);
                                  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
                                  const link = document.createElement('a');
                                  link.setAttribute('href', encodeURI(csv));
                                  link.setAttribute('download', 'ParkinSense_Telemetry_Sample.csv');
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="bg-black hover:bg-zinc-800 text-white text-[10px] font-semibold px-4 py-2.5 rounded-lg shadow-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer w-full text-center"
                              >
                                Download Export CSV
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>
                    )}

                    {/* CASE 2: ACTIVE CLINICAL ACQUISITION */}
                    {currentView === 'Acquisition' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                          
                          {/* 6-Step Wizard */}
                          <div className="xl:col-span-8">
                            <AcquisitionWizard
                              onSessionFinished={handleSessionFinished}
                              isDeviceConnected={isDeviceConnected}
                              onSetDeviceConnected={setIsDeviceConnected}
                              activeReadings={activeReadings}
                              onSetActiveReadings={setActiveReadings}
                            />
                          </div>

                          {/* Real-Time Live Telemetry Graph on Right during active recording */}
                          <div className="xl:col-span-4 flex flex-col justify-between h-full space-y-6">
                            <div className="flex-1">
                              <LiveCharts data={activeReadings} />
                            </div>
                            
                            {activeReadings.length > 0 && (
                              <div className="p-4 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs font-sans space-y-1.5">
                                <span className="font-mono text-[9px] font-bold text-black uppercase block">Active Desorption Metrics</span>
                                <p className="text-zinc-600 leading-normal">
                                  Adsorption curve is updating at 1.0Hz. A total of <span className="font-mono font-bold text-black">{activeReadings.length}</span> frames have been recorded in temporary memory.
                                </p>
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Raw table logs displayed at bottom during acquisition */}
                        {activeReadings.length > 0 && (
                          <div className="border-t border-zinc-200 pt-6">
                            <RawDataTable data={activeReadings} onClear={() => setActiveReadings([])} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* CASE 3: DATASETS DATABASE */}
                    {currentView === 'Datasets' && (
                      <DatasetsPage
                        datasets={datasetsList}
                        onDeleteDataset={handleDeleteDataset}
                        onAddDataset={handleAddDataset}
                      />
                    )}

                    {/* CASE 4: ABOUT */}
                    {currentView === 'About' && (
                      <AboutView />
                    )}

                  </motion.div>
                </AnimatePresence>

              </main>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
