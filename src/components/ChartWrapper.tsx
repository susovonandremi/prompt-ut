'use client';

// Client-only chart wrapper to avoid SSR issues with Recharts
import React from 'react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ChartWrapperProps {
    type: string;
    data: any[];
    xAxisKey: string;
    series: { key: string; color?: string; name?: string }[];
    height?: number | string;
    title?: string;
}

const DEFAULT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export function ChartWrapper({ type, data, xAxisKey, series, height = 300, title }: ChartWrapperProps) {
    const ChartComponent = type === 'bar' ? BarChart : type === 'area' ? AreaChart : LineChart;
    const chartHeight = typeof height === 'string' ? parseInt(height, 10) || 300 : height;

    return (
        <div className="w-full" style={{ height: chartHeight }}>
            {title && <h3 className="text-sm font-medium mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <ChartComponent data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey={xAxisKey} stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `$${value}`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                        itemStyle={{ color: '#e5e7eb' }}
                    />
                    {series.map((s, i) => {
                        const color = s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
                        return type === 'bar' ? <Bar key={i} dataKey={s.key} fill={color} radius={[4, 4, 0, 0]} /> :
                            type === 'area' ? <Area key={i} type="monotone" dataKey={s.key} stroke={color} fill={color} fillOpacity={0.2} /> :
                                <Line key={i} type="monotone" dataKey={s.key} stroke={color} strokeWidth={2} dot={false} />;
                    })}
                </ChartComponent>
            </ResponsiveContainer>
        </div>
    );
}
