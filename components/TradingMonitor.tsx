import React, { useState, useEffect } from 'react';

interface TradingData {
    algoState: 'ON' | 'OFF';
    dailyPL: number;
    winRate: number;
    activePositions: number;
    pendingOrders: number;
    currentDrawdown: number;
    maxDrawdown: number;
    longestPosition: number;
    maxPositionTime: number;
    largestPosition: number;
    maxPositionSize: number;
    brokerStatus: 'CONNECTED' | 'DISCONNECTED';
    dataFeedStatus: 'CONNECTED' | 'DISCONNECTED';
    lastUpdate: string;
}

const TradingMonitor: React.FC = () => {
    const [data, setData] = useState<TradingData>({
        algoState: 'ON',
        dailyPL: 2847.50,
        winRate: 73,
        activePositions: 3,
        pendingOrders: 2,
        currentDrawdown: -150,
        maxDrawdown: -500,
        longestPosition: 8,
        maxPositionTime: 15,
        largestPosition: 12,
        maxPositionSize: 20,
        brokerStatus: 'CONNECTED',
        dataFeedStatus: 'CONNECTED',
        lastUpdate: new Date().toISOString()
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => ({
                ...prev,
                dailyPL: prev.dailyPL + (Math.random() - 0.3) * 50,
                currentDrawdown: Math.max(prev.currentDrawdown + (Math.random() - 0.5) * 20, prev.maxDrawdown),
                longestPosition: Math.min(prev.longestPosition + 0.5, 25),
                lastUpdate: new Date().toISOString()
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getDrawdownColor = (): string => {
        const ratio = Math.abs(data.currentDrawdown / data.maxDrawdown);
        if (ratio > 0.8) return '#FF3737';
        if (ratio > 0.5) return '#FFA500';
        return '#00D26A';
    };

    const getTimeColor = (): string => {
        if (data.longestPosition > data.maxPositionTime) return '#FF3737';
        if (data.longestPosition > data.maxPositionTime * 0.8) return '#FFA500';
        return '#00D26A';
    };

    const getPositionSizeColor = (): string => {
        if (data.largestPosition > data.maxPositionSize) return '#FF3737';
        if (data.largestPosition > data.maxPositionSize * 0.8) return '#FFA500';
        return '#00D26A';
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            padding: '20px',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24px', margin: 0, color: '#666' }}>TRADING MONITOR</h1>
                <div style={{ fontSize: '12px', color: '#444', marginTop: '5px' }}>
                    Last update: {new Date(data.lastUpdate).toLocaleTimeString()}
                </div>
            </div>

            <div style={{
                backgroundColor: '#1A1A1A',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '15px',
                border: '1px solid #2A2A2A'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '16px', margin: 0, color: '#888' }}>ALGORITHM</h2>
                    <div style={{
                        backgroundColor: data.algoState === 'ON' ? '#00D26A' : '#FF3737',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        {data.algoState}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>P&L TODAY</div>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: data.dailyPL >= 0 ? '#00D26A' : '#FF3737'
                        }}>
                            ${data.dailyPL.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Win Rate: {data.winRate}%</div>
                    </div>

                    <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>POSITIONS</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.activePositions}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Orders: {data.pendingOrders}</div>
                    </div>
                </div>
            </div>

            <div style={{
                backgroundColor: '#1A1A1A',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '15px',
                border: '1px solid #2A2A2A'
            }}>
                <h2 style={{ fontSize: '16px', margin: 0, marginBottom: '15px', color: '#888' }}>RISK</h2>

                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>DRAWDOWN</span>
                        <span style={{ fontSize: '12px', color: getDrawdownColor() }}>
              ${data.currentDrawdown} / ${data.maxDrawdown}
            </span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#2A2A2A',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.abs(data.currentDrawdown / data.maxDrawdown) * 100}%`,
                            height: '100%',
                            backgroundColor: getDrawdownColor(),
                            transition: 'all 0.3s ease'
                        }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>LONGEST POSITION</div>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: getTimeColor()
                        }}>
                            {data.longestPosition.toFixed(1)} min
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>LARGEST POSITION</div>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: getPositionSizeColor()
                        }}>
                            {data.largestPosition}%
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                backgroundColor: '#1A1A1A',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #2A2A2A'
            }}>
                <h2 style={{ fontSize: '16px', margin: 0, marginBottom: '15px', color: '#888' }}>SYSTEM</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: data.brokerStatus === 'CONNECTED' ? '#00D26A' : '#FF3737'
                        }} />
                        <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>BROKER</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{data.brokerStatus}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: data.dataFeedStatus === 'CONNECTED' ? '#00D26A' : '#FF3737'
                        }} />
                        <div>
                            <div style={{ fontSize: '12px', color: '#666' }}>DATA FEED</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{data.dataFeedStatus}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingMonitor;