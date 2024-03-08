'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts';

import { cn, shuffleArray } from '@/lib/utils';

import { Skeleton } from './ui/skeleton';

interface AnalyticsBarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  mutedDescription: string;
  data?: { value: number }[];
}

export default function AnalyticsBarChart({
  title,
  description,
  mutedDescription,
  data,
  className,
  ...props
}: AnalyticsBarChartProps) {
  const colors = shuffleArray([
    'hsl(var(--red))',
    'hsl(var(--orange))',
    'hsl(var(--yellow))',
    'hsl(var(--green))',
    'hsl(var(--blue))',
    'hsl(var(--purple))',
  ]);

  return (
    <div
      className={cn(
        'w-full bg-card text-card-foreground border rounded-lg shadow-sm',
        className,
      )}
      {...props}
    >
      <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <h3 className="text-base font-normal tracking-tight">{title}</h3>
      </div>

      <div className="p-6 pt-0">
        <div className="tex-2xl font-bold">{description}</div>
        <p className="text-xs text-muted-foreground">{mutedDescription}</p>
        <div className="mt-4 h-40">
          {data?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis
                  dataKey="name"
                  style={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Bar
                  dataKey="value"
                  label={{ position: 'insideTop', fill: 'hsl(var(--primary))' }}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>
      </div>
    </div>
  );
}
