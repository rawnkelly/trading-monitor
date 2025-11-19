"use client";

import React, { useState, useEffect, useRef } from 'react';

// --- 1. TYPES ---

interface Position {
    id: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    pnl: number;
    entryPrice: number;
    markPrice: number;
    zScore: number;
    durationMinutes: number;
    maxDurationMinutes: number;
    priceHistory: number[];
}

interface LogMessage {
    id: number;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'CRIT';
    message: string;
}

interface DashboardData {
    dailyPnL: number;
    winRate: number;
    health: {
        latencyMs: number;
        apiRequestsRemaining: number;
        apiLimitMax: number;
        memoryUsageMB: number;
        totalMemoryMB: number;
        status: 'ALIVE' | 'DEGRADED' | 'HALTED';
    };
    positions: Position[];
    logs: LogMessage[];
}

// --- 2. HELPER COMPONENTS ---

// A. Sparkline Chart (The Squiggly Line)
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={data.map((val, i) =>
                    `${(i / (data.length - 1)) * 100},${30 - ((val - min) / range) * 30}`
                ).join(' ')}
            />
        </svg>
    );
};

// B. Status Dot (The Green/Red Light)
const StatusDot: React.FC<{ status: string }> = ({ status }) => {
    const color = status === 'ALIVE' ? '#00D26A' : status === 'DEGRADED' ? '#FFA500' : '#FF3737';
    return (
        <div className="relative flex items-center justify-center w-3 h-3">
            <div className="absolute w-full h-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: color }}></div>
            <div className="relative w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
        </div>
    );
};

// C. Safe Trigger Button (Hold-to-Kill Logic)
interface SafeTriggerProps {
    label?: string;
    activeLabel?: string;
    isDestructive?: boolean;
    onTrigger: () => void;
    className?: string;
}

const SafeTriggerButton: React.FC<SafeTriggerProps> = ({
                                                           label = "HOLD TO KILL",
                                                           activeLabel = "CLOSING...",
                                                           isDestructive = true,
                                                           onTrigger,
                                                           className = ""
                                                       }) => {
    const [progress, setProgress] = useState(0);
    const [isPressing, setIsPressing] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const HOLD_DURATION = 800; // 0.8s hold for snappy but safe execution

    const startPress = () => setIsPressing(true);

    const endPress = () => {
        setIsPressing(false);
        setProgress(0);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    useEffect(() => {
        if (isPressing) {
            timerRef.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(timerRef.current!);
                        onTrigger();
                        return 0;
                    }
                    return prev + (100 / (HOLD_DURATION / 50));
                });
            }, 50);
        } else {
            setProgress(0);
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPressing, onTrigger]);

    // Styles
    const baseColors = isDestructive
        ? 'border-red-900/50 text-red-500 hover:bg-red-900/20 bg-red-950/10'
        : 'border-green-800 text-green-500 hover:bg-green-900/10';

    const fillColors = isDestructive ? 'bg-red-600' : 'bg-green-600';

    return (
        <button
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            className={`relative overflow-hidden border rounded flex items-center justify-center font-mono text-[10px] font-bold tracking-wider transition-all active:scale-95 select-none ${baseColors} ${className}`}
        >
            {/* Progress Bar Fill */}
            <div
                className={`absolute left-0 top-0 bottom-0 ${fillColors} opacity-40 transition-all duration-75 ease-linear`}
                style={{ width: `${progress}%` }}
            />
            <span className="relative z-10">{progress > 0 ? activeLabel : label}</span>
        </button>
    );
};

// --- 3. MAIN TRADING MONITOR ---

