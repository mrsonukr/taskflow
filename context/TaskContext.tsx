"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useUser } from "./UserContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type TaskStatus = "To Do" | "In Process" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";

export type User = {
  id: string;
  fullName: string;
};

export type Task = {
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

export type Notification = {
  id: string;
  type: "task_assigned" | "task_updated";
  taskId: string;
  message: string;
  createdAt: string;
  read: boolean;
  userId: string;
};

type TaskContextType = {
  tasks: Task[];
  notifications: Notification[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  createTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (
    taskId: string,
    updates: Partial<Omit<Task, "id" | "createdAt" | "createdBy">>
  ) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTaskPriority: (taskId: string, priority: TaskPriority) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  getTasksAssignedToMe: () => Task[];
  getTasksCreatedByMe: () => Task[];
  getAllTasks: (page: number) => Promise<void>;
  getUnreadNotificationsCount: () => number;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser, logout } = useUser();
  const router = useRouter();

  // Fetch tasks and notifications on mount or when user changes
  useEffect(() => {
    if (!currentUser) return;

    const fetchTasks = async () => {
      try {
        const [createdRes, assignedRes] = await Promise.all([
          fetch(`https://task-backend-2tiy.onrender.com/api/tasks/created`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
            },
          }),
          fetch(`https://task-backend-2tiy.onrender.com/api/tasks/assigned`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
            },
          }),
        ]);

        if (createdRes.status === 401 || assignedRes.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
          router.push("/");
          return;
        }

        if (createdRes.ok && assignedRes.ok) {
          const createdTasks = await createdRes.json();
          const assignedTasks = await assignedRes.json();
          // Combine and deduplicate tasks
          const allTasks = [...createdTasks, ...assignedTasks].reduce(
            (acc, task) => {
              acc[task._id] = {
                id: task._id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                createdAt: task.createdAt,
                createdBy: {
                  id: task.createdBy._id,
                  fullName: task.createdBy.fullName || "Unknown",
                },
                assignedTo: task.assignedTo.map((user: any) => ({
                  id: user._id,
                  fullName: user.fullName || "Unknown",
                })),
              };
              return acc;
            },
            {} as Record<string, Task>
          );
          setTasks(Object.values(allTasks));
        } else {
          toast.error("Failed to fetch tasks");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Error fetching tasks");
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`https://task-backend-2tiy.onrender.com/api/notifications`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
        });

        if (res.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
          router.push("/");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setNotifications(
            data.map((n: any) => ({
              id: n._id,
              type: n.type,
              taskId: n.taskId._id,
              message: n.message,
              createdAt: n.createdAt,
              read: n.read,
              userId: n.userId,
            }))
          );
        } else {
          toast.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Error fetching notifications");
      }
    };

    if (currentUser.role !== 'admin') {
      fetchTasks();
    }
    fetchNotifications();
  }, [currentUser, logout, router]);

  // Get all tasks (admin only)
  const getAllTasks = async (page: number) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return;
    }

    try {
      const res = await fetch(
        `https://task-backend-2tiy.onrender.com/api/tasks?page=${page}&limit=9`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
        }
      );

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        router.push("/");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setTasks(
          data.tasks.map((task: any) => ({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            createdAt: task.createdAt,
            createdBy: {
              id: task.createdBy._id,
              fullName: task.createdBy.fullName || "Unknown",
            },
            assignedTo: task.assignedTo.map((user: any) => ({
              id: user._id,
              fullName: user.fullName || "Unknown",
            })),
          }))
        );
        setTotalPages(Math.ceil(data.total / 9));
      } else {
        toast.error("Failed to fetch tasks");
      }
    } catch (error) {
      console.error("Error fetching all tasks:", error);
      toast.error("Error fetching tasks");
    }
  };

  // Create a new task
  const createTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (!currentUser) {
      toast.error("Please log in to create a task");
      return;
    }

    // Convert User objects to IDs for API
    const apiTaskData = {
      ...taskData,
      createdBy: taskData.createdBy.id,
      assignedTo: taskData.assignedTo.map((user) => user.id),
    };

    try {
      const res = await fetch(`https://task-backend-2tiy.onrender.com/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
        },
        body: JSON.stringify(apiTaskData),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        router.push("/");
        return;
      }

      if (res.ok) {
        const newTask = await res.json();
        if (currentUser.role === 'admin') {
          // Refresh the task list for admin
          getAllTasks(currentPage);
        } else {
          setTasks((prev) => [
            {
              id: newTask._id,
              title: newTask.title,
              description: newTask.description,
              status: newTask.status,
              priority: newTask.priority,
              dueDate: newTask.dueDate,
              createdAt: newTask.createdAt,
              createdBy: {
                id: newTask.createdBy._id,
                fullName: newTask.createdBy.fullName || "Unknown",
              },
              assignedTo: newTask.assignedTo.map((user: any) => ({
                id: user._id,
                fullName: user.fullName || "Unknown",
              })),
            },
            ...prev,
          ]);
        }
        toast.success("Task created successfully");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Error creating task");
    }
  };

  // Update task
  const updateTask = async (
    taskId: string,
    updates: Partial<Omit<Task, "id" | "createdAt" | "createdBy">>
  ) => {
    if (!currentUser) {
      toast.error("Please log in to update a task");
      return;
    }

    // Convert assignedTo User objects to IDs for API
    const apiUpdates = {
      ...updates,
      assignedTo: updates.assignedTo
        ? updates.assignedTo.map((user) => user.id)
        : undefined,
    };

    try {
      const res = await fetch(`https://task-backend-2tiy.onrender.com/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
        },
        body: JSON.stringify(apiUpdates),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        router.push("/");
        return;
      }

      if (res.ok) {
        const updatedTask = await res.json();
        if (currentUser.role === 'admin') {
          // Refresh the task list for admin
          getAllTasks(currentPage);
        } else {
          setTasks((prev) =>
            prev.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    title: updatedTask.title,
                    description: updatedTask.description,
                    status: updatedTask.status,
                    priority: updatedTask.priority,
                    dueDate: updatedTask.dueDate,
                    assignedTo: updatedTask.assignedTo.map((user: any) => ({
                      id: user._id,
                      fullName: user.fullName || "Unknown",
                    })),
                  }
                : task
            )
          );
        }
        toast.success("Task updated successfully");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Error updating task");
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    if (!currentUser) {
      toast.error("Please log in to update task status");
      return;
    }

    try {
      const res = await fetch(
        `https://task-backend-2tiy.onrender.com/api/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        router.push("/");
        return;
      }

      if (res.ok) {
        const updatedTask = await res.json();
        if (currentUser.role === 'admin') {
          // Refresh the task list for admin
          getAllTasks(currentPage);
        } else {
          setTasks((prev) =>
            prev.map((task) =>
              task.id === taskId ? { ...task, status: updatedTask.status } : task
            )
          );
        }
        toast.success(`Task status updated to: ${status}`);
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Error updating task status");
    }
  };

  // Update task priority
  const updateTaskPriority = async (taskId: string, priority: TaskPriority) => {
    if (!currentUser) {
      toast.error("Please log in to update task priority");
      return;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!currentUser.role === 'admin' && task && task.createdBy.id !== currentUser.id) {
      toast.error("Only the task creator can change the priority");
      return;
    }

    try {
      const res = await fetch(`https://task-backend-2tiy.onrender.com/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
        },
        body: JSON.stringify({ priority }),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        router.push("/");
        return;
      }

      if (res.ok) {
        const updatedTask = await res.json();
        if (currentUser.role === 'admin') {
          // Refresh the task list for admin
          getAllTasks(currentPage);
        } else {
          setTasks((prev) =>
            prev.map((task) =>
              task.id === taskId
                ? { ...task, priority: updatedTask.priority }
                : task
            )
          );
        }
        toast.success(`Task priority updated to: ${priority}`);
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to update task priority");
      }
    } catch (error) {
      console.error("Error updating task priority:", error);
      toast.error("Error updating task priority");
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    if (!currentUser) {
      toast.error("Please log in to delete a task");
      return;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!currentUser.role === 'admin' && task && task.createdBy.id !== currentUser.id) {
      toast.error("Only the task creator can delete this task");
      return;
    }

    try {
      const res = await fetch(`https://task-backend-2tiy.onrender.com/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
        },
      });

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        router.push("/");
        return;
      }

      if (res.ok) {
        if (currentUser.role === 'admin') {
          // Refresh the task list for admin
          getAllTasks(currentPage);
        } else {
          setTasks((prev) => prev.filter((t) => t.id !== taskId));
        }
        setNotifications((prev) => prev.filter((n) => n.taskId !== taskId));
        toast.success("Task deleted");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Error deleting task");
    }
  };

  // Get tasks assigned to the current user
  const getTasksAssignedToMe = () => {
    if (!currentUser) return [];
    return tasks.filter((task) =>
      task.assignedTo.some((user) => user.id === currentUser.id)
    );
  };

  // Get tasks created by the current user
  const getTasksCreatedByMe = () => {
    if (!currentUser) return [];
    return tasks.filter((task) => task.createdBy.id === currentUser.id);
  };

  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    if (!currentUser) return 0;
    return notifications.filter(
      (n) => n.userId === currentUser.id && !n.read
    ).length;
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    if (!currentUser) {
      toast.error("Please log in to mark notifications");
      return;
    }

    try {
      const res = await fetch(
        `https://task-backend-2tiy.onrender.com/api/notifications/${notificationId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
        }
      );

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        router.push("/");
        return;
      }

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        toast.success("Notification marked as read");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Error marking notification as read");
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        notifications,
        totalPages,
        currentPage,
        setCurrentPage,
        createTask,
        updateTask,
        updateTaskStatus,
        updateTaskPriority,
        deleteTask,
        getTasksAssignedToMe,
        getTasksCreatedByMe,
        getAllTasks,
        getUnreadNotificationsCount,
        markNotificationAsRead,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
}