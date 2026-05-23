"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

type CategoryBreakdown = {
  category: string;
  label: string;
  amount: number;
  percentage: number;
};

type Props = {
  categories: CategoryBreakdown[];
};

const chartColors = [
  "#58A6FF",
  "#3FB950",
  "#F85149",
  "#D29922",
  "#A371F7",
  "#DB61A2",
  "#56D4DD",
];

export function SpendingDonutChart({ categories }: Props) {
  const data = {
    labels: categories.map((category) => category.label),
    datasets: [
      {
        data: categories.map((category) => category.amount),
        backgroundColor: chartColors,
        borderColor: "#0D1117",
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#8B949E",
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          padding: 14,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "#151B23",
        titleColor: "#ffffff",
        bodyColor: "#C9D1D9",
        borderColor: "#3D444D",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const value = Number(context.raw || 0);

            return ` ${context.label}: ₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
  };

  return (
    <div className="relative h-55 w-full">
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function SpendingBarChart({ categories }: Props) {
  const data = {
    labels: categories.map((category) => category.label),
    datasets: [
      {
        label: "Amount Spent",
        data: categories.map((category) => category.amount),
        backgroundColor: "#58A6FF",
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#151B23",
        titleColor: "#ffffff",
        bodyColor: "#C9D1D9",
        borderColor: "#3D444D",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const value = Number(context.raw || 0);

            return `₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#8B949E",
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: "#8B949E",
          font: {
            size: 11,
          },
          callback: function (value: any) {
            return `₹${Number(value).toLocaleString("en-IN")}`;
          },
        },
        grid: {
          color: "#21262D",
        },
      },
    },
  };

  return (
    <div className="relative h-55 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}