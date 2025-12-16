import React, { useState, useEffect, memo } from 'react';
import { SystemLoadChart } from './HolographicCharts';

// Isolated component for time display to prevent re-renders of parent
export const TimeWidget = memo(() => {
    const [time, setTime] = useState('');
    
    useEffect(() => {
        const timeInterval = setInterval(() => {
            const now = new Date();
            setTime(now.toLocaleTimeString('zh-CN', { hour12: false }) + `.${now.getMilliseconds().toString().padStart(3, '0')}`);
        }, 100); // Reduced from 50ms to 100ms
        
        return () => clearInterval(timeInterval);
    }, []);

    return (
        <div className="text-2xl font-mono text-holo-cyan mt-[-5px] tracking-widest flex justify-end items-center gap-4">
            <span className="animate-blink text-alert-red text-xs border border-alert-red px-2 py-0.5 rounded bg-alert-red/10">实时画面</span>
            {time}
        </div>
    );
});

// Isolated component for Hex Dump to prevent re-renders of parent
export const HexDumpWidget = memo(() => {
    const [hexDump, setHexDump] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const chars = '0123456789ABCDEF';
            const line = '0x' + Array(8).fill(0).map(() => chars[Math.floor(Math.random() * 16)]).join('');
            setHexDump(prev => [line, ...prev.slice(0, 4)]);
        }, 200); // Reduced from 80ms to 200ms

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute top-8 left-8 z-30 flex flex-col gap-2 w-64 h-32 animate-slide-in-left">
            <SystemLoadChart />
            <div className="font-mono text-[10px] text-klein-blue opacity-60 leading-tight h-12 overflow-hidden mt-1">
                {hexDump.map((line, i) => <div key={i}>{line}</div>)}
            </div>
        </div>
    );
});
