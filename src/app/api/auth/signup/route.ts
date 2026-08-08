import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { phone, email, role, otp } = await req.json();

    if (!phone || !email || !role || !otp) {
      return NextResponse.json({ success: false, error: 'All fields including verification code are required.' }, { status: 400 });
    }

    if (role !== 'worker' && role !== 'employer') {
      return NextResponse.json({ success: false, error: 'Invalid user role specified.' }, { status: 400 });
    }

    // 1. Verify OTP
    const isDevNumber = phone === '8888888888' || phone === '7777777777' || phone === '9999999999';
    if (isDevNumber && otp === '123456') {
      // Bypassed for developer quick-fill
    } else {
      const record = await db.verificationOtps.getOtp(phone);
      if (!record) {
        return NextResponse.json({ success: false, error: 'Incorrect or expired verification code.' }, { status: 400 });
      }
      
      const isExpired = new Date(record.expires_at).getTime() < Date.now();
      if (isExpired) {
        await db.verificationOtps.deleteOtp(phone);
        return NextResponse.json({ success: false, error: 'Incorrect or expired verification code.' }, { status: 400 });
      }

      if (record.otp !== otp) {
        return NextResponse.json({ success: false, error: 'Incorrect or expired verification code.' }, { status: 400 });
      }

      // Valid OTP, delete verification record
      await db.verificationOtps.deleteOtp(phone);
    }

    // Check duplicate phone
    const existingPhone = await db.users.findByPhone(phone);
    if (existingPhone) {
      return NextResponse.json({ success: false, error: 'Phone number already registered.' }, { status: 400 });
    }

    // Check duplicate email
    const existingEmail = await db.users.findByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ success: false, error: 'Email already registered.' }, { status: 400 });
    }

    // Create user
    const user = await db.users.create({
      role,
      phone,
      email,
      kyc_status: 'pending',
      trust_score: 70,
      wallet_balance: 0.00
    });

    // Create profile
    if (role === 'worker') {
      await db.workerProfiles.upsert(user.id, {
        dob: '1995-01-01',
        gender: 'Not Specified',
        base_location_lat: 12.9716,
        base_location_lng: 77.5946,
        id_doc_type: 'Aadhaar',
        id_doc_url: '',
        id_verified: false,
        face_match_score: 0,
        skills: [],
        work_mode: 'both',
        police_verified: false
      });
    } else {
      await db.employerProfiles.upsert(user.id, {
        business_name: '',
        gstin: '',
        business_docs_url: '',
        verified_location_lat: 12.9716,
        verified_location_lng: 77.5946
      });
    }

    // Set auth cookie
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
