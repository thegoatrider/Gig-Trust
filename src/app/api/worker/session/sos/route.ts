import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notificationService } from '@/lib/services/notifications';
import { authHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'worker') {
      return NextResponse.json({ success: false, error: 'Unauthorized worker session.' }, { status: 401 });
    }

    const { lat, lng } = await req.json();

    // Fetch worker's guardians (must be exactly 3)
    const guardians = await db.guardians.findManyByWorker(session.userId);
    const worker = await db.users.findById(session.userId);
    
    const googleMapLink = `https://www.google.com/maps?q=${lat},${lng}`;
    const smsMessage = `ALERT! Gig Worker Rohan (phone: ${worker?.phone}) has triggered the emergency SOS button! Current live GPS coordinates: ${googleMapLink}`;

    // 1. Dispatch SMS warnings to all 3 guardians
    for (const g of guardians) {
      await notificationService.sendSMS(g.phone, smsMessage);
    }

    // 2. Broadcast priority push notification alerts to admin/support
    const admins = (await db.users.findMany()).filter(u => u.role === 'admin');
    for (const admin of admins) {
      await notificationService.sendPushNotification(
        admin.id,
        "🚨 ACTIVE EMERGENCY SOS ALERTER",
        `Worker ${worker?.email} triggered SOS. Location: [${lat}, ${lng}]`,
        'sos'
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Emergency SOS triggered successfully! Sent alerts to ${guardians.length} guardians.` 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'SOS dispatch failed' }, { status: 500 });
  }
}
