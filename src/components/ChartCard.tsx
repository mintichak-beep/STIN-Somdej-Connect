import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { BarChart3, PieChart, Activity, Download } from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface ChartCardProps {
  id?: string;
  title: string;
  type: 'bar' | 'doughnut' | 'line';
  labels: string[];
  values: number[];
  colors?: string[];
  datasetLabel?: string;
  onExport?: () => void;
}

export function ChartCard({
  id,
  title,
  type,
  labels,
  values,
  colors,
  datasetLabel = 'Count',
  onExport
}: ChartCardProps) {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#e4e4e7' : '#3f3f46';
  const gridColor = isDark ? 'rgba(63, 63, 70, 0.4)' : 'rgba(228, 228, 231, 0.6)';

  // Safe Fallback Color Pool
  const backgroundColors = useMemo(() => {
    if (colors && colors.length > 0) return colors;
    if (type === 'doughnut') {
      return [
        '#D6001C', // STIN Red
        '#0288D1', // Info Blue
        '#2E7D32', // Success Green
        '#ED6C02', // Warning Orange
        '#7B1FA2', // Purple
        '#FFC107'  // Yellow
      ];
    }
    return ['rgba(214, 0, 28, 0.85)']; // STIN Primary Red semi-transparent
  }, [colors, type]);

  const chartData = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: values,
        backgroundColor: backgroundColors,
        borderColor: type === 'line' ? '#D6001C' : backgroundColors.map(c => c.replace('0.85', '1')),
        borderWidth: type === 'line' ? 3 : 1,
        tension: 0.35,
        fill: type === 'line',
        pointBackgroundColor: '#D6001C',
        pointBorderColor: '#fff',
        pointHoverRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'doughnut',
        position: 'bottom' as const,
        labels: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 11,
            weight: 'bold' as any
          },
          padding: 16,
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        titleColor: isDark ? '#f4f4f5' : '#18181b',
        bodyColor: isDark ? '#a1a1aa' : '#4b5563',
        borderColor: isDark ? '#27272a' : '#e4e4e7',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: {
          family: 'Inter, sans-serif',
          weight: 'bold' as any
        },
        bodyFont: {
          family: 'Inter, sans-serif'
        }
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 10
          },
          stepSize: 1
        }
      }
    } : undefined
  };

  const renderIcon = () => {
    switch (type) {
      case 'bar': return <BarChart3 className="h-4 w-4 text-red-600" />;
      case 'doughnut': return <PieChart className="h-4 w-4 text-emerald-600" />;
      case 'line': return <Activity className="h-4 w-4 text-sky-600" />;
    }
  };

  return (
    <div id={id} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-all dark:border-zinc-800/80 dark:bg-zinc-950/70 hover:shadow-md">
      {/* Top Decorator Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:via-zinc-800" />
      
      <div className="mb-6 flex items-center justify-between border-b border-gray-50 pb-3 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          {renderIcon()}
          <h4 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400">
            {title}
          </h4>
        </div>
        {onExport && (
          <button
            onClick={onExport}
            title="Download data"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-zinc-900"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="relative h-64 w-full">
        {values.length === 0 || values.every(v => v === 0) ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-gray-400 dark:text-zinc-500">No Placement Data Records</p>
            <p className="text-xs text-gray-300 dark:text-zinc-600 mt-0.5">Adjust active filters to populate distributions</p>
          </div>
        ) : (
          <>
            {type === 'bar' && <Bar data={chartData} options={chartOptions as any} />}
            {type === 'doughnut' && <Doughnut data={chartData} options={chartOptions as any} />}
            {type === 'line' && <Line data={chartData} options={chartOptions as any} />}
          </>
        )}
      </div>
    </div>
  );
}
