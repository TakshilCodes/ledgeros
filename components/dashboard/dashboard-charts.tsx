"use client";

import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type CategoryBreakdown = {
  category: string;
  label: string;
  amount: number;
  percentage: number;
};

type Props = {
  categories: CategoryBreakdown[];
  total: number;
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

export function SpendingDonutChart({ categories, total }: Props) {
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
        display: false,
      },
      tooltip: {
        backgroundColor: "#151B23",
        titleColor: "#ffffff",
        bodyColor: "#C9D1D9",
        borderColor: "rgba(240, 246, 252, 0.1)",
        borderWidth: 1,
        callbacks: {
          label(context: TooltipItem<"doughnut">) {
            const value = Number(context.raw || 0);
            return ` ${context.label}: ₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
  };

  return (
    <div className="relative h-44 w-full sm:h-56">
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">
          Total spent
        </span>
        <span className="mt-0.5 max-w-28 truncate text-sm font-semibold text-foreground tabular-nums sm:text-base">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(total)}
        </span>
      </div>
    </div>
  );
}