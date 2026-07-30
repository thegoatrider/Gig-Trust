import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { razorpayService } from '@/lib/services/razorpay';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ success: false, error: 'Unauthorized employer session.' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required.' }, { status: 400 });
    }

    const ses = await db.sessions.findById(sessionId);
    if (!ses) {
      return NextResponse.json({ success: false, error: 'Active session not found.' }, { status: 404 });
    }

    const app = await db.applications.findById(ses.job_application_id);
    if (!app) {
      return NextResponse.json({ success: false, error: 'Job application not found.' }, { status: 404 });
    }

    // Find locked escrow hold
    const hold = await razorpayService.findEscrowByJobAndWorker(app.job_id, app.worker_id);
    if (!hold) {
      return NextResponse.json({ success: false, error: 'Locked escrow record not found.' }, { status: 404 });
    }

    // Release payment to worker (85% payout, 15% fee)
    const releaseResult = await razorpayService.releaseEscrow(hold.id);

    // Update DB models
    await db.sessions.update(sessionId, { timer_status: 'completed', check_out_time: new Date().toISOString() });
    await db.applications.update(app.id, { status: 'completed' });
    await db.jobs.update(app.job_id, { status: 'completed' });

    return NextResponse.json({ 
      success: true, 
      message: 'Escrow payment released successfully!', 
      details: releaseResult 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Payment release failed' }, { status: 500 });
  }
}
