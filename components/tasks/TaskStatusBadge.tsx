import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/context/TaskContext';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'To Do':
        return {
          icon: <Circle className="h-3 w-3 mr-1" />,
          className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
        };
      case 'In Process':
        return {
          icon: <Clock className="h-3 w-3 mr-1" />,
          className: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
        };
      case 'Completed':
        return {
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
          className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400',
        };
      default:
        return {
          icon: <Circle className="h-3 w-3 mr-1" />,
          className: 'bg-gray-500/10 text-gray-500',
        };
    }
  };

  const { icon, className } = getStatusConfig(status);

  return (
    <Badge 
      variant="outline" 
      className={cn('flex items-center font-normal gap-0.5', className)}
    >
      {icon}
      {status}
    </Badge>
  );
}