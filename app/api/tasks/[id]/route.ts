import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import { auth } from '@/middleware/auth';
import { Task as TaskType, Notification as NotificationType } from '@/types';

interface UpdateTaskRequestBody {
  title?: string;
  description?: string;
  status?: 'To Do' | 'In Process' | 'Completed';
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: Date;
  assignedTo?: string[];
}

interface UpdateStatusRequestBody {
  status: 'To Do' | 'In Process' | 'Completed';
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const authResponse = await auth(req);
  if (authResponse) return authResponse;
  try {
    const task: TaskType | null = await Task.findById(params.id);
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    if (task.createdBy.toString() !== (req as any).user.userId) {
      return NextResponse.json({ message: 'Not authorized to update this task' }, { status: 403 });
    }
    const { title, description, status, priority, dueDate, assignedTo }: UpdateTaskRequestBody = await req.json();
    const updates: Partial<TaskType> = { title, description, status, priority, dueDate };
    if (assignedTo) {
      updates.assignedTo = assignedTo;
      const newAssignees = assignedTo.filter(userId => !(task.assignedTo as string[]).includes(userId));
      if (newAssignees.length > 0) {
        const notifications: Partial<NotificationType>[] = newAssignees.map(userId => ({
          type: 'task_assigned',
          taskId: task._id,
          message: `You have been assigned to the task: ${title}`,
          userId,
        }));
        await Notification.insertMany(notifications);
      }
    }
    const updatedTask: TaskType | null = await Task.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true }
    )
      .populate('createdBy', 'fullName username email')
      .populate('assignedTo', 'fullName username email');
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const authResponse = await auth(req);
  if (authResponse) return authResponse;
  try {
    const { status }: UpdateStatusRequestBody = await req.json();
    const task: TaskType | null = await Task.findById(params.id);
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    if (!(task.assignedTo as string[]).includes((req as any).user.userId)) {
      return NextResponse.json({ message: 'Not authorized to update this task' }, { status: 403 });
    }
    const updatedTask: TaskType | null = await Task.findByIdAndUpdate(
      params.id,
      { $set: { status } },
      { new: true }
    )
      .populate('createdBy', 'fullName username email')
      .populate('assignedTo', 'fullName username email');
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const authResponse = await auth(req);
  if (authResponse) return authResponse;
  try {
    const task: TaskType | null = await Task.findById(params.id);
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    if (task.createdBy.toString() !== (req as any).user.userId) {
      return NextResponse.json({ message: 'Not authorized to delete this task' }, { status: 403 });
    }
    await Task.deleteOne({ _id: params.id });
    await Notification.deleteMany({ taskId: task._id });
    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}