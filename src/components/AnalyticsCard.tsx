import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AnalyticsCardProps extends React.ComponentProps<typeof Card> {
  cardTitle: string;
  cardContents: {
    title: string;
    description: string;
  }[];
}

export default function AnalyticsCard({
  className,
  cardTitle,
  cardContents,
  ...props
}: AnalyticsCardProps) {
  return (
    <Card className={cn('w-80', className)} {...props}>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>

      <CardContent>
        {cardContents.map((content, index) => (
          <div
            key={index}
            className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
          >
            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
            <div className="space-y-1">
              <p className="leading-none">{content.title}</p>
              <p className="">{content.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
