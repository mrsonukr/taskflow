import { Badge } from '@/components/ui/badge';
import { TaskPriority } from '@/context/TaskContext';
import { AlertCircle, AlertTriangle, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case 'Low':
        return {
          icon: <ArrowDown className="h-3 w-3 mr-1" />,
          className: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 dark:bg-gray-400/20 dark:text-gray-400',
        };
      case 'Medium':
        return {
          icon: <AlertTriangle className="h-3 w-3 mr-1" />,
          className: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
        };
      case 'High':
        return {
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400',
        };
      default:
        return {
          icon: <ArrowDown className="h-3 w-3 mr-1" />,
          className: 'bg-gray-500/10 text-gray-500',
        };
    }
  };

  const { icon, className } = getPriorityConfig(priority);

  return (
    <Badge 
      variant="outline" 
      className={cn('flex items-center font-normal gap-0.5', className)}
    >
      {icon}
      {priority}
    </Badge>
  );
}