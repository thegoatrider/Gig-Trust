import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'worker') {
      return NextResponse.json({ success: false, error: 'Unauthorized worker session.' }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required.' }, { status: 400 });
    }

    // Verify job exists and is open
    const job = await db.jobs.findById(jobId);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job listing not found.' }, { status: 404 });
    }
    if (job.status !== 'open') {
      return NextResponse.json({ success: false, error: 'Job is no longer accepting applications.' }, { status: 400 });
    }

    // Generate random 4-digit check-in OTP and a QR token
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const qr_token = `qr_job_${jobId}_worker_${session.userId}_${Math.random().toString(36).substr(2, 5)}`;

    const application = await db.applications.create({
      job_id: jobId,
      worker_id: session.userId,
      otp,
      qr_token
    });

    return NextResponse.json({ success: true, application });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to submit application' }, { status: 500 });
  }
}
