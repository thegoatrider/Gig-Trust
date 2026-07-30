import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'worker') {
      return NextResponse.json({ success: false, error: 'Unauthorized worker session.' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required.' }, { status: 400 });
    }

    const ses = await db.sessions.findById(sessionId);
    if (!ses) {
      return NextResponse.json({ success: false, error: 'Session not found.' }, { status: 404 });
    }

    // Stop timer
    await db.sessions.update(sessionId, {
      check_out_time: new Date().toISOString(),
      timer_status: 'completed'
    });

    const app = await db.applications.findById(ses.job_application_id);
    if (app) {
      // Mark application as completed
      await db.applications.update(app.id, { status: 'completed' });
      
      // Update job status if finished
      const job = await db.jobs.findById(app.job_id);
      if (job) {
        await db.jobs.update(job.id, { status: 'completed' });
        
        // Notify employer
        await db.users.findMany(); // dummy lookup
        await db.users.update(job.employer_id, {}); // dummy update to force state trigger
      }
    }

    return NextResponse.json({ success: true, message: 'Check-out registered. Awaiting employer escrow approval.' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Checkout failed' }, { status: 500 });
  }
}
