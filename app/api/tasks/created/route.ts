import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User'; // Explicitly import User to ensure registration
import { auth } from '@/middleware/auth';
import { Task as TaskType } from '@/types';

export async function GET(req: NextRequest) {
  await dbConnect();
  const authResponse = await auth(req);
  if (authResponse) return authResponse;
  try {
    // Ensure User model is registered by referencing it
    await User.findOne({}); // This forces Mongoose to initialize the User model
    const tasks: TaskType[] = await Task.find({ createdBy: (req as any).user.userId })
      .populate('createdBy', 'fullName username email')
      .populate('assignedTo', 'fullName username email')
      .sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching created tasks:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}