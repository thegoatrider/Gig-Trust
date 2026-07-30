import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { locationService } from '@/lib/services/location';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'worker') {
      return NextResponse.json({ success: false, error: 'Unauthorized worker session.' }, { status: 401 });
    }

    const { applicationId, workerLat, workerLng, inputOtp } = await req.json();

    if (!applicationId || !workerLat || !workerLng || !inputOtp) {
      return NextResponse.json({ success: false, error: 'Required fields missing for check-in.' }, { status: 400 });
    }

    const app = await db.applications.findById(applicationId);
    if (!app) {
      return NextResponse.json({ success: false, error: 'Job application not found.' }, { status: 404 });
    }
    if (app.worker_id !== session.userId) {
      return NextResponse.json({ success: false, error: 'Access denied: Application owner mismatch.' }, { status: 403 });
    }

    const job = await db.jobs.findById(app.job_id);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found.' }, { status: 404 });
    }

    // 1. Geofence Verification (Only for offline physical jobs)
    let geofenceOk = true;
    if (job.mode === 'offline') {
      if (job.location_lat && job.location_lng) {
        geofenceOk = locationService.isWithinGeofence(workerLat, workerLng, job.location_lat, job.location_lng);
        if (!geofenceOk) {
          return NextResponse.json({
            success: false,
            error: 'Geofence Verification Failed: You must be within 200 meters of the job site coordinates to check-in.'
          }, { status: 400 });
        }
      }
    }

    // 2. OTP Verification
    if (app.otp !== inputOtp) {
      return NextResponse.json({ success: false, error: 'Invalid Check-In OTP code.' }, { status: 400 });
    }

    // Create session
    const s = await db.sessions.create({
      job_application_id: app.id,
      geofence_ok: geofenceOk,
      selfie_url: ''
    });

    // Update application status
    await db.applications.update(app.id, { status: 'accepted' });
    await db.jobs.update(job.id, { status: 'active' });

    return NextResponse.json({ success: true, session: s });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Check-in failed' }, { status: 500 });
  }
}
