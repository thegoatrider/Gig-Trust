import { NextResponse } from 'next/server';
import { authHelper } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  authHelper.clearSessionCookie(response);
  return response;
}
