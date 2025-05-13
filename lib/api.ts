import { Task, TaskStatus, TaskPriority } from '@/context/TaskContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('taskflow_token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
}

export const api = {
  // Tasks
  createTask: async (task: Omit<Task, 'id' | 'createdAt'>) => {
    return fetchWithAuth('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  getTasks: async (filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    createdBy?: string;
    assignedTo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return fetchWithAuth(`/tasks?${params.toString()}`);
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    return fetchWithAuth(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  updateTaskStatus: async (taskId: string, status: TaskStatus) => {
    return fetchWithAuth(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deleteTask: async (taskId: string) => {
    return fetchWithAuth(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  getNotifications: async () => {
    return fetchWithAuth('/notifications');
  },

  markNotificationRead: async (notificationId: string) => {
    return fetchWithAuth(`/notifications/${notificationId}`, {
      method: 'PATCH',
    });
  },

  markAllNotificationsRead: async () => {
    return fetchWithAuth('/notifications/mark-all-read', {
      method: 'POST',
    });
  },
};