import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { razorpayService } from '@/lib/services/razorpay';
import { authHelper } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied: Admin only.' }, { status: 401 });
    }

    const disputes = await db.disputes.findMany();
    // Enrich disputes
    const enrichedDisputes = [];
    for (const d of disputes) {
      const ses = await db.sessions.findById(d.session_id);
      const raiser = await db.users.findById(d.raised_by);
      let worker = null;
      if (ses) {
        const app = await db.applications.findById(ses.job_application_id);
        if (app) {
          worker = await db.users.findById(app.worker_id);
        }
      }

      enrichedDisputes.push({
        ...d,
        raisedByName: raiser?.email || 'User',
        workerEmail: worker?.email || 'Worker',
        checkInTime: ses?.check_in_time
      });
    }

    return NextResponse.json({ success: true, disputes: enrichedDisputes });
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

    const { disputeId, resolution } = await req.json(); // resolution = 'payout_worker' or 'refund_employer'

    const d = await db.disputes.findById(disputeId);
    if (!d) {
      return NextResponse.json({ success: false, error: 'Dispute filing not found.' }, { status: 404 });
    }

    const ses = await db.sessions.findById(d.session_id);
    if (!ses) {
      return NextResponse.json({ success: false, error: 'Session record not found.' }, { status: 404 });
    }

    const app = await db.applications.findById(ses.job_application_id);
    if (!app) {
      return NextResponse.json({ success: false, error: 'Job application not found.' }, { status: 404 });
    }

    const hold = await razorpayService.findEscrowByJobAndWorker(app.job_id, app.worker_id);
    if (!hold) {
      return NextResponse.json({ success: false, error: 'Active locked escrow record not found.' }, { status: 404 });
    }

    if (resolution === 'payout_worker') {
      // 100% payout to worker, apply 0% commission or standard 15%. Let's apply 15% standard
      await razorpayService.releaseEscrow(hold.id);
      await db.disputes.update(disputeId, { status: 'resolved', resolution: 'Resolved in favor of worker: Escrow payout released.' });
    } else if (resolution === 'refund_employer') {
      // 100% refund back to employer
      await razorpayService.refundEscrow(hold.id);
      await db.disputes.update(disputeId, { status: 'resolved', resolution: 'Resolved in favor of employer: Escrow funds refunded.' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid resolution parameter.' }, { status: 400 });
    }

    // Mark session and application completed
    await db.sessions.update(ses.id, { timer_status: 'completed' });
    await db.applications.update(app.id, { status: 'completed' });
    await db.jobs.update(app.job_id, { status: 'completed' });

    return NextResponse.json({ success: true, dispute: await db.disputes.findById(disputeId) });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Dispute resolution failed' }, { status: 500 });
  }
}
