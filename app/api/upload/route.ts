import { NextRequest, NextResponse } from 'next/server';
import { createJobFolder, uploadPhoto, uploadFile, getViewLink } from '@/lib/drive';
import { getJobById, updateJob } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobId = formData.get('jobId') as string;
    const fileType = formData.get('fileType') as string; // 'contract', 'delivery', 'install', 'completed'

    if (!file || !jobId || !fileType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the job
    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Create job folder if it doesn't exist
    let folderId = job.driveFolderId;
    if (!folderId) {
      folderId = await createJobFolder(job.customerName, job.address);
      await updateJob(jobId, { driveFolderId: folderId });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename with timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    let fileName: string;
    
    switch (fileType) {
      case 'contract':
        fileName = `Contract_${job.customerName.replace(/\s+/g, '_')}_${timestamp}.${extension}`;
        break;
      case 'delivery':
        fileName = `Delivery_Photo_${timestamp}.${extension}`;
        break;
      case 'install':
        fileName = `Installation_Photo_${timestamp}.${extension}`;
        break;
      case 'completed':
        fileName = `Completed_Roof_${timestamp}.${extension}`;
        break;
      default:
        fileName = `${fileType}_${timestamp}.${extension}`;
    }

    // Upload to Google Drive
    let result;
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension.toLowerCase());
    
    if (isImage && fileType !== 'contract') {
      result = await uploadPhoto(folderId, fileName, buffer, file.type);
    } else {
      const uploadResult = await uploadFile(folderId, fileName, buffer, file.type);
      result = {
        fileId: uploadResult.fileId,
        viewUrl: getViewLink(uploadResult.fileId),
      };
    }

    // Update job record based on file type
    const updates: Record<string, any> = {};
    
    switch (fileType) {
      case 'contract':
        updates.contractFileId = result.fileId;
        updates.contractFileName = fileName;
        break;
      case 'delivery':
        updates.deliveryPhoto = result.viewUrl;
        break;
      case 'install':
        updates.installPhoto = result.viewUrl;
        break;
      case 'completed':
        updates.completedPhoto = result.viewUrl;
        break;
    }

    await updateJob(jobId, updates);

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      viewUrl: result.viewUrl,
      fileName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
