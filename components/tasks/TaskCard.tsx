"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { MoreVertical, Trash2, Edit, Eye } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { TaskStatus, TaskPriority, useTask } from "@/context/TaskContext";
import { EditTaskDialog } from "./EditTaskDialog";
import { TaskDetailsDialog } from "./TaskDetailsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Define User type for createdBy and assignedTo
type User = {
  id: string;
  fullName: string;
};

// Define TaskCardTask type to expect User objects
type TaskCardTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  createdBy: User;
  assignedTo: User[];
};

interface TaskCardProps {
  task: TaskCardTask;
  isCreator: boolean;
  isAdmin?: boolean;
}

export function TaskCard({ task, isCreator, isAdmin = false }: TaskCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { updateTaskStatus, updateTaskPriority, deleteTask } = useTask();

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (isAdmin) return;
    setIsUpdatingStatus(true);
    try {
      await updateTaskStatus(task.id, newStatus);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!isCreator || isAdmin) return;
    setIsUpdatingPriority(true);
    try {
      await updateTaskPriority(task.id, newPriority);
    } catch (error) {
      toast.error("Failed to update priority");
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleDelete = async () => {
    if (!isCreator || isAdmin) return;
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowDetailsDialog(true)}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View details</span>
              </Button>
              {isCreator && !isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
        </CardHeader>
        <CardContent className="pb-3 flex-grow">
          <p className="text-sm text dplyr-muted-foreground line-clamp-3 mb-3">
            {task.description}
          </p>
          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Due:</span>
              <span className="font-medium">
                {format(new Date(task.dueDate), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(task.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">Created by:</p>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">
                {task.createdBy.fullName ? task.createdBy.fullName.charAt(0) : "?"}
              </div>
              <span className="text-sm">
                {task.createdBy.fullName || "Unknown"}
              </span>
            </div>
          </div>
          {task.assignedTo.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">Assigned to:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {task.assignedTo.map((user) => (
                  <Badge
                    key={user.id}
                    variant="outline"
                    className="flex items-center gap-1 px-2 py-0.5"
                  >
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">
                      {user.fullName ? user.fullName.charAt(0) : "?"}
                    </div>
                    <span className="text-xs">
                      {user.fullName || "Unknown"}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        {!isAdmin && (
          <>
            <Separator />
            <CardFooter className="pt-3 px-3 pb-3">
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Select
                    value={task.status}
                    onValueChange={(value) =>
                      handleStatusChange(value as TaskStatus)
                    }
                    disabled={isAdmin || isUpdatingStatus}
                  >
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="To Do">To Do</SelectItem>
                      <SelectItem value="In Process">In Process</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <Select
                    value={task.priority}
                    onValueChange={(value) =>
                      handlePriorityChange(value as TaskPriority)
                    }
                    disabled={!isCreator || isAdmin || isUpdatingPriority}
                  >
                    <SelectTrigger className="w-full h-8">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {showEditDialog && (
        <EditTaskDialog
          task={task}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
      {showDetailsDialog && (
        <TaskDetailsDialog
          task={task}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </>
  );
}