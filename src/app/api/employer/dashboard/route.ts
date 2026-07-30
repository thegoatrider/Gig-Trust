import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ success: false, error: 'Unauthorized employer session.' }, { status: 401 });
    }

    const user = await db.users.findById(session.userId);
    const profile = await db.employerProfiles.findById(session.userId);

    // Fetch jobs posted by employer
    const allJobs = await db.jobs.findMany();
    const myJobs = allJobs.filter(j => j.employer_id === session.userId);

    // Fetch applications for these jobs
    const allApps = await db.applications.findMany();
    const myJobIds = myJobs.map(j => j.id);
    const myApps = allApps.filter(a => myJobIds.includes(a.job_id));

    // Enrich applications with job and worker info
    const enrichedApps = [];
    for (const app of myApps) {
      const job = myJobs.find(j => j.id === app.job_id);
      const worker = await db.users.findById(app.worker_id);
      const workerProfile = await db.workerProfiles.findById(app.worker_id);
      
      enrichedApps.push({
        ...app,
        jobTitle: job?.title || 'Unknown Job',
        jobCategory: job?.category || 'General',
        jobRate: job?.rate || 0,
        priceType: job?.price_type || 'hourly',
        workerEmail: worker?.email || 'N/A',
        workerPhone: worker?.phone || 'N/A',
        workerKycStatus: worker?.kyc_status || 'pending',
        workerTrustScore: worker?.trust_score || 70,
        workerSkills: workerProfile?.skills || []
      });
    }

    // Fetch active sessions for these applications
    const allSessions = await db.sessions.findMany();
    const activeSessions = [];

    for (const s of allSessions) {
      const app = myApps.find(a => a.id === s.job_application_id);
      if (app) {
        const job = myJobs.find(j => j.id === app.job_id);
        const worker = await db.users.findById(app.worker_id);
        const workerProfile = await db.workerProfiles.findById(app.worker_id);

        activeSessions.push({
          ...s,
          jobTitle: job?.title || 'Unknown Job',
          jobRate: job?.rate || 0,
          priceType: job?.price_type || 'hourly',
          trialMinutes: job?.trial_minutes || 30,
          workerName: worker?.email.split('@')[0] || 'Worker',
          workerId: worker?.id,
          workerPhone: worker?.phone,
          workerKycStatus: worker?.kyc_status || 'pending',
          workerTrustScore: worker?.trust_score || 70,
          applicationId: app.id,
          jobId: app.job_id
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        phone: user?.phone,
        email: user?.email,
        wallet_balance: user?.wallet_balance || 0,
        kyc_status: user?.kyc_status
      },
      profile,
      jobs: myJobs,
      applicants: enrichedApps.filter(a => a.status === 'applied' || a.status === 'shortlisted'),
      activeSessions
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to fetch employer dashboard' }, { status: 500 });
  }
}
