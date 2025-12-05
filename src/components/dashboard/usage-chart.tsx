"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { date: "Mar 1", requests: 186 },
  { date: "Mar 2", requests: 305 },
  { date: "Mar 3", requests: 237 },
  { date: "Mar 4", requests: 173 },
  { date: "Mar 5", requests: 209 },
  { date: "Mar 6", requests: 214 },
  { date: "Mar 7", requests: 128 },
]

const chartConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--primary))",
  },
}

export function UsageChart() {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
