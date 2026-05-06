import {PFlex} from '@porsche-design-system/components-react';

export interface TimelineDataPoint {
    date: string;
    [key: string]: number | string;
}

interface TimelineSeries {
    key: string;
    color: string;
    label: string;
}

interface TimelineChartProps {
    data: TimelineDataPoint[];
    series: TimelineSeries[];
    height?: number;
    width?: number;
    showMarkers?: boolean;
}

export const LegendItem: React.FC<{ color: string, label: string }> = ({ color, label }) => (
    <PFlex alignItems="center" style={{ gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
        <div style={{ fontSize: '11px', color: '#999', fontWeight: 'bold' }}>{label}</div>
    </PFlex>
);

export const FilterPill: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            padding: '6px 16px',
            borderRadius: '16px',
            border: active ? '1px solid #111' : '1px solid #e0e0e0',
            backgroundColor: active ? '#111' : 'white',
            color: active ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: active ? 'bold' : 'normal',
            whiteSpace: 'nowrap',
            transition: 'all 0.1s'
        }}
    >
        {label}
    </button>
);

export const TimelineChart: React.FC<TimelineChartProps> = ({
    data,
    series,
    height = 320,
    width = 1200,
    showMarkers = true
}) => {
    const padding = 20;

    if (!data || data.length === 0) return null;

    // 1. Calculate Time Range
    const dates = data.map(d => new Date(d.date).getTime());
    const minTime = Math.min(...dates);
    const maxTime = Math.max(...dates);
    const timeRange = maxTime - minTime || 1;

    // 2. Find max value for Y-scale
    let maxVal = 0;
    data.forEach(d => {
        series.forEach(s => {
            const val = Number(d[s.key]) || 0;
            if (val > maxVal) maxVal = val;
        });
    });
    if (maxVal === 0) maxVal = 1;

    // Helper to get coordinates
    const getX = (dateStr: string) => {
        const t = new Date(dateStr).getTime();
        return padding + ((t - minTime) / timeRange) * (width - 2 * padding);
    };
    const getY = (val: number) => (height - 30) - (val / maxVal) * (height - 70);

    const getPath = (key: string) => {
        const points = data.map(d => ({ x: getX(d.date), y: getY(Number(d[key]) || 0) }));
        if (points.length < 2) return "";
        return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    };

    const getAreaPath = (key: string) => {
        const points = data.map(d => ({ x: getX(d.date), y: getY(Number(d[key]) || 0) }));
        if (points.length < 2) return "";
        const line = getPath(key);
        return `${line} L ${points[points.length - 1].x} ${height - 30} L ${points[0].x} ${height - 30} Z`;
    };

    return (
        <svg
            viewBox={`0 0 ${width} ${height + 40}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
            <defs>
                {series.map(s => (
                    <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                    </linearGradient>
                ))}
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
                <line
                    key={v}
                    x1={padding}
                    y1={getY(v * maxVal)}
                    x2={width - padding}
                    y2={getY(v * maxVal)}
                    stroke="#222"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                />
            ))}

            {/* Area Fills */}
            {series.map(s => (
                <path
                    key={`area-${s.key}`}
                    d={getAreaPath(s.key)}
                    fill={`url(#grad-${s.key})`}
                />
            ))}

            {/* Lines */}
            {series.map(s => (
                <path
                    key={`line-${s.key}`}
                    d={getPath(s.key)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ))}

            {/* Dots */}
            {data.map((d, i) => (
                <g key={i}>
                    {series.map(s => {
                        const dayOffset = Math.floor((new Date(d.date).getTime() - minTime) / (24 * 60 * 60 * 1000));
                        return (
                            <circle
                                key={`${i}-${s.key}`}
                                cx={getX(d.date)}
                                cy={getY(Number(d[s.key]) || 0)}
                                r="6"
                                fill={s.color}
                                stroke="#111"
                                strokeWidth="1"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.setAttribute('r', '10');
                                    e.currentTarget.style.filter = 'brightness(1.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.setAttribute('r', '6');
                                    e.currentTarget.style.filter = 'none';
                                }}
                            >
                                <title>{s.label}: {d[s.key]} tenders | Day: +{dayOffset}d ({d.date})</title>
                            </circle>
                        );
                    })}
                </g>
            ))}

            {/* Axis Line */}
            <line x1={0} y1={height - 30} x2={width} y2={height - 30} stroke="#444" strokeWidth="1" />

            {/* Day Markers */}
            {showMarkers && (() => {
                const day = 24 * 60 * 60 * 1000;
                const markers = [];
                const totalDays = timeRange / day;

                for (let i = 7; i < totalDays; i += 7) {
                    const x = padding + (i * day / timeRange) * (width - 2 * padding);
                    markers.push(
                        <g key={i}>
                            <line x1={x} y1={height - 35} x2={x} y2={height - 25} stroke="#666" strokeWidth="1" />
                            <text
                                x={x}
                                y={height - 5}
                                fill="#666"
                                fontSize="10"
                                textAnchor="middle"
                                fontWeight="bold"
                            >
                                +{i}d
                            </text>
                        </g>
                    );
                }
                return markers;
            })()}

            {/* Date Labels */}
            {data.length > 0 && (
                <>
                    <text x={padding + 10} y={height - 5} fill="#fff" fontSize="12" textAnchor="start" fontWeight="bold">
                        {`${data[0].date.slice(8, 10)}.${data[0].date.slice(5, 7)}.`}
                    </text>
                    {data.length > 1 && (
                        <text x={width - padding - 10} y={height - 5} fill="#fff" fontSize="12" textAnchor="end" fontWeight="bold">
                            {`${data[data.length - 1].date.slice(8, 10)}.${data[data.length - 1].date.slice(5, 7)}.`}
                        </text>
                    )}
                </>
            )}
        </svg>
    );
};

