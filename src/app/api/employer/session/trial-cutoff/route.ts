import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { razorpayService } from '@/lib/services/razorpay';
import { authHelper } from '@/lib/auth';

// In-Memory cache to track trial cancellations for abuse checking
let trialCancellations: Array<{ employerId: string; timestamp: number }> = [];

if (typeof window === 'undefined') {
  if (!(global as any)._trial_cancellations) {
    (global as any)._trial_cancellations = [];
  }
  trialCancellations = (global as any)._trial_cancellations;
}

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
      return NextResponse.json({ success: false, error: 'Session not found.' }, { status: 404 });
    }

    const app = await db.applications.findById(ses.job_application_id);
    if (!app) {
      return NextResponse.json({ success: false, error: 'Application record not found.' }, { status: 404 });
    }

    const job = await db.jobs.findById(app.job_id);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found.' }, { status: 404 });
    }

    // 1. Check if within trial window
    const elapsedMinutes = Math.floor((Date.now() - new Date(ses.check_in_time).getTime()) / 60000);
    const inTrialWindow = elapsedMinutes <= job.trial_minutes;

    if (!inTrialWindow) {
      return NextResponse.json({ 
        success: false, 
        error: `Trial Cutoff Blocked: Trial window of ${job.trial_minutes} minutes has already expired. You must pay the full escrow rate.`
      }, { status: 400 });
    }

    // 2. Lock abuse checker logs
    const now = Date.now();
    // Clear logs older than 30 mins
    const windowStart = now - (30 * 60 * 1000);
    const activeLogs = trialCancellations.filter(l => l.employerId === session.userId && l.timestamp >= windowStart);

    if (activeLogs.length >= 2) { // Already 2 cancellations, this is the 3rd!
      // Flag employer account and suspend posting
      await db.users.update(session.userId, { trust_score: 30, kyc_status: 'pending' });
      await db.strikes.create({
        user_id: session.userId,
        reason: 'Automated Flag: Trial window cancellation abuse detected (3 cancellations within 30 minutes). Postings suspended.',
        count: 1
      });
      return NextResponse.json({
        success: false,
        error: 'ACCOUNT SUSPENDED: You have terminated 3 workers within trial windows in under 30 minutes. Your hiring portal has been suspended for Admin review.'
      }, { status: 403 });
    }

    // Log this cancellation
    trialCancellations.push({ employerId: session.userId, timestamp: now });

    // 3. Process minimum pay guardrail (20% payout to worker, 80% refund to employer)
    const hold = await razorpayService.findEscrowByJobAndWorker(app.job_id, app.worker_id);
    if (!hold) {
      return NextResponse.json({ success: false, error: 'Escrow holding details not found.' }, { status: 404 });
    }

    const workerPayout = hold.amount * 0.20;
    const employerRefund = hold.amount * 0.80;

    // Refund employer
    await db.users.update(session.userId, {
      wallet_balance: (await db.users.findById(session.userId))!.wallet_balance + employerRefund
    });
    await db.walletTransactions.create({
      user_id: session.userId,
      type: 'credit',
      amount: employerRefund,
      ref_id: `trial_refund_${hold.id}`
    });

    // Pay worker
    const workerUser = await db.users.findById(app.worker_id);
    await db.users.update(app.worker_id, {
      wallet_balance: workerUser!.wallet_balance + workerPayout
    });
    await db.walletTransactions.create({
      user_id: app.worker_id,
      type: 'release',
      amount: workerPayout,
      ref_id: `trial_payout_${hold.id}`
    });

    // Update DB
    hold.status = 'refunded'; // close escrow
    await db.sessions.update(sessionId, { timer_status: 'completed', check_out_time: new Date().toISOString() });
    await db.applications.update(app.id, { status: 'rejected' }); // rejected out of trial
    await db.jobs.update(job.id, { status: 'open' }); // reopen job slots

    return NextResponse.json({
      success: true,
      message: 'Trial cutoff completed. Worker received 20% minimum wage, and remaining 80% was refunded to your wallet.',
      workerPayout,
      employerRefund
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Trial cutoff failed' }, { status: 500 });
  }
}