const TradingMonitor: React.FC = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Initial Mock State
    const [data, setData] = useState<DashboardData>({
        dailyPnL: 1240.50,
        winRate: 68,
        health: {
            latencyMs: 45,
            apiRequestsRemaining: 1850,
            apiLimitMax: 2000,
            memoryUsageMB: 450,
            totalMemoryMB: 1024,
            status: 'ALIVE'
        },
        positions: [
            { id: '1', symbol: 'BTC/USD', side: 'LONG', pnl: 450.00, entryPrice: 64000, markPrice: 64500, zScore: -2.4, durationMinutes: 14, maxDurationMinutes: 45, priceHistory: [64000, 63950, 63900, 64100, 64200, 64150, 64300, 64500] },
            { id: '2', symbol: 'ETH/USD', side: 'SHORT', pnl: -120.50, entryPrice: 3400, markPrice: 3420, zScore: 1.8, durationMinutes: 180, maxDurationMinutes: 60, priceHistory: [3400, 3390, 3380, 3410, 3415, 3425, 3420, 3420] },
            { id: '3', symbol: 'SOL/USD', side: 'LONG', pnl: 85.20, entryPrice: 145, markPrice: 148, zScore: -1.1, durationMinutes: 5, maxDurationMinutes: 45, priceHistory: [145, 144, 146, 145, 147, 146, 147, 148] }
        ],
        logs: [
            { id: 1, timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'System initialized' },
            { id: 2, timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'Connected to Kraken WS' },
        ]
    });

    // Logic: Close specific position
    const closePosition = (id: string, symbol: string) => {
        setData(prev => ({
            ...prev,
            positions: prev.positions.filter(p => p.id !== id),
            logs: [...prev.logs, {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                level: 'WARN',
                message: `MANUAL LIQUIDATION: ${symbol} CLOSED`
            }]
        }));
    };

    // Simulation Loop (Replace this with Supabase logic later)
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const newLatency = Math.max(20, Math.floor(prev.health.latencyMs + (Math.random() - 0.5) * 40));
                const newPnL = prev.dailyPnL + (Math.random() - 0.45) * 50;

                const newLogs = [...prev.logs];
                if (Math.random() > 0.9) {
                    const msgs = ['Order Book Update', 'Latency Spike', 'Garbage Collection', 'Strategy Heartbeat'];
                    newLogs.push({
                        id: Date.now(),
                        timestamp: new Date().toLocaleTimeString(),
                        level: 'INFO',
                        message: msgs[Math.floor(Math.random() * msgs.length)]
                    });
                    if (newLogs.length > 50) newLogs.shift();
                }

                return {
                    ...prev,
                    dailyPnL: newPnL,
                    health: {
                        ...prev.health,
                        latencyMs: newLatency,
                        status: newLatency > 300 ? 'DEGRADED' : 'ALIVE',
                        apiRequestsRemaining: Math.max(0, prev.health.apiRequestsRemaining - 1),
                    },
                    logs: newLogs,
                    positions: prev.positions.map(pos => ({
                        ...pos,
                        pnl: pos.pnl + (Math.random() - 0.5) * 10,
                        priceHistory: [...pos.priceHistory.slice(1), pos.priceHistory[7] + (Math.random() - 0.5) * 10]
                    }))
                };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Scroll Logs
    useEffect(() => {
        if (isDrawerOpen && logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [data.logs, isDrawerOpen]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-mono flex flex-col overflow-hidden selection:bg-green-900 selection:text-white">

            {/* 1. HUD HEADER */}
            <header className="h-16 bg-[#0F0F0F] border-b border-[#222] px-4 flex items-center justify-between shrink-0 z-50 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <StatusDot status={data.health.status} />
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 font-bold tracking-wider">LATENCY</span>
                            <span className={`text-xs ${data.health.latencyMs < 100 ? 'text-green-500' : 'text-red-500'}`}>
                                {data.health.latencyMs}ms
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-[9px] text-gray-500 font-bold tracking-wider">DAILY PNL</div>
                    <div className={`text-lg font-medium tracking-tight ${data.dailyPnL >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                        {data.dailyPnL >= 0 ? '+' : ''}{data.dailyPnL.toFixed(2)}
                    </div>
                </div>
            </header>

            {/* 2. MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-hide">

                {/* Active Positions Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-baseline mb-3">
                        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Active Positions ({data.positions.length})
                        </h2>
                    </div>

                    {/* Horizontal Scroll Container (Z-Layout) */}
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:pb-0">
                        {data.positions.map(pos => {
                            const isStale = pos.durationMinutes > pos.maxDurationMinutes;
                            const progress = Math.min(100, (pos.durationMinutes / pos.maxDurationMinutes) * 100);

                            return (
                                <div key={pos.id} className="snap-center flex-none w-[85vw] md:w-auto bg-[#111] border border-[#222] p-4 rounded-sm relative flex flex-col shadow-sm hover:border-[#333] transition-colors">

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex gap-2 items-center">
                                                <span className="font-bold text-sm text-white tracking-wide">{pos.symbol}</span>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-sm ${pos.side === 'LONG' ? 'border-green-900 text-green-500 bg-green-900/10' : 'border-red-900 text-red-500 bg-red-900/10'}`}>
                                                    {pos.side}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-1 font-medium">
                                                Z-SCORE: <span className="text-gray-300">{pos.zScore.toFixed(2)}σ</span>
                                            </div>
                                        </div>
                                        <div className={`text-base font-medium ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                            {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Sparkline Graph */}
                                    <div className="h-10 mb-4 opacity-60">
                                        <Sparkline data={pos.priceHistory} color={pos.pnl >= 0 ? '#00D26A' : '#FF3737'} />
                                    </div>

                                    {/* Stale Trade Indicator */}
                                    <div className="space-y-1 mb-5">
                                        <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                                            <span>{pos.durationMinutes}m</span>
                                            <span>LIMIT: {pos.maxDurationMinutes}m</span>
                                        </div>
                                        <div className="h-1 bg-[#222] w-full overflow-hidden rounded-full">
                                            <div
                                                className={`h-full transition-all duration-500 ${isStale ? 'bg-red-500' : 'bg-gray-600'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* SURGICAL KILL SWITCH */}
                                    <div className="mt-auto">
                                        <SafeTriggerButton
                                            label="LIQUIDATE POSITION"
                                            activeLabel="KILLING..."
                                            className="w-full h-9"
                                            onTrigger={() => closePosition(pos.id, pos.symbol)}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {data.positions.length === 0 && (
                            <div className="w-full h-32 border border-[#222] border-dashed flex items-center justify-center text-gray-600 text-xs">
                                NO ACTIVE POSITIONS
                            </div>
                        )}
                    </div>
                </div>

                {/* System Health Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#111] border border-[#222] p-3 rounded-sm">
                        <div className="text-[9px] text-gray-500 font-bold mb-1">API REQUESTS</div>
                        <div className="text-xs">{data.health.apiRequestsRemaining} / {data.health.apiLimitMax}</div>
                        <div className="w-full bg-[#222] h-0.5 mt-2">
                            <div className="bg-blue-500 h-full" style={{ width: `${(data.health.apiRequestsRemaining / data.health.apiLimitMax) * 100}%` }} />
                        </div>
                    </div>
                    <div className="bg-[#111] border border-[#222] p-3 rounded-sm">
                        <div className="text-[9px] text-gray-500 font-bold mb-1">MEMORY (RAM)</div>
                        <div className="text-xs">{data.health.memoryUsageMB.toFixed(0)}MB / {data.health.totalMemoryMB}MB</div>
                        <div className="w-full bg-[#222] h-0.5 mt-2">
                            <div className="bg-purple-500 h-full" style={{ width: `${(data.health.memoryUsageMB / data.health.totalMemoryMB) * 100}%` }} />
                        </div>
                    </div>
                </div>

            </main>

            {/* 3. LOGS DRAWER (Bottom Sheet) */}
            <div className={`fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-[#222] transition-all duration-300 ease-out z-40 flex flex-col shadow-[0_-5px_20px_rgba(0,0,0,0.5)] ${isDrawerOpen ? 'h-[60vh]' : 'h-12'}`}>
                {/* Handle */}
                <div
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    className="h-12 flex items-center px-4 cursor-pointer hover:bg-[#111] border-b border-[#222] group"
                >
                    <div className={`w-2 h-2 rounded-full mr-3 transition-colors ${data.logs.length > 0 && data.logs[data.logs.length-1].level === 'WARN' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-600 group-hover:bg-blue-500'}`} />
                    <div className="flex-1 text-[10px] text-gray-400 truncate font-mono group-hover:text-gray-200">
                        {data.logs.length > 0 ? `> [${data.logs[data.logs.length - 1].timestamp}] ${data.logs[data.logs.length - 1].message}` : '> System Ready'}
                    </div>
                    <div className="text-[9px] text-gray-600 font-bold border border-gray-800 px-1.5 py-0.5 rounded group-hover:border-gray-600 group-hover:text-gray-300">
                        {isDrawerOpen ? 'CLOSE' : 'LOGS'}
                    </div>
                </div>

                {/* Terminal Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-[10px] text-gray-400 bg-black/50">
                    {data.logs.map((log) => (
                        <div key={log.id} className="flex gap-3 hover:bg-white/5 p-0.5 rounded px-1">
                            <span className="opacity-40 min-w-[60px]">[{log.timestamp}]</span>
                            <span className={`min-w-[30px] font-bold ${log.level === 'CRIT' ? 'text-red-500' : log.level === 'WARN' ? 'text-yellow-500' : 'text-blue-500'}`}>
                                {log.level}
                            </span>
                            <span className="text-gray-300">{log.message}</span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
};

export default TradingMonitor;