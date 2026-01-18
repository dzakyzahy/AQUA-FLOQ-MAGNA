import React, { useState, useEffect, useCallback } from 'react';
import { GlassPanel, SciSlider, DataMetric } from './components/UIComponents';
import { Scene3D } from './components/Scene3D';
import { ChartsPanel } from './components/ChartsPanel';
import { EconomicsPanel } from './components/EconomicsPanel';
import { SimulationState } from './types';
import { AlertTriangle, CheckCircle2, RotateCw } from 'lucide-react';

const App: React.FC = () => {
  // --- Simulation State ---
  const [state, setState] = useState<SimulationState>({
    pollutantLoad: 50,
    dosage: 0.8,
    flowRate: 120,
    ph: 7.2,
    turbidity: 15,
    dissolvedOxygen: 6.5,
    recoveryRate: 98.2,
    isAutoDosing: true,
    alerts: [],
  });

  // --- Logic: Dynamic Dosing & IoT Simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        let newDosage = prev.dosage;
        const newAlerts: string[] = [];

        // Dynamic Dosing Algorithm
        if (prev.isAutoDosing) {
          const requiredDosage = prev.pollutantLoad / 50; // Simple model
          if (Math.abs(newDosage - requiredDosage) > 0.1) {
             // Smoothly adjust dosage
             newDosage = prev.dosage + (requiredDosage - prev.dosage) * 0.1;
             if (prev.pollutantLoad > 70) {
                 newAlerts.push("High Contamination: Increasing Dosage");
             }
          }
        }

        // Physics Calculation
        // Turbidity decreases as dosage matches load
        // Ideal dosage ratio = 1.0. If dosage is too low, turbidity high.
        const dosageRatio = newDosage / (prev.pollutantLoad / 50);
        let calculatedTurbidity = 5 + (prev.pollutantLoad * 0.5) * Math.max(0, 1 - dosageRatio);
        // Add sensor noise
        calculatedTurbidity += (Math.random() - 0.5) * 1; 

        // DO: Inverse to turbidity (simulated)
        let calculatedDO = 8.5 - (calculatedTurbidity / 20);
        
        // Recovery Rate: stable high, drops slightly if flow too high
        const flowFactor = Math.max(0, (prev.flowRate - 150) * 0.05);
        const calculatedRecovery = 99 - flowFactor + (Math.random() - 0.5) * 0.2;

        return {
          ...prev,
          dosage: Math.max(0.1, Math.min(3.0, newDosage)),
          turbidity: Math.max(0, calculatedTurbidity),
          dissolvedOxygen: Math.max(0, Math.min(10, calculatedDO)),
          recoveryRate: Math.max(0, Math.min(100, calculatedRecovery)),
          alerts: newAlerts
        };
      });
    }, 1000); // 1Hz update for sensors

    return () => clearInterval(interval);
  }, []);

  const handleSliderChange = useCallback((key: keyof SimulationState, value: number) => {
    setState(prev => ({ ...prev, [key]: value, isAutoDosing: key === 'dosage' ? false : prev.isAutoDosing }));
  }, []);

  const toggleAutoDosing = () => {
    setState(prev => ({ ...prev, isAutoDosing: !prev.isAutoDosing }));
  };

  const handleExport = () => {
      // Trigger print dialog for the report
      window.print();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0f172a] text-slate-100 overflow-hidden relative">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #06b6d4 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}></div>

      {/* --- HEADER --- */}
      <header className="flex-none h-20 border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-md z-20 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <RotateCw className="text-white animate-spin-slow" size={24} />
            </div>
            <div>
                <h2 className="text-sm text-cyan-400 font-mono tracking-wider">AQUA-FLOC MAGNA</h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-slate-400">SYSTEM ONLINE</span>
                </div>
            </div>
        </div>

        {/* CENTER TITLE */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <h1 className="text-4xl font-extrabold text-white tracking-[0.3em] font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                OKTAN ITB
            </h1>
            <span className="text-[10px] text-cyan-500/80 tracking-[0.5em] mt-1 font-mono uppercase">ISOTERM 2026 Competition Entry</span>
        </div>

        <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-xs text-slate-400 font-mono">DATE: 2026-02-08</p>
                <p className="text-xs text-slate-400 font-mono">LOC: BANDUNG, ID</p>
             </div>
             <button 
                onClick={handleExport}
                className="px-4 py-2 bg-cyan-500/10 border border-cyan-500 text-cyan-400 text-xs font-bold rounded hover:bg-cyan-500/20 transition-all active:scale-95"
             >
                EXPORT REPORT
             </button>
        </div>
      </header>

      {/* --- MAIN DASHBOARD LAYOUT --- */}
      <main className="flex-1 p-6 grid grid-cols-12 gap-6 z-10 overflow-hidden relative">
        
        {/* LEFT SIDEBAR: CONTROLS */}
        <div className="col-span-3 flex flex-col gap-6 overflow-y-auto pr-1">
           <GlassPanel title="Control Parameters" className="flex-none">
              <SciSlider 
                label="Inlet Pollutant Load" 
                value={state.pollutantLoad} 
                min={0} max={100} step={1} unit="%" 
                onChange={(v) => handleSliderChange('pollutantLoad', v)} 
              />
              <SciSlider 
                label="River Flow Rate" 
                value={state.flowRate} 
                min={50} max={200} step={5} unit="L/min" 
                onChange={(v) => handleSliderChange('flowRate', v)} 
              />
              <SciSlider 
                label="pH Level" 
                value={state.ph} 
                min={0} max={14} step={0.1} unit="" 
                onChange={(v) => handleSliderChange('ph', v)} 
              />
           </GlassPanel>

           <GlassPanel title="Smart Dosing System" className="flex-none">
               <div className="flex items-center justify-between mb-4 bg-slate-800/50 p-3 rounded border border-slate-700">
                   <span className="text-xs font-semibold text-slate-300">Auto-Adjust Mode</span>
                   <button 
                    onClick={toggleAutoDosing}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${state.isAutoDosing ? 'bg-cyan-500' : 'bg-slate-600'}`}
                   >
                       <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${state.isAutoDosing ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
               </div>
               
               <SciSlider 
                label="Adsorbent Dosage" 
                value={state.dosage} 
                min={0.1} max={3.0} step={0.1} unit="g/L" 
                onChange={(v) => handleSliderChange('dosage', v)}
                disabled={state.isAutoDosing}
              />
              
              {/* ALERTS LOG */}
              <div className="mt-4 h-24 overflow-y-auto bg-black/40 rounded p-2 border border-slate-700 font-mono text-[10px]">
                  {state.alerts.length === 0 ? (
                      <span className="text-slate-500 flex items-center gap-2"><CheckCircle2 size={10}/> System nominal. Optimal dosing maintained.</span>
                  ) : (
                      state.alerts.map((alert, i) => (
                          <div key={i} className="text-amber-400 mb-1 flex items-center gap-2">
                             <AlertTriangle size={10} /> <span>{alert}</span>
                          </div>
                      ))
                  )}
                  {state.isAutoDosing && (
                       <div className="text-cyan-500 mt-1 animate-pulse">
                           &gt; Auto-adjusting adsorbent dosage to maintain &lt;5 NTU...
                       </div>
                  )}
              </div>
           </GlassPanel>
        </div>

        {/* CENTER: 3D DIGITAL TWIN */}
        <div className="col-span-6 flex flex-col gap-6">
            <Scene3D 
                pollutantLoad={state.pollutantLoad} 
                dosage={state.dosage} 
                flowRate={state.flowRate} 
            />
            {/* BOTTOM SENSORS ROW */}
            <div className="h-24 grid grid-cols-4 gap-4">
                <GlassPanel className="justify-center items-center p-0">
                    <DataMetric label="Turbidity" value={state.turbidity.toFixed(2)} unit="NTU" status={state.turbidity > 10 ? 'warning' : 'normal'} />
                </GlassPanel>
                <GlassPanel className="justify-center items-center p-0">
                    <DataMetric label="Dissolved O2" value={state.dissolvedOxygen.toFixed(2)} unit="mg/L" />
                </GlassPanel>
                 <GlassPanel className="justify-center items-center p-0">
                    <DataMetric label="UV Intensity" value="254" unit="nm" />
                </GlassPanel>
                 <GlassPanel className="justify-center items-center p-0">
                    <DataMetric label="Mag. Field" value="0.5" unit="T" />
                </GlassPanel>
            </div>
        </div>

        {/* RIGHT SIDEBAR: ANALYTICS & ECONOMICS */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
            <ChartsPanel 
                pollutantLoad={state.pollutantLoad} 
                dosage={state.dosage}
                recoveryRate={state.recoveryRate}
            />
            
            <EconomicsPanel 
                flowRate={state.flowRate}
                recoveryRate={state.recoveryRate}
            />

            {/* System Health (Collapsed/Mini version if needed, or kept full) */}
            <GlassPanel title="System Health" className="flex-none" borderColor="border-slate-500/30">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Pump A (Inlet)</span>
                        <span className="text-emerald-400 font-mono">RUNNING</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1 rounded overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[80%]"></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-slate-400">Magnetic Drum</span>
                        <span className="text-emerald-400 font-mono">ACTIVE</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1 rounded overflow-hidden">
                        <div className="bg-cyan-500 h-full w-[95%] animate-pulse"></div>
                    </div>

                     <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-slate-400">Filter Integrity</span>
                        <span className="text-cyan-400 font-mono">98%</span>
                    </div>
                </div>
            </GlassPanel>
        </div>

      </main>
    </div>
  );
};

export default App;
