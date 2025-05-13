import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { auth } from '@/middleware/auth';
import { Notification as NotificationType } from '@/types';

export async function GET(req: NextRequest) {
  await dbConnect();
  const authResponse = await auth(req);
  if (authResponse) return authResponse;
  try {
    const notifications: NotificationType[] = await Notification.find({ userId: (req as any).user.userId })
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}