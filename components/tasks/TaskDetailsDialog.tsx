"use client";

import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task } from '@/context/TaskContext';
import { useUser, User } from '@/context/UserContext';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { Separator } from '@/components/ui/separator';

interface TaskDetailsDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
  const { users } = useUser();

  // Find creator (task.createdBy is a User object)
  const creator = users?.find(user => user.id === task.createdBy.id);

  // Find assigned users (task.assignedTo is User[])
  const assignedUsers = users?.filter(user =>
    task.assignedTo.some(assignedUser => assignedUser.id === user.id)
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p className="text-sm">{task.description}</p>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Due Date</h3>
              <p className="text-sm">{format(new Date(task.dueDate), 'PPP')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Created</h3>
              <p className="text-sm">{format(new Date(task.createdAt), 'PPP')}</p>
            </div>
          </div>

          <Separator />

          {/* Creator */}
          {task.createdBy && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Created by</h3>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  {task.createdBy.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{task.createdBy.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    @{creator?.username || 'unknown'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Users */}
          {task.assignedTo.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Assigned to</h3>
              <div className="flex flex-col gap-2">
                {task.assignedTo.map(user => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        @{users?.find(u => u.id === user.id)?.username || 'unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}