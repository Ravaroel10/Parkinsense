/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { ParticipantInfo, LiveDataPoint } from '../types';
import ChamberIllustration from './ChamberIllustration';
import {
  connectSerial,
  disconnectSerial,
  subscribeToSerialData,
} from "../lib/serial";
import {
  Usb,
  User,
  Beaker,
  Compass,
  Play,
  Pause,
  Square,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface AcquisitionWizardProps {
  onSessionFinished: (participant: ParticipantInfo, readings: LiveDataPoint[]) => void;
  isDeviceConnected: boolean;
  onSetDeviceConnected: (connected: boolean) => void;
  activeReadings: LiveDataPoint[];
  onSetActiveReadings: (updater: (prev: LiveDataPoint[]) => LiveDataPoint[]) => void;
}

export default function AcquisitionWizard({
  onSessionFinished,
  isDeviceConnected,
  onSetDeviceConnected,
  activeReadings,
  onSetActiveReadings,
}: AcquisitionWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [comPort, setComPort] = useState<string>('COM3');
  const [connectionLog, setConnectionLog] = useState<string[]>([
    'System Idle. Awaiting USB connection...',
  ]);

  // Step 2: Participant Info Form
  const [participant, setParticipant] = useState<ParticipantInfo>({
    participantId: 'SUBJ-001',
    sampleId: 'SEB-001',
    age: 55,
    gender: 'Male',
    diagnosis: 'Parkinson',
    operatorName: 'Operator',
    institution: 'Medical Research Center',
    collectionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Checklist for Step 3
  const [prepChecklist, setPrepChecklist] = useState({
    chamberCleaned: false,
    sampleInserted: false,
    chamberSealed: false,
    filterActive: false,
  });

  const stabilizationDuration = 90;
  const recordingDuration = 300;

  // Step 4: Stabilization state
  const [stabilizationProgress, setStabilizationProgress] = useState(0);
  const [stabilizationSeconds, setStabilizationSeconds] = useState(stabilizationDuration);

  // Step 5: Recording state
  const [recordingSeconds, setRecordingSeconds] = useState(recordingDuration);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);

  // Animation / Interval Ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stabilizationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const serialPortRef = useRef<any>(null);
  const previousStepRef = useRef<number>(1);
  const stabilizationSecondsRef = useRef(stabilizationSeconds);
  const recordingSecondsRef = useRef(recordingSeconds);
  const activeReadingsRef = useRef<LiveDataPoint[]>([]);
  const sessionSavedRef = useRef(false);

  const normalizeSerialPayload = (payload: Record<string, unknown>) => {
    const toNumber = (value: unknown, fallback = 0) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }

      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const getFirstNumber = (keys: string[], fallback = 0) => {
      for (const key of keys) {
        const value = (payload as Record<string, unknown>)[key];
        const numericValue = toNumber(value, fallback);
        if (numericValue !== fallback || value === 0) {
          return numericValue;
        }
      }

      return fallback;
    };

    return {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      elapsed: 0,
      s1Gas: toNumber(payload.s1Gas),
      s1Temp: toNumber(payload.s1Temp),
      s1Hum: toNumber(payload.s1Hum),
      s1Press: getFirstNumber(['s1Press', 's1Pres', 's1Pressure', 'pressure1', 'press1', 'pressure']),
      s2Gas: toNumber(payload.s2Gas),
      s2Temp: toNumber(payload.s2Temp),
      s2Hum: toNumber(payload.s2Hum),
      s2Press: getFirstNumber(['s2Press', 's2Pres', 's2Pressure', 'pressure2', 'press2']),
      s3Gas: toNumber(payload.s3Gas),
      s3Temp: toNumber(payload.s3Temp),
      s3Hum: toNumber(payload.s3Hum),
      s3Press: getFirstNumber(['s3Press', 's3Pres', 's3Pressure', 'pressure3', 'press3']),
      s4Gas: toNumber(payload.s4Gas),
      s4Temp: toNumber(payload.s4Temp),
      s4Hum: toNumber(payload.s4Hum),
      s4Press: getFirstNumber(['s4Press', 's4Pres', 's4Pressure', 'pressure4', 'press4']),
    } as LiveDataPoint;
  };

  const handleSerialPayload = (payload: Record<string, unknown>) => {
    const normalized = normalizeSerialPayload(payload);

    if (currentStep === 5 && isRecordingActive && recordingSeconds > 0) {
      onSetActiveReadings((prev) => {
        const nextElapsed = prev.length + 1;
        activeReadingsRef.current = [...prev, { ...normalized, elapsed: nextElapsed }];
        setSampleCount((count) => count + 1);
        return activeReadingsRef.current;
      });
    }
  };

  // Web Serial or Port hardware connection
  const simulateConnection = async () => {
    setConnectionLog((prev) => [...prev, 'Requesting ESP32 port via Web Serial API...']);

    const port = await connectSerial();

    if (port) {
      serialPortRef.current = port;
      onSetDeviceConnected(true);

      setConnectionLog((prev) => [
        ...prev,
        'ESP32 Connected',
        'Streaming sensor frames over USB serial...'
      ]);
    } else {
      setConnectionLog((prev) => [
        ...prev,
        'Connection failed. Ensure the ESP32 is plugged in and the browser has Web Serial permission.',
      ]);
    }
  };

  const disconnectDevice = async () => {
    await disconnectSerial();

    serialPortRef.current = null;
    onSetDeviceConnected(false);

    setConnectionLog([
      'Device disconnected. System idle.'
    ]);
  };

  useEffect(() => {
    if (!isDeviceConnected) {
      return;
    }

    const unsubscribe = subscribeToSerialData((payload) => {
      if (!payload || typeof payload !== 'object') {
        return;
      }

      handleSerialPayload(payload as Record<string, unknown>);
    });

    return () => {
      unsubscribe();
    };
  }, [isDeviceConnected, currentStep, isRecordingActive, recordingSeconds]);

  useEffect(() => {
    if (previousStepRef.current === 4 && currentStep === 5) {
      activeReadingsRef.current = [];
      onSetActiveReadings(() => []);
      setSampleCount(0);
      sessionSavedRef.current = false;
    }

    previousStepRef.current = currentStep;
  }, [currentStep, onSetActiveReadings]);

  useEffect(() => {
    stabilizationSecondsRef.current = stabilizationSeconds;
  }, [stabilizationSeconds]);

  useEffect(() => {
    recordingSecondsRef.current = recordingSeconds;
  }, [recordingSeconds]);

  // Step 4: Stabilization effect
  useEffect(() => {
    if (currentStep !== 4) {
      if (stabilizationTimerRef.current) {
        clearInterval(stabilizationTimerRef.current);
        stabilizationTimerRef.current = null;
      }
      return;
    }

    if (stabilizationSecondsRef.current <= 0) {
      return;
    }

    stabilizationTimerRef.current = setInterval(() => {
      setStabilizationSeconds((prev) => {
        const next = prev - 1;
        const progress = Math.max(0, Math.min(100, Math.round(((stabilizationDuration - next) / stabilizationDuration) * 100)));
        setStabilizationProgress(progress);

        if (next <= 0) {
          setCurrentStep(5);
          setIsRecordingActive(true);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (stabilizationTimerRef.current) {
        clearInterval(stabilizationTimerRef.current);
        stabilizationTimerRef.current = null;
      }
    };
  }, [currentStep]);

  // Step 5: Recording effect
  useEffect(() => {
    if (currentStep !== 5) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (!isRecordingActive || recordingSecondsRef.current <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        const next = prev - 1;

        if (next <= 0) {
          setIsRecordingActive(false);
          setCurrentStep(6);
          if (!sessionSavedRef.current) {
            sessionSavedRef.current = true;
            onSessionFinished(participant, activeReadingsRef.current);
          }
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentStep, isRecordingActive, onSessionFinished, participant]);

  // Complete session and save
  const handleSaveAndFinish = () => {
    sessionSavedRef.current = true;
    onSessionFinished(participant, activeReadingsRef.current);
    setCurrentStep(6);
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setStabilizationSeconds(stabilizationDuration);
    setStabilizationProgress(0);
    setRecordingSeconds(recordingDuration);
    setSampleCount(0);
    setIsRecordingActive(false);
    activeReadingsRef.current = [];
    sessionSavedRef.current = false;
    onSetActiveReadings(() => []);
    setPrepChecklist({
      chamberCleaned: false,
      sampleInserted: false,
      chamberSealed: false,
      filterActive: false,
    });
  };

  // Stepper Header
  const steps = [
    { num: 1, label: 'Device Connect', icon: Usb },
    { num: 2, label: 'Participant Info', icon: User },
    { num: 3, label: 'Sample Prep', icon: Beaker },
    { num: 4, label: 'Stabilization', icon: Compass },
    { num: 5, label: 'Live Recording', icon: Clock },
    { num: 6, label: 'Finished', icon: CheckCircle2 },
  ];

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col h-full shadow-xs">
      {/* Dynamic Stepper Bar */}
      <div className="hidden lg:flex items-center justify-between border-b border-zinc-100 pb-5 mb-6 overflow-x-auto">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isCompleted = currentStep > s.num;
          return (
            <div key={s.num} className="flex items-center flex-1 last:flex-initial">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-xs font-bold'
                      : isCompleted
                      ? 'bg-zinc-100 text-black'
                      : 'bg-zinc-50 text-zinc-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-mono">{s.num}</span>}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      isActive
                        ? 'text-zinc-800 font-bold'
                        : isCompleted
                        ? 'text-black'
                        : 'text-zinc-400'
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono hidden xl:block">Phase {s.num}.0</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-4 rounded-full transition-all ${
                    isCompleted ? 'bg-zinc-800' : 'bg-zinc-100'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper Header */}
      <div className="lg:hidden flex items-center justify-between border-b border-zinc-100 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-black bg-zinc-100 px-2.5 py-1 rounded-md font-semibold">
            Step {currentStep} of 6
          </span>
          <h4 className="font-sans font-semibold text-sm text-zinc-800">
            {steps[currentStep - 1].label}
          </h4>
        </div>
        <div className="w-24 bg-zinc-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-black h-full transition-all"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Step Content panels */}
      <div className="flex-1 flex flex-col justify-between">
        
        {/* STEP 1: CONNECT DEVICE */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="space-y-4">
              <h3 className="font-sans font-semibold text-lg text-zinc-800">
                Establish Hardware Connection
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                ParkinSense interfaces with the diagnostic chamber via an ESP32 microcontroller using Web Serial API. Ensure the USB-to-UART bridge is securely attached.
              </p>

              <div className="space-y-3 bg-zinc-50/50 border border-zinc-200/80 rounded-xl p-4">
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Select COM Port
                  </label>
                  <select
                    value={comPort}
                    onChange={(e) => setComPort(e.target.value)}
                    disabled={isDeviceConnected}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800"
                  >
                    <option value="COM1">COM1 - Serial Port</option>
                    <option value="COM3">COM3 - ESP32 WROOM-32E (Recommended)</option>
                    <option value="COM4">COM4 - CH340 Chipset</option>
                    <option value="/dev/ttyUSB0">/dev/ttyUSB0 (Linux Core)</option>
                    <option value="VirtualPort">Virtual Lab Simulator</option>
                  </select>
                </div>

                <div className="pt-2">
                  {!isDeviceConnected ? (
                    <button
                      onClick={simulateConnection}
                      className="w-full bg-black hover:bg-zinc-800 active:scale-95 text-white py-2 px-4 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Usb className="w-4 h-4" />
                      <span>Initiate Serial Connection</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 font-medium">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Connected to {comPort}
                        </span>
                        <span className="font-mono text-[10px]">115200 Baud</span>
                      </div>
                      <button
                        onClick={disconnectDevice}
                        className="w-full bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-700 py-2 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-zinc-200/50"
                      >
                        Disconnect Hardware
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hardware Serial Terminal Log (Clinical Aesthetics) */}
            <div className="flex flex-col h-60 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xs font-mono text-[10px] text-zinc-400 p-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 text-zinc-400 uppercase tracking-widest font-semibold">
                <span>COM SERIAL TELEMETRY LOGS</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
                {connectionLog.map((log, idx) => (
                  <p key={idx} className="leading-normal">
                    <span className="text-zinc-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PARTICIPANT INFORMATION */}
        {currentStep === 2 && (
          <div className="py-2 space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-zinc-800" />
              <h3 className="font-sans font-semibold text-lg text-zinc-800">
                Clinical Trial Metadata
              </h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl font-sans">
              Enter participant metrics and sample identifiers. Accurate cohort tags are required for future machine learning classification of volatile chemical signatures.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50/50 border border-zinc-200 rounded-xl p-5">
              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Participant Identifier
                </label>
                <input
                  type="text"
                  value={participant.participantId}
                  onChange={(e) => setParticipant({ ...participant, participantId: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Sample Batch ID
                </label>
                <input
                  type="text"
                  value={participant.sampleId}
                  onChange={(e) => setParticipant({ ...participant, sampleId: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Cohort / Clinical Label
                </label>
                <select
                  value={participant.diagnosis}
                  onChange={(e) =>
                    setParticipant({ ...participant, diagnosis: e.target.value as 'Healthy' | 'Parkinson' })
                  }
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800"
                >
                  <option value="Parkinson">Parkinson Disease Cohort</option>
                  <option value="Healthy">Healthy Control Cohort</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Age (years)
                </label>
                <input
                  type="number"
                  value={participant.age}
                  onChange={(e) => setParticipant({ ...participant, age: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Biological Gender
                </label>
                <select
                  value={participant.gender}
                  onChange={(e) =>
                    setParticipant({ ...participant, gender: e.target.value as any })
                  }
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Acquisition Operator
                </label>
                <input
                  type="text"
                  value={participant.operatorName}
                  onChange={(e) => setParticipant({ ...participant, operatorName: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Research Institution / Laboratory
                </label>
                <input
                  type="text"
                  value={participant.institution}
                  onChange={(e) => setParticipant({ ...participant, institution: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Date of Collection
                </label>
                <input
                  type="date"
                  value={participant.collectionDate}
                  onChange={(e) => setParticipant({ ...participant, collectionDate: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Clinical Annotations / Notes
                </label>
                <textarea
                  value={participant.notes}
                  rows={2}
                  onChange={(e) => setParticipant({ ...participant, notes: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600 text-zinc-800 font-sans"
                  placeholder="Notes about swab quality, storage temperatures, physiological variables..."
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SAMPLE PREPARATION */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-zinc-800" />
                <h3 className="font-sans font-semibold text-lg text-zinc-800">
                  Sample Preparation Protocol
                </h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                Follow the physical containment protocol closely. Standard ambient headspace configuration prevents drift and ensures consistent volatile desorption levels.
              </p>

              {/* Protocol Checklist */}
              <div className="space-y-3 bg-zinc-50/50 p-4 border border-zinc-200 rounded-xl">
                <label className="flex items-center gap-3 p-2.5 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prepChecklist.chamberCleaned}
                    onChange={(e) => setPrepChecklist({ ...prepChecklist, chamberCleaned: e.target.checked })}
                    className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">1. Clean chamber headspace</p>
                    <p className="text-[10px] text-zinc-400 font-sans">Purge with charcoal air filter for 60s prior to minimize atmospheric residue.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prepChecklist.sampleInserted}
                    onChange={(e) => setPrepChecklist({ ...prepChecklist, sampleInserted: e.target.checked })}
                    className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">2. Transfer skin sebum swab</p>
                    <p className="text-[10px] text-zinc-400 font-sans">Position the loaded medical cotton swab onto the central sterile stage plate.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prepChecklist.chamberSealed}
                    onChange={(e) => setPrepChecklist({ ...prepChecklist, chamberSealed: e.target.checked })}
                    className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">3. Lock transparent acrylic chamber</p>
                    <p className="text-[10px] text-zinc-400 font-sans">Lock lid tightly. Keep airflow valves closed to construct an airtight headspace.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prepChecklist.filterActive}
                    onChange={(e) => setPrepChecklist({ ...prepChecklist, filterActive: e.target.checked })}
                    className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">4. Confirm charcoal filter cartridge</p>
                    <p className="text-[10px] text-zinc-400 font-sans">Verify air filters are aligned to filter environmental ambient pollutants.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Illustration */}
            <div>
              <ChamberIllustration isRecording={false} isStabilizing={false} />
            </div>
          </div>
        )}

        {/* STEP 4: SENSOR STABILIZATION */}
        {currentStep === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
            <div className="space-y-4 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-zinc-700 animate-spin" />
                <h3 className="font-sans font-semibold text-lg text-zinc-800">
                  Sensor Thermal Stabilization
                </h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                Please stand by. The Bosch BME680 sensors use internal hot-plate heating elements to activate metal-oxide conductance. Sensors must reach constant thermal equilibrium (~28°C ambient / 320°C hot plate) before data can be reliably logged.
              </p>

              {/* Progress Panel */}
              <div className="bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-500 font-semibold uppercase">Sensor Heaters Status</span>
                  <span className="text-zinc-900 font-semibold font-mono animate-pulse">
                    STABILIZING... {stabilizationSeconds}s
                  </span>
                </div>
                
                {/* Horizontal Progress bar */}
                <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-zinc-700 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${stabilizationProgress}%` }}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-sans">
                  <Info className="w-4 h-4 shrink-0 text-zinc-900" />
                  <p>ESP32 telemetry is streamed live during stabilization and will be logged once the recording phase begins.</p>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div>
              <ChamberIllustration isStabilizing={true} />
            </div>
          </div>
        )}

        {/* STEP 5: ACTIVE RECORDING */}
        {currentStep === 5 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
            <div className="space-y-4 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-5 mr-1" />
                <h3 className="font-sans font-semibold text-lg text-zinc-800">
                  Volatile Compound Desorption Recording
                </h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                ACTIVE CHAMBER ACQUISITION. The 4 BME680 channels are continuously polling headspace conductance patterns at {1} Hz. Do not disturb the chamber, bump wires, or open valves.
              </p>

              {/* Live Count and Controls */}
              <div className="bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-zinc-200 rounded-xl text-center">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Timer Remaining</p>
                    <p className="font-sans font-bold text-2xl text-zinc-800 mt-1">
                      {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-zinc-200 rounded-xl text-center">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Samples Logged</p>
                    <p className="font-sans font-bold text-2xl text-black mt-1">{sampleCount} / 300</p>
                  </div>
                </div>

                {/* Progress Circle Ring simulated with absolute layout */}
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(sampleCount / 300) * 100}%` }}
                  />
                </div>

                {/* Live values table snippet */}
                <div className="text-[10px] font-mono bg-zinc-900 rounded-xl p-3 border border-zinc-800 text-zinc-350">
                  <div className="grid grid-cols-4 gap-1 text-center font-bold text-zinc-400 border-b border-zinc-800 pb-1 mb-1">
                    <span>CH1 Gas</span>
                    <span>CH2 Gas</span>
                    <span>CH3 Gas</span>
                    <span>CH4 Gas</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center font-semibold text-emerald-400">
                    <span>{activeReadings[activeReadings.length - 1]?.s1Gas ?? '---'} kΩ</span>
                    <span>{activeReadings[activeReadings.length - 1]?.s2Gas ?? '---'} kΩ</span>
                    <span>{activeReadings[activeReadings.length - 1]?.s3Gas ?? '---'} kΩ</span>
                    <span>{activeReadings[activeReadings.length - 1]?.s4Gas ?? '---'} kΩ</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  {isRecordingActive ? (
                    <button
                      onClick={() => setIsRecordingActive(false)}
                      className="flex-1 bg-zinc-700 hover:bg-zinc-900 text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Session</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsRecordingActive(true)}
                      className="flex-1 bg-black hover:bg-zinc-800 text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume Recording</span>
                    </button>
                  )}
                  <button
                    onClick={handleSaveAndFinish}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop & Complete</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Illustration */}
            <div>
              <ChamberIllustration isRecording={true} />
            </div>
          </div>
        )}

        {/* STEP 6: RECORDING FINISHED */}
        {currentStep === 6 && (
          <div className="py-6 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <CheckCircle2 className="w-10 h-10 animate-[bounce_1s_ease-in-out_infinite]" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-sans font-semibold text-xl text-zinc-800">
                Acquisition Run Complete!
              </h3>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                Volatile signature collection for participant <span className="font-mono font-bold text-zinc-700">{participant.participantId}</span> has successfully saved. Characterized curves are prepared for algorithm classification.
              </p>
            </div>

            {/* Summary details card */}
            <div className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl p-4 text-left space-y-2.5 font-sans">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 font-medium">Participant ID:</span>
                <span className="font-mono font-bold text-zinc-800">{participant.participantId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 font-medium">Sample ID:</span>
                <span className="font-mono text-zinc-700">{participant.sampleId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 font-medium">Clinical Category:</span>
                <span className="font-mono font-bold text-black">{participant.diagnosis}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 font-medium">Data Dimensions:</span>
                <span className="font-mono text-zinc-700">300 frames x 17 dimensions</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  // Standard manual CSV builder for finish panel
                  const headers = ['Timestamp', 'Elapsed', 'S1_Gas', 'S2_Gas', 'S3_Gas', 'S4_Gas'];
                  const rows = activeReadings.map((r) => [r.timestamp, r.elapsed, r.s1Gas, r.s2Gas, r.s3Gas, r.s4Gas]);
                  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
                  const encodedUri = encodeURI(csv);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `VOC_${participant.diagnosis.toUpperCase()}_${participant.participantId}_${participant.sampleId}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full sm:flex-1 bg-black hover:bg-zinc-800 text-white py-2 px-4 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Download Lab CSV</span>
              </button>
              
              <button
                onClick={resetWizard}
                className="w-full sm:flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-zinc-200"
              >
                Start New Session
              </button>
            </div>
          </div>
        )}

        {/* STEPPERS NAVIGATION BUTTON BAR */}
        {currentStep < 6 && (
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-6">
            <button
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1 || currentStep === 4 || currentStep === 5}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-200/60"
            >
              Back
            </button>

            {currentStep === 1 && (
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!isDeviceConnected}
                className="bg-black hover:bg-zinc-800 active:scale-95 text-white font-semibold text-xs py-2 px-5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Continue to Metadata</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-black hover:bg-zinc-800 active:scale-95 text-white font-semibold text-xs py-2 px-5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Protocol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={() => setCurrentStep(4)}
                disabled={!prepChecklist.chamberCleaned || !prepChecklist.sampleInserted || !prepChecklist.chamberSealed || !prepChecklist.filterActive}
                className="bg-black hover:bg-zinc-800 active:scale-95 text-white font-semibold text-xs py-2 px-5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                title="Complete protocol checks to continue"
              >
                <span>Start Stabilization</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 4 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-zinc-400">Heating sensors...</span>
              </div>
            )}

            {currentStep === 5 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-red-500 animate-pulse font-semibold">Recording live...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
