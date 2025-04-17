'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// Dynamically import ApexCharts to avoid server-side rendering issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartProps {
  title: string;
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'radar';
  series: any[];
  xaxis?: any;
  yaxis?: any;
  height?: number;
  options?: any;
  className?: string;
}

const Chart: React.FC<ChartProps> = ({
  title,
  type,
  series,
  xaxis,
  yaxis,
  height = 350,
  options = {},
  className,
}) => {
  // Merge default options with provided options
  const chartOptions = {
    chart: {
      type,
      toolbar: {
        show: false,
      },
    },
    colors: ['#0ea5e9', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'],
    xaxis: xaxis || {},
    yaxis: yaxis || {},
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: 'light',
      x: {
        show: true,
      },
    },
    grid: {
      show: true,
      borderColor: '#e2e8f0',
      strokeDashArray: 5,
      position: 'back',
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
    ...options,
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div id={`chart-${title.replace(/\s+/g, '-').toLowerCase()}`}>
          {/* Check if window is defined to ensure we're on the client side */}
          {typeof window !== 'undefined' && (
            <ReactApexChart
              options={chartOptions}
              series={series}
              type={type}
              height={height}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Chart;

