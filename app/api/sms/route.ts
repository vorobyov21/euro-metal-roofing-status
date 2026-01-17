import { NextRequest, NextResponse } from 'next/server';
import { getJobById } from '@/lib/sheets';
import { sendSMS } from '@/lib/twilio';
import { SMSTrigger } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { jobId, trigger } = await request.json();
    
    if (!jobId || !trigger) {
      return NextResponse.json(
        { success: false, error: 'jobId and trigger are required' },
        { status: 400 }
      );
    }
    
    const job = await getJobById(jobId);
    
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }
    
    const result = await sendSMS(trigger as SMSTrigger, job);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('SMS API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
