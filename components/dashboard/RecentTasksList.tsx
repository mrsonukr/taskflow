"use client"

import { useTask } from '@/context/TaskContext'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { TaskPriorityBadge } from '@/components/tasks/TaskPriorityBadge'
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'

export function RecentTasksList() {
  const { getTasksAssignedToMe } = useTask()
  
  const myTasks = getTasksAssignedToMe()
  
  // Sort tasks by created date (most recent first)
  const sortedTasks = [...myTasks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5) // Only show 5 most recent
  
  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No tasks assigned to you yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedTasks.map(task => (
        <div 
          key={task.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
        >
          <div className="flex flex-col space-y-1 mb-2 sm:mb-0">
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {task.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              <Badge variant="outline">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Added {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  )
}