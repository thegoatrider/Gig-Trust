import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'worker') {
      return NextResponse.json({ success: false, error: 'Unauthorized worker session.' }, { status: 401 });
    }

    const data = await req.json();

    // Check if security deposit was made
    const kyc_status = data.depositCompleted ? 'silver' : 'bronze';
    const trust_score = data.depositCompleted ? 85 : 70;

    // Update user kyc status and trust score
    await db.users.update(session.userId, { kyc_status, trust_score });

    // Update worker profile details
    await db.workerProfiles.upsert(session.userId, {
      dob: data.dob,
      gender: data.gender,
      base_location_lat: data.base_location_lat,
      base_location_lng: data.base_location_lng,
      id_doc_type: data.id_doc_type,
      id_doc_url: data.id_doc_url,
      id_verified: data.id_verified,
      face_match_score: data.face_match_score || 0,
      education: data.education || [],
      work_experience: data.work_experience || [],
      medical_conditions: data.medical_conditions,
      skills: data.skills || [],
      work_mode: data.work_mode || 'both',
      police_verified: false
    });

    // Delete existing guardians and insert new ones
    await db.guardians.deleteByWorker(session.userId);
    if (data.guardians && Array.isArray(data.guardians)) {
      for (const g of data.guardians) {
        if (g.name && g.phone) {
          await db.guardians.create({
            worker_id: session.userId,
            name: g.name,
            phone: g.phone,
            address: g.address || '',
            relation_type: g.relation_type || 'other'
          });
        }
      }
    }

    return NextResponse.json({ success: true, kyc_status, trust_score });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to complete onboarding' }, { status: 500 });
  }
}
