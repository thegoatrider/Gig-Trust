import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { db, User } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'gigtrust-super-secret-key-1234567890';
const COOKIE_NAME = 'gigtrust-auth-token';

export interface AuthSession {
  userId: string;
  email: string;
  role: 'worker' | 'employer' | 'admin' | 'moderator' | 'finance';
}

export const authHelper = {
  // Sign JWT token
  signToken: (payload: AuthSession): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  },

  // Verify JWT token
  verifyToken: (token: string): AuthSession | null => {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthSession;
    } catch (e) {
      return null;
    }
  },

  // Set Auth Cookie
  setSessionCookie: (response: NextResponse, session: AuthSession) => {
    const token = authHelper.signToken(session);
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
  },

  // Clear Auth Cookie
  clearSessionCookie: (response: NextResponse) => {
    response.cookies.delete(COOKIE_NAME);
  },

  // Get session from request cookies
  getSession: (req: NextRequest): AuthSession | null => {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return authHelper.verifyToken(token);
  },

  // Get current user details from DB based on request context
  getCurrentUser: async (req: NextRequest): Promise<User | null> => {
    const session = authHelper.getSession(req);
    if (!session) return null;
    return await db.users.findById(session.userId) || null;
  }
};
