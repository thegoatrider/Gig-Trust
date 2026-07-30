export interface SMSResult {
  success: boolean;
  messageId: string;
  message: string;
}

export interface PushResult {
  success: boolean;
  recipientId: string;
  payload: { title: string; body: string };
}

// Global active notifications memory cache for dashboard views
let notificationFeed: Array<{
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'alert' | 'sos';
  createdAt: string;
}> = [];

if (typeof window === 'undefined') {
  if (!(global as any)._notification_feed) {
    (global as any)._notification_feed = [];
  }
  notificationFeed = (global as any)._notification_feed;
}

export const notificationService = {
  // Send mock SMS/OTP via Twilio/MSG91
  sendSMS: async (phoneNumber: string, messageBody: string): Promise<SMSResult> => {
    // Console log to see local execution
    console.log(`[SMS-SERVICE] Sending SMS to ${phoneNumber}: "${messageBody}"`);
    return {
      success: true,
      messageId: `sms_${Math.random().toString(36).substr(2, 9)}`,
      message: "SMS sent successfully."
    };
  },

  // Generate & dispatch check-in or login verification OTP
  sendOTP: async (phoneNumber: string): Promise<string> => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    console.log(`[SMS-SERVICE] Verification code for ${phoneNumber} is: ${otp}`);
    await notificationService.sendSMS(phoneNumber, `Your GigTrust verification code is ${otp}. Valid for 10 minutes.`);
    return otp;
  },

  // Send real-time FCM Push Notification and log to notifications table
  sendPushNotification: async (
    userId: string,
    title: string,
    body: string,
    type: 'info' | 'success' | 'alert' | 'sos' = 'info'
  ): Promise<PushResult> => {
    console.log(`[PUSH-SERVICE] Sending notification to User(${userId}): [${title}] ${body}`);
    
    // Add to feed
    notificationFeed.unshift({
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title,
      body,
      type,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      recipientId: userId,
      payload: { title, body }
    };
  },

  // Fetch active alerts for a user
  getNotificationsByUser: async (userId: string) => {
    return notificationFeed.filter(n => n.userId === userId || n.userId === 'all');
  },

  // Clear or read alerts
  clearAll: async () => {
    notificationFeed.length = 0;
  }
};
