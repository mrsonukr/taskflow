import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { auth } from '@/middleware/auth';
import { Task as TaskType } from '@/types';

export async function GET(req: NextRequest) {
  await dbConnect();
  const authResponse = await auth(req);
  if (authResponse) return authResponse;
  try {
    const tasks: TaskType[] = await Task.find({ assignedTo: (req as any).user.userId })
      .populate('createdBy', 'fullName username email')
      .populate('assignedTo', 'fullName username email')
      .sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}