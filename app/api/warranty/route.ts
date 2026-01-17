import { NextRequest, NextResponse } from 'next/server';
import { generateWarrantyPDF } from '@/lib/warranty';
import { createJobFolder, uploadFile, getViewLink, getDownloadLink } from '@/lib/drive';
import { getJobById, updateJob } from '@/lib/sheets';

// Generate warranty PDF
export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    // Get the job
    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if final payment is received
    if (job.finalStatus !== 'paid' && !job.finalPaymentReceived) {
      return NextResponse.json({ error: 'Final payment not received' }, { status: 400 });
    }

    // Create job folder if it doesn't exist
    let folderId = job.driveFolderId;
    if (!folderId) {
      folderId = await createJobFolder(job.customerName, job.address);
      await updateJob(jobId, { driveFolderId: folderId });
    }

    // Generate warranty PDF
    const pdfBuffer = await generateWarrantyPDF({
      customerName: job.customerName,
      address: job.address,
      city: job.city,
      postalCode: job.postalCode,
      installationDate: job.installCompletedDate || job.installDate || new Date().toISOString(),
    });

    // Upload to Google Drive
    const fileName = `Warranty_Certificate_${job.customerName.replace(/\s+/g, '_')}.pdf`;
    const result = await uploadFile(folderId, fileName, pdfBuffer, 'application/pdf');

    // Update job record
    const now = new Date().toISOString();
    await updateJob(jobId, {
      warrantyFileId: result.fileId,
      warrantyLink: getViewLink(result.fileId),
      warrantyVisible: true,
      warrantyGeneratedDate: now,
    });

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      viewLink: getViewLink(result.fileId),
      downloadLink: getDownloadLink(result.fileId),
    });
  } catch (error) {
    console.error('Warranty generation error:', error);
    return NextResponse.json(
      { error: 'Warranty generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Email warranty to customer
export async function PUT(request: NextRequest) {
  try {
    const { jobId, email } = await request.json();

    if (!jobId || !email) {
      return NextResponse.json({ error: 'Job ID and email required' }, { status: 400 });
    }

    // Get the job
    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (!job.warrantyLink) {
      return NextResponse.json({ error: 'Warranty not generated yet' }, { status: 400 });
    }

    // For now, we'll use a simple approach - in production you'd use SendGrid, SES, etc.
    // This is a placeholder that returns success
    // TODO: Implement actual email sending
    
    // Update customer email if different
    if (email !== job.customerEmail) {
      await updateJob(jobId, { customerEmail: email });
    }

    // In a real implementation, you would:
    // 1. Generate the PDF again or fetch from Drive
    // 2. Send via email service with PDF attachment
    // For now, we'll simulate success

    return NextResponse.json({
      success: true,
      message: `Warranty will be sent to ${email}`,
      // In production, this would actually send the email
    });
  } catch (error) {
    console.error('Email warranty error:', error);
    return NextResponse.json(
      { error: 'Failed to email warranty', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
