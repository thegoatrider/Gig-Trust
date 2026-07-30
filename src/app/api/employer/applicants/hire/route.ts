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

    const { applicationId, action } = await req.json();

    if (!applicationId || !action) {
      return NextResponse.json({ success: false, error: 'Application ID and Action are required.' }, { status: 400 });
    }

    const app = await db.applications.findById(applicationId);
    if (!app) {
      return NextResponse.json({ success: false, error: 'Job application not found.' }, { status: 404 });
    }

    const job = await db.jobs.findById(app.job_id);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Associated job listing not found.' }, { status: 404 });
    }
    if (job.employer_id !== session.userId) {
      return NextResponse.json({ success: false, error: 'Access denied: Job owner mismatch.' }, { status: 403 });
    }

    if (action === 'reject') {
      await db.applications.update(applicationId, { status: 'rejected' });
      return NextResponse.json({ success: true, status: 'rejected' });
    }

    if (action === 'hire') {
      // 1. Calculate Escrow Lock Amount (If hourly, lock 1 hr deposit or total rate. Let's lock the rate directly)
      const escrowAmount = job.rate;

      // Deduct from employer wallet and lock funds in escrow
      try {
        await razorpayService.lockEscrow(session.userId, app.worker_id, job.id, escrowAmount);
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Escrow lock failed.' }, { status: 400 });
      }

      // 2. Accept application (Worker can now check-in)
      await db.applications.update(applicationId, { status: 'accepted' });
      
      // Update job status
      await db.jobs.update(job.id, { status: 'active' });

      return NextResponse.json({ success: true, status: 'accepted' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Hiring action failed' }, { status: 500 });
  }
}
