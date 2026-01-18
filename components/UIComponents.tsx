import React from 'react';
import { motion } from 'framer-motion';

interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
}

export const GlassPanel: React.FC<PanelProps> = ({ title, children, className = '', borderColor = 'border-cyan-500/30' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative flex flex-col bg-slate-900/60 backdrop-blur-md border ${borderColor} rounded-lg p-4 shadow-xl ${className}`}
    >
      {title && (
        <h3 className="text-xs uppercase tracking-widest text-cyan-400 mb-3 font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const SciSlider: React.FC<SliderProps> = ({ label, value, min, max, step, unit, onChange, disabled }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs text-slate-400 font-semibold">{label}</label>
        <span className="text-xs font-mono text-cyan-300">{value.toFixed(1)} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors ${disabled ? 'bg-slate-700' : 'bg-slate-700 hover:bg-slate-600'}`}
        style={{
          backgroundImage: `linear-gradient(to right, ${disabled ? '#64748b' : '#06b6d4'} 0%, ${disabled ? '#64748b' : '#06b6d4'} ${(value - min) / (max - min) * 100}%, transparent ${(value - min) / (max - min) * 100}%, transparent 100%)`
        }}
      />
    </div>
  );
};

export const DataMetric: React.FC<{ label: string; value: string | number; unit?: string; status?: 'normal' | 'warning' | 'danger' }> = ({ label, value, unit, status = 'normal' }) => {
  let colorClass = 'text-cyan-300';
  if (status === 'warning') colorClass = 'text-amber-400';
  if (status === 'danger') colorClass = 'text-red-400';

  return (
    <div className="flex flex-col bg-slate-800/50 p-3 rounded border border-slate-700">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-end gap-1 mt-1">
        <span className={`text-xl font-mono font-bold ${colorClass}`}>{value}</span>
        {unit && <span className="text-xs text-slate-500 mb-1">{unit}</span>}
      </div>
    </div>
  );
};
