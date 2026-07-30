import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ success: false, error: 'Unauthorized employer session.' }, { status: 401 });
    }

    const data = await req.json();

    // Update user kyc status
    await db.users.update(session.userId, { kyc_status: 'silver', trust_score: 85 });

    // Update employer profile details
    await db.employerProfiles.upsert(session.userId, {
      business_name: data.business_name,
      gstin: data.gstin,
      business_docs_url: data.business_docs_url,
      verified_location_lat: data.verified_location_lat || 12.9716,
      verified_location_lng: data.verified_location_lng || 77.5946
    });

    return NextResponse.json({ success: true, kyc_status: 'silver' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to complete onboarding' }, { status: 500 });
  }
}
