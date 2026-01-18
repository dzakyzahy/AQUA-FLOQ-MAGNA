import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { GlassPanel } from './UIComponents';

interface ChartsPanelProps {
  pollutantLoad: number;
  dosage: number;
  recoveryRate: number;
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({ pollutantLoad, dosage, recoveryRate }) => {
  
  // Chart A: Kinetic Adsorption (Ct = C0 * e^-kt)
  const kineticData = useMemo(() => {
    const data = [];
    const k = dosage * 0.15; // Reaction rate constant depends on dosage
    const c0 = pollutantLoad;
    
    for (let t = 0; t <= 60; t+=5) {
      const ct = c0 * Math.exp(-k * (t/10));
      data.push({ time: t, concentration: ct });
    }
    return data;
  }, [pollutantLoad, dosage]);

  // Chart B: Recovery Rate (Gauge-like representation)
  const recoveryData = [
    { name: 'Recovered', value: recoveryRate },
    { name: 'Lost', value: 100 - recoveryRate },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Kinetic Chart */}
      <GlassPanel title="Kinetic Adsorption" className="h-[200px] shrink-0">
        <div className="w-full h-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={kineticData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                label={{ value: 'Time (min)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} 
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="#94a3b8" 
                label={{ value: 'Conc.', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Area 
                type="monotone" 
                dataKey="concentration" 
                stroke="#06b6d4" 
                fillOpacity={1} 
                fill="url(#colorConc)" 
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      {/* Recovery Efficiency */}
      <GlassPanel title="Magnetic Recovery Yield" className="h-[180px] shrink-0">
        <div className="flex items-center justify-center h-full gap-4">
             <div className="relative w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recoveryData}>
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {recoveryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#334155'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                {/* Fixed Overlay with background for readability */}
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-10">
                    <span className="text-xl font-bold font-mono text-emerald-400 drop-shadow-md bg-slate-900/40 rounded px-1">{recoveryRate.toFixed(1)}%</span>
                    <span className="text-[8px] text-slate-300 mt-1 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-600">EFFICIENCY</span>
                </div>
             </div>
             <div className="flex flex-col gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                    <span>Recovered</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                    <span>Loss</span>
                </div>
                <div className="mt-2 text-[10px] text-cyan-500 font-mono border-t border-slate-700 pt-2">
                    STATUS: CLOSED-LOOP
                </div>
             </div>
        </div>
      </GlassPanel>
    </div>
  );
};
