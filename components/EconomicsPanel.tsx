import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GlassPanel } from './UIComponents';
import { TrendingUp, DollarSign, Leaf } from 'lucide-react';

const useEconomicCalc = (flowRate: number, recoveryRate: number) => {
    const [savings, setSavings] = useState(1450000); 

    useEffect(() => {
        const interval = setInterval(() => {
            // Logic: Savings increase based on flow (volume treated) and recovery (material saved)
            // flowRate L/min * 60 min/h * 24h/day.
            // Assume slight accumulation per second for visualization
            const efficiencyFactor = recoveryRate / 100;
            // Simulated increment
            const savingsPerTick = (flowRate * 0.5) * efficiencyFactor + (Math.random() * 50); 
            
            setSavings(prev => prev + savingsPerTick);
        }, 1000);
        return () => clearInterval(interval);
    }, [flowRate, recoveryRate]);

    return savings;
};

interface EconomicsPanelProps {
    flowRate: number;
    recoveryRate: number;
}

export const EconomicsPanel: React.FC<EconomicsPanelProps> = ({ flowRate, recoveryRate }) => {
    const savings = useEconomicCalc(flowRate, recoveryRate);
    
    // Dynamic Cost Calculation
    // Conventional cost is static. Magna cost drops as recoveryRate increases.
    // Base cost 5000 IDR/m3. 
    const conventionalCost = 5000;
    const magnaCost = conventionalCost * (1 - (recoveryRate / 100) * 0.8) + 200; // +200 baseline

    const data = [
        { name: 'Conv.', cost: conventionalCost, color: '#94a3b8' }, 
        { name: 'Magna', cost: magnaCost, color: '#10b981' }, 
    ];

    return (
        <GlassPanel title="Techno-Economic Analysis" borderColor="border-emerald-500/30" className="flex-none">
            {/* Real-Time Ticker */}
            <div className="mb-4 bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-lg flex items-center justify-between">
                <div>
                    <div className="text-[9px] text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <TrendingUp size={10} /> Cumulative OPEX Savings
                    </div>
                    <div className="text-xl font-mono font-bold text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                        IDR {Math.floor(savings).toLocaleString('id-ID')}
                    </div>
                </div>
                 <div className="text-right">
                    <div className="text-[8px] text-slate-500 uppercase">Est. ROI</div>
                    <div className="text-xs text-emerald-400 font-mono font-bold">+{(recoveryRate * 0.45).toFixed(1)}%</div>
                </div>
            </div>

            <div className="flex gap-3 h-32">
                {/* Comparative Bar Chart */}
                <div className="flex-1 flex flex-col">
                     <div className="text-[8px] text-slate-400 mb-1 text-center font-mono uppercase">Cost Analysis (IDR/m³)</div>
                     <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{fontSize: 9, fill: '#64748b'}} axisLine={false} tickLine={false} interval={0} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{backgroundColor: '#0f172a', borderColor: '#10b981', fontSize: '10px', color: '#fff'}}
                                    formatter={(value: number) => [`IDR ${value.toFixed(0)}`, 'Cost']}
                                />
                                <Bar dataKey="cost" radius={[4, 4, 0, 0]} animationDuration={1000}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                </div>

                {/* Resource Valuation & Stats */}
                <div className="w-[45%] flex flex-col gap-2">
                    {/* Valuation Card */}
                    <div className="bg-slate-800/50 rounded border border-slate-700 p-2 relative overflow-hidden group">
                        <div className="absolute -right-2 -top-2 text-amber-500/10 group-hover:text-amber-500/20 transition-all">
                            <DollarSign size={40}/>
                        </div>
                        <div className="text-[8px] text-slate-400 uppercase flex items-center gap-1">
                             <Leaf size={8} className="text-amber-400"/> Recovered Value
                        </div>
                        <div className="text-sm font-mono font-bold text-amber-400 mt-1">
                            ${((recoveryRate * flowRate * 0.05) / 100).toFixed(2)}/h
                        </div>
                    </div>
                    
                    {/* Unit Economics Table */}
                    <div className="flex-1 text-[9px] flex flex-col justify-between p-1">
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                            <span className="text-slate-500">Energy</span>
                            <span className="text-emerald-400 font-mono">LOW</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                            <span className="text-slate-500">Chemical</span>
                            <span className="text-emerald-400 font-mono">-90%</span>
                        </div>
                         <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Sludge</span>
                            <span className="text-emerald-400 font-mono">0%</span>
                        </div>
                    </div>
                </div>
            </div>
        </GlassPanel>
    );
};
