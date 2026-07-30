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
    let user = await db.users.findByPhone(phone);
    if (!user) {
      // Check if it is a developer quick-fill profile
      if (phone === '8888888888' || phone === '7777777777' || phone === '9999999999') {
        const role = phone === '8888888888' ? 'worker' : phone === '7777777777' ? 'employer' : 'admin';
        user = await db.users.create({
          role,
          phone,
          email: `${role}@gigtrust.dev`,
          kyc_status: 'gold',
          trust_score: role === 'admin' ? 100 : role === 'worker' ? 95 : 90,
          wallet_balance: role === 'worker' ? 500.00 : role === 'employer' ? 10000.00 : 0.00
        });

        if (role === 'worker') {
          await db.workerProfiles.upsert(user.id, {
            dob: '1995-01-01',
            gender: 'Male',
            base_location_lat: 12.9716,
            base_location_lng: 77.5946,
            id_doc_type: 'Aadhaar',
            id_doc_url: 'https://placeholder.com/aadhaar.jpg',
            id_verified: true,
            face_match_score: 98,
            skills: ['Security', 'Courier', 'Delivery', 'Plumbing'],
            work_mode: 'both',
            police_verified: true
          });
        } else if (role === 'employer') {
          await db.employerProfiles.upsert(user.id, {
            business_name: 'DevCorp Technologies',
            gstin: '29AAAAA0000A1Z5',
            business_docs_url: 'https://placeholder.com/gstin.pdf',
            verified_location_lat: 12.9716,
            verified_location_lng: 77.5946
          });
        }
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Phone number not registered. Please register first.' 
        }, { status: 404 });
      }
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
