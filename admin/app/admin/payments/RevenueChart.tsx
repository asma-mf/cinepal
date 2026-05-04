'use client';

import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export function RevenueChart({ payments }: { payments: any[] }) {
  const chartData = useMemo(() => {
    // Group payments by date
    const daily: Record<string, number> = {};
    
    // Default to last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daily[dateStr] = 0;
    }

    payments.forEach(p => {
      if (p.status === 'success' || p.status === 'partial_refund') {
        // If partial refund, we only keep half the money
        const effectiveAmount = p.status === 'partial_refund' ? p.amount / 2 : p.amount;
        
        const dateStr = new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (daily[dateStr] !== undefined) {
          daily[dateStr] += effectiveAmount;
        }
      }
    });

    return Object.entries(daily).map(([date, amount]) => ({
      date,
      amount
    }));
  }, [payments]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
        <XAxis 
          dataKey="date" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `LKR ${value}`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px' }}
          itemStyle={{ color: '#22c55e' }}
        />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="#22c55e" 
          strokeWidth={3}
          dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#111' }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StatusDistributionChart({ payments }: { payments: any[] }) {
  const data = useMemo(() => {
    let success = 0;
    let refunded = 0;
    let partial = 0;

    payments.forEach(p => {
      if (p.status === 'success') success++;
      else if (p.status === 'refunded') refunded++;
      else if (p.status === 'partial_refund') partial++;
    });

    return [
      { name: 'Success', value: success, color: '#22c55e' },
      { name: 'Partial Refund', value: partial, color: '#f59e0b' },
      { name: 'Refunded', value: refunded, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [payments]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333" />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#888' }} width={100} />
        <Tooltip 
        cursor={{ fill: 'background'  }} 
        contentStyle={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px' }} 
        itemStyle={{ color: '#fff' }}
        formatter={(value) => `LKR ${value}`}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
