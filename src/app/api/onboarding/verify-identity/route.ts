import { NextRequest, NextResponse } from 'next/server';
import { ocrService } from '@/lib/services/ocr';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized session.' }, { status: 401 });
    }

    const { type, docType } = await req.json();

    let result;
    if (type === 'digilocker') {
      result = await ocrService.verifyWithDigiLocker(session.email);
    } else {
      result = await ocrService.scanDocument(docType || 'Aadhaar', '/temp/doc.jpg');
    }

    return NextResponse.json({ success: true, result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Verification failed' }, { status: 500 });
  }
}
