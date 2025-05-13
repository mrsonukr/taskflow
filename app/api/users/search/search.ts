// app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { User as UserType } from '@/types';

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    if (!query) {
      return NextResponse.json({ users: [] });
    }
    const users: UserType[] = await User.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).select('-password');
    return NextResponse.json({ users });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}