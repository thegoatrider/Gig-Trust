import { db } from "../db";

export interface EscrowHold {
  id: string;
  employerId: string;
  workerId: string;
  jobId: string;
  amount: number;
  status: 'locked' | 'released' | 'refunded';
  createdAt: string;
}

// Global escrow store in memory for sessions
let escrowStore: EscrowHold[] = [];

if (typeof window === 'undefined') {
  if (!(global as any)._escrow_store) {
    (global as any)._escrow_store = [];
  }
  escrowStore = (global as any)._escrow_store;
}

export const razorpayService = {
  // Simulate Razorpay Wallet Deposit (Top-up)
  depositWallet: async (userId: string, amount: number) => {
    const user = await db.users.findById(userId);
    if (!user) throw new Error("User not found");

    const newBalance = user.wallet_balance + amount;
    await db.users.update(userId, { wallet_balance: newBalance });

    // Log transaction
    await db.walletTransactions.create({
      user_id: userId,
      type: 'credit',
      amount,
      ref_id: `pay_razorpay_${Math.random().toString(36).substr(2, 9)}`
    });

    return { success: true, newBalance };
  },

  // Lock funds in Escrow (Hold) when worker is hired/shortlisted
  lockEscrow: async (employerId: string, workerId: string, jobId: string, amount: number) => {
    const employer = await db.users.findById(employerId);
    if (!employer) throw new Error("Employer not found");
    if (employer.wallet_balance < amount) {
      throw new Error("Insufficient wallet balance. Please top up your wallet.");
    }

    // Deduct from employer wallet
    const newBalance = employer.wallet_balance - amount;
    await db.users.update(employerId, { wallet_balance: newBalance });

    // Log hold transaction
    const refId = `hold_${Math.random().toString(36).substr(2, 9)}`;
    await db.walletTransactions.create({
      user_id: employerId,
      type: 'hold',
      amount,
      ref_id: refId
    });

    // Create escrow entry
    const hold: EscrowHold = {
      id: refId,
      employerId,
      workerId,
      jobId,
      amount,
      status: 'locked',
      createdAt: new Date().toISOString()
    };
    escrowStore.push(hold);

    return hold;
  },

  // Release Escrow: 85% to Worker, 15% Platform Fee
  releaseEscrow: async (holdId: string, commissionRate = 0.15) => {
    const hold = escrowStore.find(h => h.id === holdId);
    if (!hold) throw new Error("Escrow hold not found");
    if (hold.status !== 'locked') throw new Error(`Escrow is already ${hold.status}`);

    const worker = await db.users.findById(hold.workerId);
    if (!worker) throw new Error("Worker not found");

    const platformCommission = hold.amount * commissionRate;
    const workerPayout = hold.amount - platformCommission;

    // Credit worker wallet
    const newWorkerBalance = worker.wallet_balance + workerPayout;
    await db.users.update(hold.workerId, { wallet_balance: newWorkerBalance });

    // Log release transaction for worker
    await db.walletTransactions.create({
      user_id: hold.workerId,
      type: 'release',
      amount: workerPayout,
      ref_id: holdId
    });

    // Update escrow status
    hold.status = 'released';

    return {
      success: true,
      amountReleased: hold.amount,
      workerPayout,
      platformCommission,
      workerNewBalance: newWorkerBalance
    };
  },

  // Refund Escrow: 100% back to Employer (e.g. cancellation within trial period or dispute resolved in employer's favor)
  refundEscrow: async (holdId: string) => {
    const hold = escrowStore.find(h => h.id === holdId);
    if (!hold) throw new Error("Escrow hold not found");
    if (hold.status !== 'locked') throw new Error(`Escrow is already ${hold.status}`);

    const employer = await db.users.findById(hold.employerId);
    if (!employer) throw new Error("Employer not found");

    // Credit back to employer wallet
    const newEmployerBalance = employer.wallet_balance + hold.amount;
    await db.users.update(hold.employerId, { wallet_balance: newEmployerBalance });

    // Log refund transaction
    await db.walletTransactions.create({
      user_id: hold.employerId,
      type: 'credit',
      amount: hold.amount,
      ref_id: `refund_${holdId}`
    });

    hold.status = 'refunded';

    return {
      success: true,
      refundedAmount: hold.amount,
      employerNewBalance: newEmployerBalance
    };
  },

  // Get active escrow holds
  getEscrowHolds: async () => escrowStore,
  
  // Get escrow hold by job application
  findEscrowByJobAndWorker: async (jobId: string, workerId: string) => {
    return escrowStore.find(h => h.jobId === jobId && h.workerId === workerId && h.status === 'locked');
  }
};
