
"use client";
import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ProjectTransferData {
  date: string;
  [projectName: string]: number | string;
}

interface ProjectTransfersAreaChartProps {
  data: any[]; // Expecting the last10DaysTransfers array
}


const formatChartData = (data: any[]): ProjectTransferData[] => {
  return data.map((day) => {
    const formattedDay: ProjectTransferData = {
      date: new Date(day.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
    Object.entries(day.projectTransfers).forEach(([_, projectData]: [string, any]) => {
      formattedDay[projectData.projectName] = projectData.totalTransferredToday;
    });
    return formattedDay;
  });
};

const colorHues = [
  'rgb(59, 130, 246)',    // blue
  'rgb(34, 197, 94)',     // green
  'rgb(234, 179, 8)',     // yellow
  'rgb(239, 68, 68)',     // red
  'rgb(168, 85, 247)',    // purple
  'rgb(236, 72, 153)',    // pink
  'rgb(249, 115, 22)',    // orange
  'rgb(79, 70, 229)',     // indigo
  'rgb(20, 184, 166)',    // teal
  'rgb(6, 182, 212)'      // cyan
];

const fakeData = [

  
    { "date": "Dec 19", "F 17, 10": 100, "House 12": 200, "Test": 300 },
    { "date": "Dec 20", "F 17, 10": 0, "House 12": 150, "Test": 250 },
    { "date": "Dec 21", "F 17, 10": 200, "House 12": 300, "Test": 400 },
    { "date": "Dec 23", "F 17, 10": 400, "House 12": 500, "Test": 600 },
    { "date": "Dec 24", "F 17, 10": 670, "House 12": 800, "Test": 900 },
    { "date": "Dec 25", "House 12": 1000, "Test": 10101, "F 17, 10": 1100 }
  
  
]



export function ProjectTransfersAreaChart({ data }: ProjectTransfersAreaChartProps) {
  const chartData = formatChartData(data);
  console.log(chartData);
  console.log(fakeData);
  console.log(data);
  const projectNames = Array.from(
    new Set(data.flatMap((day) => Object.values(day.projectTransfers).map((p: any) => p.projectName)))
  );

  const chartConfig: ChartConfig = Object.fromEntries(
    projectNames.map((projectName, index) => [
      projectName,
      {
        label: projectName,
        color: colorHues[index % colorHues.length],
      },
    ])
  );

  return (
    <div className="w-full h-full">
      <div className="pl-2">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fakeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => (value ? `Rs ${value.toLocaleString('en-PK')}` : '')}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              {projectNames.map((projectName, index) => (
                <Area
                  key={projectName}
                  type="monotone"
                  dataKey={projectName}
                  stroke={colorHues[index % colorHues.length]}
                  fill={colorHues[index % colorHues.length]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}

