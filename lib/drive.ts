import { google } from 'googleapis';
import { Readable } from 'stream';

// Initialize Google Drive API using existing credentials
function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
}

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

/**
 * Create a folder for a job in Google Drive
 */
export async function createJobFolder(customerName: string, address: string): Promise<string> {
  const drive = getDriveClient();
  
  // Clean folder name (remove special characters)
  const folderName = `${customerName} - ${address}`.replace(/[<>:"/\\|?*]/g, '');
  
  const response = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [ROOT_FOLDER_ID],
    },
    fields: 'id',
  });

  return response.data.id || '';
}

/**
 * Upload a file to a job's folder
 */
export async function uploadFile(
  folderId: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ fileId: string; webViewLink: string }> {
  const drive = getDriveClient();

  // Convert buffer to readable stream
  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink',
  });

  // Make file viewable by anyone with link
  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    fileId: response.data.id || '',
    webViewLink: response.data.webViewLink || '',
  };
}

/**
 * Upload a photo and return direct view URL
 */
export async function uploadPhoto(
  folderId: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ fileId: string; viewUrl: string }> {
  const result = await uploadFile(folderId, fileName, fileBuffer, mimeType);
  
  // Create direct thumbnail URL for images
  const viewUrl = `https://drive.google.com/thumbnail?id=${result.fileId}&sz=w1000`;
  
  return {
    fileId: result.fileId,
    viewUrl,
  };
}

/**
 * Get a shareable download link for a file
 */
export function getDownloadLink(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Get a shareable view link for a file
 */
export function getViewLink(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Delete a file from Google Drive
 */
export async function deleteFile(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}

/**
 * List files in a folder
 */
export async function listFolderFiles(folderId: string): Promise<Array<{ id: string; name: string; mimeType: string }>> {
  const drive = getDriveClient();
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
  });

  return (response.data.files || []).map(f => ({
    id: f.id || '',
    name: f.name || '',
    mimeType: f.mimeType || '',
  }));
}
