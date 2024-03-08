'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { cn, shuffleArray } from '@/lib/utils';

import { Skeleton } from './ui/skeleton';

interface AnalyticsPieChartProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  mutedDescription?: string;
  data?: { value: number }[];
}

export default function AnalyticsPieChart({
  title,
  description,
  mutedDescription,
  data,
  className,
  ...props
}: AnalyticsPieChartProps) {
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
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  label={{ fill: 'hsl(var(--primary))' }}
                  labelLine={false}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>
      </div>
    </div>
  );
}
