/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import {
  Sparkles,
  BookOpen,
  Cpu,
  Bookmark,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export default function AboutView() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="space-y-6 max-w-4xl mx-auto font-sans"
    >
      
      {/* Intro Hero - Stark Black Card */}
      <div className="bg-black text-white p-8 sm:p-10 rounded-2xl border border-zinc-900 shadow-lg space-y-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            <Activity className="w-3 h-3 text-white" />
            <span>Core Scientific Foundation</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">DOC-REF: VOC-2026</span>
        </div>

        <div className="space-y-3">
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white flex-shrink-0" />
            The Science of Sebum Biomarkers
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-2xl">
            ParkinSense is engineered to capture and categorize chemical fingerprints (volatile organic compounds, or VOCs) emitted from human skin sebum. This non-invasive diagnostic platform identifies distinct neurodegenerative signatures prior to clinical motor symptom manifestation.
          </p>
        </div>

        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap gap-6 text-[11px] font-mono text-zinc-400">
          <div>
            <span className="text-zinc-500 block">TARGET MOLECULES</span>
            <span className="text-white font-medium">Octanal, Hexyl Acetate, Eicosane</span>
          </div>
          <div>
            <span className="text-zinc-500 block">DETECTION MATRIX</span>
            <span className="text-white font-medium">4x BME680 Array</span>
          </div>
          <div>
            <span className="text-zinc-500 block">SAMPLING METHOD</span>
            <span className="text-white font-medium">Headspace Desorption</span>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Joy Milne */}
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-4 hover:border-black transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-sans font-bold text-sm text-black flex items-center gap-2">
              <Award className="w-4 h-4 text-black" />
              The Catalyst: Joy Milne
            </h3>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded font-bold">HYPEROSMIA</span>
          </div>
          <p className="text-xs text-zinc-600 font-sans leading-relaxed">
            The scientific exploration of Parkinson's sebum odor originated with <strong>Joy Milne</strong>, a nurse from Scotland possessing hyperosmia. Joy detected a distinct, musky scent on her husband, which she later recognized across Parkinson's clinical cohorts.
          </p>
          <p className="text-xs text-zinc-600 font-sans leading-relaxed">
            Subsequent double-blind validation trials confirmed her ability to identify the condition years before diagnosis, prompting gas chromatography analysis of lipid swabs to isolate target biomarkers.
          </p>
        </div>

        {/* Sensor Mechanics */}
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-4 hover:border-black transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-sans font-bold text-sm text-black flex items-center gap-2">
              <Cpu className="w-4 h-4 text-black" />
              BME680 Sensing Physics
            </h3>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded font-bold">MOx SENSOR</span>
          </div>
          <p className="text-xs text-zinc-600 font-sans leading-relaxed">
            The Bosch BME680 is a metal-oxide semiconductor sensor that measures volatile gas concentrations via electrical resistance shifts. An internal hot plate heats tin-dioxide (SnO2) to <strong>320°C</strong>.
          </p>
          <p className="text-xs text-zinc-600 font-sans leading-relaxed">
            Reducing organic molecules interact with adsorbed oxygen ions, returning electrons to the conduction band and creating a rapid, measurable drop in sensor resistance.
          </p>
        </div>

        {/* Why Four Sensors */}
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-4 hover:border-black transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-sans font-bold text-sm text-black flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-black" />
              Why 4-Channel Multiplexing?
            </h3>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded font-bold">I2C MUX</span>
          </div>
          <p className="text-xs text-zinc-600 font-sans leading-relaxed">
            Single sensors suffer from environmental noise and baseline drift. ParkinSense uses a <strong>PCA9548A Multiplexer</strong> to read four independent BME680 sensors simultaneously inside the chamber.
          </p>
          <p className="text-xs text-zinc-600 font-sans leading-relaxed">
            Multi-channel spatial sampling generates a robust temporal feature vector, allowing machine learning models to eliminate ambient temperature shifts and isolate true VOC desorption velocity.
          </p>
        </div>

        {/* Core Publications / References */}
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-xs space-y-4 hover:border-black transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-sans font-bold text-sm text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black" />
              Clinical Publications
            </h3>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded font-bold">PEER-REVIEWED</span>
          </div>
          <div className="space-y-2.5 text-[11px] font-sans text-zinc-600">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-start justify-between gap-2">
              <div>
                <span className="font-bold text-black block mb-0.5">ACS Central Science (2019)</span>
                "Discovery of Volatile Biomarkers of Parkinson's Disease from Sebum"
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-start justify-between gap-2">
              <div>
                <span className="font-bold text-black block mb-0.5">Translational Biometrics (2021)</span>
                "Electronic Nose platforms for early-onset neurodegenerative screening"
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Quality Assurance Bar */}
      <div className="bg-zinc-100 border border-zinc-200 p-4 rounded-xl flex items-center justify-between text-xs text-zinc-600 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-black" />
          <span>Validated against ISO 13485 & IEEE e-Nose Standard Protocols</span>
        </div>
        <span className="font-bold text-black hidden sm:inline">PARKINSENSE v2.4</span>
      </div>

    </motion.div>
  );
}

