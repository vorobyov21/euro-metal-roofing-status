import { NextRequest, NextResponse } from 'next/server';
import { getAllJobs, createJob, updateJob } from '@/lib/sheets';

export async function GET() {
  try {
    const jobs = await getAllJobs();
    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('GET jobs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const job = await createJob(data);
    return NextResponse.json({ job });
  } catch (error: any) {
    console.error('POST job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 });
    }
    
    const job = await updateJob(data.jobId, data);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json({ job });
  } catch (error: any) {
    console.error('PUT job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
