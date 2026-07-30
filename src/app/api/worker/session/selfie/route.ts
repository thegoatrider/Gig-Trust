import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faceMatchService } from '@/lib/services/facematch';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'worker') {
      return NextResponse.json({ success: false, error: 'Unauthorized worker session.' }, { status: 401 });
    }

    const { sessionId, selfieUrl } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required.' }, { status: 400 });
    }

    const workerProfile = await db.workerProfiles.findById(session.userId);
    if (!workerProfile) {
      return NextResponse.json({ success: false, error: 'Worker profile not found.' }, { status: 404 });
    }

    // Call face match comparison
    const result = await faceMatchService.compareFaces(selfieUrl || '/temp/selfie.jpg', workerProfile.id_doc_url);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: `Facial Verification Failed: Match score (${result.matchScore}%) below threshold.`
      }, { status: 400 });
    }

    // Update session selfie log
    await db.sessions.update(sessionId, { selfie_url: selfieUrl || '/temp/selfie.jpg' });

    return NextResponse.json({ success: true, matchScore: result.matchScore });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Selfie verification failed' }, { status: 500 });
  }
}
