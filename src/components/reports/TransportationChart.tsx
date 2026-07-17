import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TransportationChartProps {
  data: {
    route: string;
    occupied: number;
    capacity: number;
  }[];
}

export function TransportationChart({ data }: TransportationChartProps) {
  const chartData = {
    labels: data.map(item => item.route),
    datasets: [
      {
        label: 'Assigned Passengers',
        data: data.map(item => item.occupied),
        backgroundColor: '#6366f1',
        borderRadius: 4,
      },
      {
        label: 'Max Seating Capacity',
        data: data.map(item => item.capacity),
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        stacked: false,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
