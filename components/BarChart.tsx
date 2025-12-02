
import React from 'react';

interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
  const barWidth = 40;
  const gap = 20;
  const width = data.length * (barWidth + gap) + gap;

  return (
    <div className="w-full h-full overflow-x-auto">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 30); // Reserve 30px for text
          const x = gap + index * (barWidth + gap);
          const y = height - barHeight - 25;
          
          return (
            <g key={index} className="group">
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                className="transition-all duration-300 hover:opacity-80"
                fill={item.color || '#6366f1'} // Default indigo-500
              />
              
              {/* Value Label (Top of bar) */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs font-bold fill-slate-600 dark:fill-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {item.value}
              </text>

              {/* Category Label (Bottom) */}
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                className="text-xs font-medium fill-slate-500 dark:fill-slate-400"
                style={{ fontSize: '10px' }}
              >
                {item.label.length > 8 ? item.label.substring(0, 6) + '..' : item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
