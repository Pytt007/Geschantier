import React, { useState, useEffect } from 'react';

interface LineChartProps {
  data: {
    label: string;
    value: number;
  }[];
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => 
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">Aucune donnée de performance.</div>;
  }
  
  const width = 500;
  const height = 250;
  const paddingY = 40;
  const paddingX = 30;

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const xScale = (i: number) => (i / (data.length - 1)) * (width - 2 * paddingX) + paddingX;
  const yScale = (v: number) => height - paddingY - (v / (maxValue || 1)) * (height - 2 * paddingY);
  
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(d.value)}`).join(' ');

  const areaPath = `${path} L ${xScale(data.length - 1)},${height - paddingY} L ${xScale(0)},${height - paddingY} Z`;

  const gridColor = isDarkMode ? '#334155' : '#e2e8f0'; // slate-700 vs slate-200
  const circleFill = isDarkMode ? '#1A242D' : '#fff'; // card-dark vs white

  return (
    <div className="w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map(tick => {
            const y = yScale(tick * maxValue);
            return(
                <g key={tick} className="text-xs text-slate-400 dark:text-slate-500">
                    <text x={paddingX - 10} y={y} textAnchor="end" alignmentBaseline="middle" fill="currentColor">{Math.round(tick * maxValue)}</text>
                    <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke={gridColor} strokeDasharray="2,2" />
                </g>
            )
        })}

        {data.map((d, i) => (
          <text key={i} x={xScale(i)} y={height - paddingY + 20} textAnchor="middle" className="text-xs text-slate-500 dark:text-slate-400" fill="currentColor">{d.label}</text>
        ))}
        
        <path d={areaPath} fill="url(#areaGradient)" />
        
        <path d={path} fill="none" stroke="#6366f1" strokeWidth="2" />

        {data.map((d, i) => (
            <circle key={i} cx={xScale(i)} cy={yScale(d.value)} r="4" fill={circleFill} stroke="#6366f1" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
};