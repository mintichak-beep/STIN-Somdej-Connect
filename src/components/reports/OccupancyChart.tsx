import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OccupancyChartProps {
  occupied: number;
  available: number;
}

export function OccupancyChart({ occupied, available }: OccupancyChartProps) {
  const data = {
    labels: ['Occupied Beds', 'Available Beds'],
    datasets: [
      {
        data: [occupied, available],
        backgroundColor: ['#f59e0b', '#e2e8f0'],
        borderColor: ['#d97706', '#cbd5e1'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="relative h-64 w-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
}
