import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'worker') {
      return NextResponse.json({ success: false, error: 'Unauthorized worker session.' }, { status: 401 });
    }

    const user = await db.users.findById(session.userId);
    const profile = await db.workerProfiles.findById(session.userId);
    const applications = await db.applications.findManyByWorker(session.userId);
    const notifications = await db.users.findMany(); // dummy helper

    // Enrich applications with job details
    const enrichedApps = [];
    for (const app of applications) {
      const job = await db.jobs.findById(app.job_id);
      if (job) {
        const employer = await db.users.findById(job.employer_id);
        const employerProfile = await db.employerProfiles.findById(job.employer_id);
        enrichedApps.push({
          ...app,
          jobTitle: job.title,
          jobCategory: job.category,
          jobRate: job.rate,
          priceType: job.price_type,
          mode: job.mode,
          employerName: employerProfile?.business_name || 'Individual Employer',
          trialMinutes: job.trial_minutes
        });
      }
    }

    // Find any active session
    let activeSession = null;
    for (const app of applications) {
      if (app.status === 'accepted') {
        const ses = await db.sessions.findByApplicationId(app.id);
        if (ses && ses.timer_status === 'running') {
          const job = await db.jobs.findById(app.job_id);
          activeSession = {
            ...ses,
            applicationId: app.id,
            jobId: app.job_id,
            jobTitle: job?.title || 'Gig Task'
          };
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        phone: user?.phone,
        email: user?.email,
        kyc_status: user?.kyc_status,
        trust_score: user?.trust_score,
        wallet_balance: user?.wallet_balance
      },
      profile,
      applications: enrichedApps,
      activeSession
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
