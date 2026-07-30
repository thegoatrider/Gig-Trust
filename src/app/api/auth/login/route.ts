import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { phone, method } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 });
    }

    // Find user in DB
    const user = await db.users.findByPhone(phone);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone number not registered. Please register first.' 
      }, { status: 404 });
    }

    // Build response and set auth session cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, role: user.role, phone: user.phone }
    });

    authHelper.setSessionCookie(response, {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return response;
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Server error' }, { status: 500 });
  }
}
