import { Task, Notification } from '@/context/TaskContext';

// Sample tasks for demo
export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Create UI mockups',
    description: 'Design mockups for the new dashboard layout',
    status: 'To Do',
    priority: 'High',
    dueDate: '2025-06-30',
    createdAt: '2025-06-15T10:00:00Z',
    createdBy: 'user-1',
    assignedTo: ['user-2', 'user-3'],
  },
  {
    id: 'task-2',
    title: 'Implement user authentication',
    description: 'Add login and registration functionality',
    status: 'In Process',
    priority: 'High',
    dueDate: '2025-06-25',
    createdAt: '2025-06-14T09:30:00Z',
    createdBy: 'user-1',
    assignedTo: ['user-4'],
  },
  {
    id: 'task-3',
    title: 'Write API documentation',
    description: 'Document all API endpoints and their usage',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '2025-07-05',
    createdAt: '2025-06-16T14:20:00Z',
    createdBy: 'user-2',
    assignedTo: ['user-5', 'user-3'],
  },
  {
    id: 'task-4',
    title: 'Fix navigation bug',
    description: 'Fix the navigation menu not working correctly on mobile devices',
    status: 'Completed',
    priority: 'Medium',
    dueDate: '2025-06-20',
    createdAt: '2025-06-10T11:45:00Z',
    createdBy: 'user-3',
    assignedTo: ['user-2'],
  },
  {
    id: 'task-5',
    title: 'Performance optimization',
    description: 'Improve loading times on the dashboard page',
    status: 'In Process',
    priority: 'Low',
    dueDate: '2025-07-10',
    createdAt: '2025-06-12T16:10:00Z',
    createdBy: 'user-4',
    assignedTo: ['user-1', 'user-5'],
  }
];

// Sample API responses
export const apiSamples = {
  login: {
    endpoint: '/api/auth/login',
    method: 'POST',
    requestBody: {
      identifier: 'username or email',
      password: 'user_password'
    },
    successResponse: {
      status: 200,
      body: {
        user: {
          id: 'user-id',
          fullName: 'User Full Name',
          username: 'username',
          email: 'user@example.com',
          role: 'user'
        },
        token: 'jwt_token_here'
      }
    },
    errorResponse: {
      status: 401,
      body: {
        message: 'Invalid credentials'
      }
    }
  },
  register: {
    endpoint: '/api/auth/register',
    method: 'POST',
    requestBody: {
      fullName: 'User Full Name',
      username: 'desired_username',
      email: 'user@example.com',
      password: 'user_password'
    },
    successResponse: {
      status: 201,
      body: {
        user: {
          id: 'user-id',
          fullName: 'User Full Name',
          username: 'username',
          email: 'user@example.com',
          role: 'user'
        },
        token: 'jwt_token_here'
      }
    },
    errorResponse: {
      status: 400,
      body: {
        message: 'Username or email already exists'
      }
    }
  }
};