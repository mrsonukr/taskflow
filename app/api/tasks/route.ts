// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { auth } from '@/middleware/auth';
import { Task as TaskType, Notification as NotificationType } from '@/types';

interface CreateTaskRequestBody {
  title: string;
  description: string;
  status: 'To Do' | 'In Process' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: Date;
  assignedTo: string[];
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const authResponse = await auth(req);
  if (authResponse) return authResponse;
  try {
    const user = await User.findById((req as any).user.userId);
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }
    const tasks: TaskType[] = await Task.find()
      .populate('createdBy', 'fullName username email')
      .populate('assignedTo', 'fullName username email')
      .sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const authResponse = await auth(req);
  if (authResponse) return authResponse;
  try {
    const { title, description, status, priority, dueDate, assignedTo }: CreateTaskRequestBody = await req.json();
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      createdBy: (req as any).user.userId,
      assignedTo,
    });
    await task.save();
    const notifications: Partial<NotificationType>[] = assignedTo.map(userId => ({
      type: 'task_assigned',
      taskId: task._id,
      message: `You have been assigned a new task: ${title}`,
      userId,
    }));
    await Notification.insertMany(notifications);
    const populatedTask: TaskType | null = await Task.findById(task._id)
      .populate('createdBy', 'fullName username email')
      .populate('assignedTo', 'fullName username email');
    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}