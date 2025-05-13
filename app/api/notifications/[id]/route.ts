import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { auth } from '@/middleware/auth';
import { Notification as NotificationType } from '@/types';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const authResponse = await auth(req);
  if (authResponse) return authResponse;
  try {
    const notification: NotificationType | null = await Notification.findById(params.id);
    if (!notification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }
    if (notification.userId.toString() !== (req as any).user.userId) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }
    const updatedNotification: NotificationType | null = await Notification.findByIdAndUpdate(
      params.id,
      { $set: { read: true } },
      { new: true }
    );
    if (!updatedNotification) {
      return NextResponse.json({ message: 'Failed to update notification' }, { status: 500 });
    }
    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}