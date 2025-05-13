export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Process' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: Date;
  createdAt: Date;
  createdBy: User | string;
  assignedTo: (User | string)[];
}

export interface Notification {
  _id: string;
  type: 'task_assigned' | 'task_updated';
  taskId: Task | string;
  message: string;
  userId: User | string;
  read: boolean;
  createdAt: Date;
}

export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: DecodedToken;
}