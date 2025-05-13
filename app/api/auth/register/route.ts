// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { User as UserType } from '@/types';

interface RegisterRequestBody {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const { fullName, username, email, password }: RegisterRequestBody = await req.json();
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (userExists) {
      return NextResponse.json(
        { message: 'User with this email or username already exists' },
        { status: 400 }
      );
    }
    const user = new User({ fullName, username, email, password });
    await user.save();
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    const userResponse: Partial<UserType> = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return NextResponse.json({ user: userResponse, token }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}