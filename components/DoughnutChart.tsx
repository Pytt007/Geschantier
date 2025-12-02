import React from 'react';

interface DoughnutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}

export const DoughnutChart: React.FC<DoughnutChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return <div className="flex items-center justify-center h-48 w-48 text-slate-500 dark:text-slate-400">Aucune donnée</div>;
  }

  let cumulative = 0;
  const segments = data.map(item => {
    const startAngle = (cumulative / total) * 360;
    cumulative += item.value;
    const endAngle = (cumulative / total) * 360;
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
    const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
    const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
    const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);

    return {
      path: `M ${startX},${startY} A 40,40 0 ${largeArcFlag},1 ${endX},${endY}`,
      color: item.color,
    };
  });

  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48">
      <svg viewBox="0 0 100 100">
        {segments.map((segment, i) => (
          <path
            key={i}
            d={segment.path}
            fill="none"
            stroke={segment.color}
            strokeWidth="18"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{total}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">Projets</span>
      </div>
    </div>
  );
};