import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied: Admin only.' }, { status: 401 });
    }

    const { userId, reason } = await req.json();
    if (!userId || !reason) {
      return NextResponse.json({ success: false, error: 'User ID and Strike reason are required.' }, { status: 400 });
    }

    // Add strike
    await db.strikes.create({ user_id: userId, reason, count: 1 });
    
    // Check total strikes
    const strikes = await db.strikes.findManyByUser(userId);
    const totalStrikes = strikes.reduce((acc, s) => acc + s.count, 0);

    // Enforce review policy if total strikes >= 3
    if (totalStrikes >= 3) {
      await db.users.update(userId, { trust_score: 10, kyc_status: 'pending' }); // Suspend status
    } else {
      // Deduct trust score by 15 per strike
      const user = await db.users.findById(userId);
      if (user) {
        const newScore = Math.max(0, user.trust_score - 15);
        await db.users.update(userId, { trust_score: newScore });
      }
    }

    return NextResponse.json({ success: true, totalStrikes });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Strike action failed' }, { status: 500 });
  }
}
