import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/lib/services/razorpay';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized session.' }, { status: 401 });
    }

    // Try reading amount, default to 500 for worker security deposits
    let amount = 500;
    try {
      const body = await req.json();
      if (body.amount) amount = parseFloat(body.amount);
    } catch (_) {}

    const result = await razorpayService.depositWallet(session.userId, amount);
    return NextResponse.json({ success: true, result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Deposit simulation failed' }, { status: 500 });
  }
}
