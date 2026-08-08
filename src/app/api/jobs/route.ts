import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authHelper } from '@/lib/auth';

// Minimum wage/rate lookup per category
const MINIMUM_RATES: Record<string, number> = {
  "Electrical": 150.00, // per hour or min rate
  "Plumbing": 150.00,
  "Home Cleaning": 100.00,
  "Data Entry": 80.00,
  "Office Help": 120.00,
  "Cooking": 150.00,
  "Delivery": 90.00,
  "Security Guard": 110.00
};

export async function GET(req: NextRequest) {
  try {
    const jobs = await db.jobs.findMany();
    // Filter open jobs
    const openJobs = jobs.filter(j => j.status === 'open');
    return NextResponse.json({ success: true, jobs: openJobs });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ success: false, error: 'Unauthorized employer session.' }, { status: 401 });
    }

    const { title, description, category, rate, priceType, mode, trialMinutes } = await req.json();

    if (!title || !description || !category || !rate || !priceType || !mode) {
      return NextResponse.json({ success: false, error: 'All primary fields are required.' }, { status: 400 });
    }

    // 1. Compliance auto-moderator (Forbidden keywords check)
    const forbiddenKeywords = ['massage', 'erotic', 'sexual', 'companion', 'dating', 'adult'];
    const textToCheck = `${title} ${description} ${category}`.toLowerCase();
    const hasViolation = forbiddenKeywords.some(kw => textToCheck.includes(kw));

    if (hasViolation) {
      return NextResponse.json({ 
        success: false, 
        error: 'Compliance Violation: Job details trigger automatic filters for prohibited services (sexual services or massage listings).' 
      }, { status: 400 });
    }

    // 2. Minimum pay guardrail validation
    const minRequiredRate = MINIMUM_RATES[category] || 80.00; // default 80
    if (parseFloat(rate) < minRequiredRate) {
      return NextResponse.json({
        success: false,
        error: `Pay Guardrail Blocked: The minimum permitted rate for category "${category}" is ₹${minRequiredRate}/hour.`
      }, { status: 400 });
    }

    // Create job
    const job = await db.jobs.create({
      employer_id: session.userId,
      title,
      description,
      category,
      skills: [category],
      photos: [],
      videos: [],
      location_lat: 12.9716,
      location_lng: 77.5946,
      mode,
      price_type: priceType,
      rate: parseFloat(rate),
      recurrence: 'one_off',
      trial_minutes: trialMinutes ? parseInt(trialMinutes) : 30,
      min_workers: 1
    });

    return NextResponse.json({ success: true, job });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to post job' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = authHelper.getSession(req);
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ success: false, error: 'Unauthorized session.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Job ID is required.' }, { status: 400 });
    }

    // Check if the job belongs to this employer
    const job = await db.jobs.findById(id);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found.' }, { status: 404 });
    }
    if (job.employer_id !== session.userId) {
      return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
    }

    // Cancel the job status in DB
    const updated = await db.jobs.update(id, { status: 'cancelled' });
    return NextResponse.json({ success: true, job: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Failed to cancel job' }, { status: 500 });
  }
}

