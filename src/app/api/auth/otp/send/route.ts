import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json({ success: false, error: 'Valid 10-digit phone number is required.' }, { status: 400 });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration boundary (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to database
    await db.verificationOtps.saveOtp(phone, otp, expiresAt);

    return NextResponse.json({
      success: true,
      message: 'OTP dispatched successfully.',
      debugOtp: otp // Returned directly for testing & demonstration
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Server error' }, { status: 500 });
  }
}
