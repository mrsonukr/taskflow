// app/api/notifications/mark-all-read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { auth } from '@/middleware/auth';

export async function POST(req: NextRequest) {
  await dbConnect();
  const authResponse = await auth(req);
  if (authResponse) return authResponse;
  try {
    await Notification.updateMany(
      { userId: (req as any).user.userId, read: false },
      { $set: { read: true } }
    );
    return NextResponse.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}