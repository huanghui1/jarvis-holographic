import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// --- Shared Styles ---
const holoColors = {
  cyan: '#00F0FF',
  blue: '#00A3FF',
  red: '#FF2A2A',
  bg: 'rgba(0, 20, 40, 0.5)',
  grid: 'rgba(0, 240, 255, 0.1)'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-holo-cyan p-2 text-xs font-mono shadow-[0_0_10px_rgba(0,240,255,0.3)] backdrop-blur-sm">
        <p className="text-holo-cyan mb-1">{`T-${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
             <div className="w-2 h-2" style={{ backgroundColor: entry.color }}></div>
             <span className="text-white">{`${entry.name}: ${entry.value}%`}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- System Load Chart (Area/Line) ---
const dataLoad = Array.from({ length: 20 }, (_, i) => ({
  name: i,
  cpu: Math.floor(Math.random() * 30) + 40,
  gpu: Math.floor(Math.random() * 40) + 20,
}));

export const SystemLoadChart = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-1 px-1">
          <span className="text-[10px] font-bold text-holo-cyan tracking-widest uppercase">System Load</span>
          <div className="flex gap-1">
             <div className="w-1.5 h-1.5 bg-holo-cyan animate-pulse"></div>
          </div>
      </div>
      <div className="flex-1 min-h-0 border border-holo-cyan/20 bg-black/20 backdrop-blur-sm relative">
         {/* Corner Accents */}
         <div className="absolute top-0 left-0 w-1 h-1 bg-holo-cyan"></div>
         <div className="absolute bottom-0 right-0 w-1 h-1 bg-holo-cyan"></div>
         
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataLoad}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={holoColors.cyan} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={holoColors.cyan} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={holoColors.blue} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={holoColors.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke={holoColors.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: holoColors.cyan, strokeWidth: 1, strokeDasharray: '2 2' }} />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke={holoColors.cyan} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCpu)" 
                isAnimationActive={false} // Performance
              />
              <Area 
                type="monotone" 
                dataKey="gpu" 
                stroke={holoColors.blue} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorGpu)" 
                isAnimationActive={false}
              />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Energy Distribution (Bar Chart) ---
const dataEnergy = [
  { name: 'Core', value: 85 },
  { name: 'Wpn', value: 45 },
  { name: 'Shld', value: 60 },
  { name: 'Prop', value: 30 },
];

export const EnergyChart = () => {
  return (
    <div className="w-full h-full flex flex-col">
       <div className="flex justify-between items-center mb-1 px-1">
          <span className="text-[10px] font-bold text-holo-cyan tracking-widest uppercase">Power Dist</span>
      </div>
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
           <BarChart data={dataEnergy} layout="vertical" barSize={8}>
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: holoColors.cyan, fontSize: 10, fontFamily: 'monospace' }} 
                width={30}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{fill: 'rgba(0, 240, 255, 0.05)'}} content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                {dataEnergy.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? holoColors.cyan : holoColors.blue} />
                ))}
              </Bar>
           </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