export interface StackedBarChartDataPoint {
    date: string;
    [key: string]: number | string;
}

interface StackedBarChartProps {
    data: StackedBarChartDataPoint[];
    series: { key: string; color: string; label: string }[];
    height?: number;
    width?: number;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
    data,
    series,
    height = 320,
    width = 1200
}) => {
    const padding = 40;

    if (!data || data.length === 0) return null;

    // Calculate max Y value for scaling
    let maxY = 0;
    data.forEach(d => {
        let total = 0;
        series.forEach(s => {
            total += Number(d[s.key]) || 0;
        });
        if (total > maxY) maxY = total;
    });
    // Add 10% headroom
    maxY = Math.ceil(maxY * 1.1) || 10;

    // Helper: Screen coordinates
    const barWidth = Math.max(10, Math.min(40, (width - 2 * padding) / data.length * 0.6));
    const gap = ((width - 2 * padding) / data.length) - barWidth;

    const getX = (index: number) => padding + index * (barWidth + gap) + gap / 2;
    const getY = (val: number) => (height - 30) - (val / maxY) * (height - 60);
    const getBarHeight = (val: number) => (val / maxY) * (height - 60);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <svg
                viewBox={`0 0 ${width} ${height + 20}`}
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(v => (
                    <line
                        key={v}
                        x1={padding}
                        y1={getY(v * maxY)}
                        x2={width - padding}
                        y2={getY(v * maxY)}
                        stroke="#333"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                    />
                ))}

                {/* Y-Axis Labels */}
                {[0, 0.5, 1].map(v => (
                    <text
                        key={`y-${v}`}
                        x={padding - 10}
                        y={getY(v * maxY) + 4}
                        fill="#666"
                        fontSize="10"
                        textAnchor="end"
                    >
                        {Math.round(v * maxY)}
                    </text>
                ))}

                {/* Bars */}
                {data.map((d, i) => {
                    let currentY = height - 30;
                    return (
                        <g key={i}>
                            {series.map((s) => {
                                const val = Number(d[s.key]) || 0;
                                if (val === 0) return null;
                                const h = getBarHeight(val);
                                currentY -= h;

                                return (
                                    <rect
                                        key={`${i}-${s.key}`}
                                        x={getX(i)}
                                        y={currentY}
                                        width={barWidth}
                                        height={h}
                                        fill={s.color}
                                        rx={2}
                                        style={{ transition: 'all 0.3s' }}
                                    >
                                        <title>{s.label}: {val} (Date: {d.date})</title>
                                    </rect>
                                );
                            })}

                            {/* Total Value on Top */}
                            <text
                                x={getX(i) + barWidth / 2}
                                y={currentY - 5}
                                fill="#fff"
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {d._total !== undefined ? d._total : series.reduce((sum, s) => sum + (Number(d[s.key]) || 0), 0)}
                            </text>

                            {/* Date Label X-Axis */}
                            {(data.length <= 10 || i % Math.ceil(data.length / 10) === 0) && (
                                <text
                                    x={getX(i) + barWidth / 2}
                                    y={height - 10}
                                    fill="#999"
                                    fontSize="10"
                                    textAnchor="middle"
                                >
                                    {`${d.date.slice(8, 10)}.${d.date.slice(5, 7)}.`}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* X-Axis Line */}
                <line x1={padding} y1={height - 30} x2={width - padding} y2={height - 30} stroke="#444" strokeWidth="1" />
            </svg>

            {/* Legend */}
            <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px' }}>
                {series.map(s => (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', background: s.color, borderRadius: '2px' }} />
                        <span style={{ fontSize: '10px', color: '#fff' }}>{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export interface DistributionChartDataPoint {
    label: string;
    [key: string]: number | string;
}

interface DistributionChartProps {
    data: DistributionChartDataPoint[];
    series: { key: string; color: string; label: string }[];
    height?: number;
    width?: number;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
    data,
    series,
    height = 320,
    width = 1200
}) => {
    const padding = 40;

    if (!data || data.length === 0) return null;

    // Calculate max Y value for scaling
    // Calculate max Y value for scaling
    let maxY = 0;
    data.forEach(d => {
        let total = 0;
        series.forEach(s => {
            total += Number(d[s.key]) || 0;
        });
        if (total > maxY) maxY = total;
    });
    // Add 10% headroom, ensure at least 10
    maxY = Math.max(Math.ceil(maxY * 1.1), 10);

    // Helper: Screen coordinates
    const chartHeight = height - 40; // reduced top/bottom padding
    const chartWidth = width - 2 * padding;

    // Dynamic bar width
    const minBarWidth = 20;
    const computedBarWidth = Math.min(60, (chartWidth / data.length) * 0.8);
    const barWidth = Math.max(minBarWidth, computedBarWidth);

    // Centering the bars
    const totalContentWidth = data.length * barWidth + (data.length - 1) * 10; // 10px gap
    const startX = padding + (chartWidth - totalContentWidth) / 2;
    const gap = 10;

    const getX = (index: number) => startX + index * (barWidth + gap);
    const getY = (val: number) => (height - 30) - (val / maxY) * chartHeight;
    const getBarHeight = (val: number) => (val / maxY) * chartHeight;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <svg
                viewBox={`0 0 ${width} ${height + 20}`}
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(v => (
                    <line
                        key={v}
                        x1={padding}
                        y1={getY(v * maxY)}
                        x2={width - padding}
                        y2={getY(v * maxY)}
                        stroke="#333"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                    />
                ))}

                {/* Y-Axis Labels */}
                {[0, 0.5, 1].map(v => (
                    <text
                        key={`y-${v}`}
                        x={padding - 10}
                        y={getY(v * maxY) + 4}
                        fill="#666"
                        fontSize="10"
                        textAnchor="end"
                    >
                        {Math.round(v * maxY)}
                    </text>
                ))}

                {/* Bars */}
                {data.map((d, i) => {
                    let currentY = height - 30;
                    return (
                        <g key={i}>
                            {series.map((s) => {
                                const val = Number(d[s.key]) || 0;
                                if (val === 0) return null;
                                const h = getBarHeight(val);
                                currentY -= h;

                                return (
                                    <rect
                                        key={`${i}-${s.key}`}
                                        x={getX(i)}
                                        y={currentY}
                                        width={barWidth}
                                        height={h}
                                        fill={s.color}
                                        rx={2}
                                        style={{ transition: 'all 0.3s' }}
                                    >
                                        <title>{s.label}: {val} ({d.label})</title>
                                    </rect>
                                );
                            })}

                            {/* Total Value on Top */}
                            <text
                                x={getX(i) + barWidth / 2}
                                y={currentY - 5}
                                fill="#fff"
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {series.reduce((sum, s) => sum + (Number(d[s.key]) || 0), 0)}
                            </text>

                            {/* Label X-Axis */}
                            <text
                                x={getX(i) + barWidth / 2}
                                y={height - 10}
                                fill="#999"
                                fontSize="10"
                                textAnchor="middle"
                            >
                                {d.label}
                            </text>
                        </g>
                    );
                })}

                {/* X-Axis Line */}
                <line x1={padding} y1={height - 30} x2={width - padding} y2={height - 30} stroke="#444" strokeWidth="1" />
            </svg>
        </div>
    );
};
