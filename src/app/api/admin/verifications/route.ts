import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied: Admin only.' }, { status: 401 });
    }

    const users = await db.users.findMany();
    const enrichedUsers = [];

    for (const u of users) {
      const workerProfile = await db.workerProfiles.findById(u.id);
      const employerProfile = await db.employerProfiles.findById(u.id);

      enrichedUsers.push({
        ...u,
        profile: u.role === 'worker' ? workerProfile : employerProfile
      });
    }

    return NextResponse.json({ success: true, users: enrichedUsers });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied: Admin only.' }, { status: 401 });
    }

    const { userId, newStatus } = await req.json(); // newStatus = 'gold' or 'rejected' or 'silver'
    if (!userId || !newStatus) {
      return NextResponse.json({ success: false, error: 'User ID and Target status are required.' }, { status: 400 });
    }

    const user = await db.users.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Process upgrade override
    const newTrustScore = newStatus === 'gold' ? 95 : newStatus === 'silver' ? 85 : 50;
    await db.users.update(userId, { kyc_status: newStatus, trust_score: newTrustScore });

    // Update profiles
    if (user.role === 'worker') {
      await db.workerProfiles.upsert(userId, {
        police_verified: newStatus === 'gold',
        id_verified: newStatus === 'gold' || newStatus === 'silver'
      });
    }

    return NextResponse.json({ success: true, user: await db.users.findById(userId) });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Action failed' }, { status: 500 });
  }
}
