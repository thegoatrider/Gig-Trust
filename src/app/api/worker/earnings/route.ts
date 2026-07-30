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
    const transactions = await db.walletTransactions.findManyByUser(session.userId);

    // Sort transactions new first
    transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      walletBalance: user?.wallet_balance || 0,
      transactions
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to fetch earnings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'worker') {
      return NextResponse.json({ success: false, error: 'Unauthorized worker session.' }, { status: 401 });
    }

    const { amount, upiId } = await req.json();
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Please enter a valid amount.' }, { status: 400 });
    }
    if (!upiId) {
      return NextResponse.json({ success: false, error: 'UPI ID is required for withdrawal.' }, { status: 400 });
    }

    const user = await db.users.findById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    if (user.wallet_balance < amount) {
      return NextResponse.json({ success: false, error: 'Insufficient balance available in wallet.' }, { status: 400 });
    }

    // Process debit deduction
    const newBalance = user.wallet_balance - amount;
    await db.users.update(session.userId, { wallet_balance: newBalance });

    // Log transaction
    const tx = await db.walletTransactions.create({
      user_id: session.userId,
      type: 'debit',
      amount,
      ref_id: `withdraw_${upiId.replace(/[^a-zA-Z0-9]/g, '')}_${Math.random().toString(36).substr(2, 5)}`
    });

    return NextResponse.json({ success: true, newBalance, transaction: tx });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Withdrawal request failed' }, { status: 500 });
  }
}
