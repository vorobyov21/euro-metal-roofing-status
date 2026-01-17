import { google } from 'googleapis';
import { Job, SHEET_COLUMNS, PaymentStatus } from './types';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_NAME = 'Jobs';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

export async function getAllJobs(): Promise<Job[]> {
  const sheets = getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${SHEET_NAME}!A2:BD`,
  });
  const rows = response.data.values || [];
  return rows.map(rowToJob);
}

export async function getJobByToken(token: string): Promise<Job | null> {
  const jobs = await getAllJobs();
  return jobs.find(job => job.token === token) || null;
}

export async function getJobById(jobId: string): Promise<Job | null> {
  const jobs = await getAllJobs();
  return jobs.find(job => job.jobId === jobId) || null;
}

export async function createJob(jobData: Partial<Job>): Promise<Job> {
  const sheets = getSheets();
  const jobId = `EMR-${Date.now()}`;
  const token = generateToken();
  const now = new Date().toISOString();
  
  const newJob: Job = {
    // Existing fields
    jobId,
    token,
    customerName: jobData.customerName || '',
    customerPhone: jobData.customerPhone || '',
    customerEmail: jobData.customerEmail || '',
    address: jobData.address || '',
    city: jobData.city || '',
    postalCode: jobData.postalCode || '',
    contractDate: jobData.contractDate || now,
    contractSigned: true,
    depositAmount: jobData.depositAmount || '',
    depositReceived: false,
    depositDate: '',
    materialsOrdered: false,
    materialsOrderedDate: '',
    materialsETA: '',
    supplierNotes: '',
    deliveryScheduled: false,
    deliveryDate: '',
    deliveryPlacement: '',
    deliveryCompleted: false,
    deliveryCompletedDate: '',
    installScheduled: false,
    installDate: '',
    installStarted: false,
    installStartedTime: '',
    installCompleted: false,
    installCompletedDate: '',
    returnScheduled: false,
    returnDate: '',
    returnCompleted: false,
    returnCompletedDate: '',
    finalPaymentReceived: false,
    finalPaymentDate: '',
    warrantyVisible: false,
    warrantyLink: '',
    invoiceVisible: false,
    invoiceLink: '',
    status: 'pending_approval',
    cancelled: false,
    dispatcherNotes: '',
    createdAt: now,
    updatedAt: now,
    driveFolder: '',
    
    // Phase 1 fields
    depositStatus: 'pending',
    finalStatus: 'pending',
    finalAmount: jobData.finalAmount || '',
    deliveryPhoto: '',
    installPhoto: '',
    completedPhoto: '',
    materialStyle: jobData.materialStyle || '',
    materialColour: jobData.materialColour || '',
    supervisorName: '',
    nextStepText: 'Your project has been created. We will contact you shortly.',

    // Phase 2 fields
    driveFolderId: '',
    contractFileId: '',
    contractFileName: '',
    paymentMethod: '',
    warrantyFileId: '',
    warrantyGeneratedDate: '',
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${SHEET_NAME}!A:BD`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [jobToRow(newJob)] },
  });

  return newJob;
}

export async function updateJob(jobId: string, updates: Partial<Job>): Promise<Job | null> {
  const sheets = getSheets();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${SHEET_NAME}!A:A`,
  });
  
  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === jobId);
  
  if (rowIndex === -1) return null;
  
  const currentJob = await getJobById(jobId);
  if (!currentJob) return null;
  
  const updatedJob: Job = {
    ...currentJob,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  updatedJob.status = calculateStatus(updatedJob);
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex + 1}:BD${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [jobToRow(updatedJob)] },
  });

  return updatedJob;
}

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function calculateStatus(job: Job): Job['status'] {
  if (job.cancelled) return 'cancelled';
  if (job.finalPaymentReceived && job.warrantyVisible) return 'warranty_available';
  if (job.returnCompleted) return 'return_completed';
  if (job.returnScheduled) return 'return_scheduled';
  if (job.installCompleted) return 'install_completed';
  if (job.installStarted) return 'install_started';
  if (job.installScheduled) return 'install_scheduled';
  if (job.deliveryCompleted) return 'delivery_completed';
  if (job.deliveryScheduled) return 'delivery_scheduled';
  if (job.materialsOrdered) return 'materials_ordered';
  if (job.depositReceived) return 'deposit_received';
  if (job.contractSigned) return 'awaiting_deposit';
  return 'pending_approval';
}

function rowToJob(row: string[]): Job {
  return {
    // Existing fields
    jobId: row[SHEET_COLUMNS.JOB_ID] || '',
    token: row[SHEET_COLUMNS.TOKEN] || '',
    customerName: row[SHEET_COLUMNS.CUSTOMER_NAME] || '',
    customerPhone: row[SHEET_COLUMNS.CUSTOMER_PHONE] || '',
    customerEmail: row[SHEET_COLUMNS.CUSTOMER_EMAIL] || '',
    address: row[SHEET_COLUMNS.ADDRESS] || '',
    city: row[SHEET_COLUMNS.CITY] || '',
    postalCode: row[SHEET_COLUMNS.POSTAL_CODE] || '',
    contractDate: row[SHEET_COLUMNS.CONTRACT_DATE] || '',
    contractSigned: row[SHEET_COLUMNS.CONTRACT_SIGNED] === 'TRUE',
    depositAmount: row[SHEET_COLUMNS.DEPOSIT_AMOUNT] || '',
    depositReceived: row[SHEET_COLUMNS.DEPOSIT_RECEIVED] === 'TRUE',
    depositDate: row[SHEET_COLUMNS.DEPOSIT_DATE] || '',
    materialsOrdered: row[SHEET_COLUMNS.MATERIALS_ORDERED] === 'TRUE',
    materialsOrderedDate: row[SHEET_COLUMNS.MATERIALS_ORDERED_DATE] || '',
    materialsETA: row[SHEET_COLUMNS.MATERIALS_ETA] || '',
    supplierNotes: row[SHEET_COLUMNS.SUPPLIER_NOTES] || '',
    deliveryScheduled: row[SHEET_COLUMNS.DELIVERY_SCHEDULED] === 'TRUE',
    deliveryDate: row[SHEET_COLUMNS.DELIVERY_DATE] || '',
    deliveryPlacement: row[SHEET_COLUMNS.DELIVERY_PLACEMENT] || '',
    deliveryCompleted: row[SHEET_COLUMNS.DELIVERY_COMPLETED] === 'TRUE',
    deliveryCompletedDate: row[SHEET_COLUMNS.DELIVERY_COMPLETED_DATE] || '',
    installScheduled: row[SHEET_COLUMNS.INSTALL_SCHEDULED] === 'TRUE',
    installDate: row[SHEET_COLUMNS.INSTALL_DATE] || '',
    installStarted: row[SHEET_COLUMNS.INSTALL_STARTED] === 'TRUE',
    installStartedTime: row[SHEET_COLUMNS.INSTALL_STARTED_TIME] || '',
    installCompleted: row[SHEET_COLUMNS.INSTALL_COMPLETED] === 'TRUE',
    installCompletedDate: row[SHEET_COLUMNS.INSTALL_COMPLETED_DATE] || '',
    returnScheduled: row[SHEET_COLUMNS.RETURN_SCHEDULED] === 'TRUE',
    returnDate: row[SHEET_COLUMNS.RETURN_DATE] || '',
    returnCompleted: row[SHEET_COLUMNS.RETURN_COMPLETED] === 'TRUE',
    returnCompletedDate: row[SHEET_COLUMNS.RETURN_COMPLETED_DATE] || '',
    finalPaymentReceived: row[SHEET_COLUMNS.FINAL_PAYMENT_RECEIVED] === 'TRUE',
    finalPaymentDate: row[SHEET_COLUMNS.FINAL_PAYMENT_DATE] || '',
    warrantyVisible: row[SHEET_COLUMNS.WARRANTY_VISIBLE] === 'TRUE',
    warrantyLink: row[SHEET_COLUMNS.WARRANTY_LINK] || '',
    invoiceVisible: row[SHEET_COLUMNS.INVOICE_VISIBLE] === 'TRUE',
    invoiceLink: row[SHEET_COLUMNS.INVOICE_LINK] || '',
    status: (row[SHEET_COLUMNS.STATUS] as Job['status']) || 'pending_approval',
    cancelled: row[SHEET_COLUMNS.CANCELLED] === 'TRUE',
    dispatcherNotes: row[SHEET_COLUMNS.DISPATCHER_NOTES] || '',
    createdAt: row[SHEET_COLUMNS.CREATED_AT] || '',
    updatedAt: row[SHEET_COLUMNS.UPDATED_AT] || '',
    driveFolder: row[SHEET_COLUMNS.DRIVE_FOLDER] || '',
    
    // Phase 1 fields
    depositStatus: (row[SHEET_COLUMNS.DEPOSIT_STATUS] as PaymentStatus) || 'pending',
    finalStatus: (row[SHEET_COLUMNS.FINAL_STATUS] as PaymentStatus) || 'pending',
    finalAmount: row[SHEET_COLUMNS.FINAL_AMOUNT] || '',
    deliveryPhoto: row[SHEET_COLUMNS.DELIVERY_PHOTO] || '',
    installPhoto: row[SHEET_COLUMNS.INSTALL_PHOTO] || '',
    completedPhoto: row[SHEET_COLUMNS.COMPLETED_PHOTO] || '',
    materialStyle: row[SHEET_COLUMNS.MATERIAL_STYLE] || '',
    materialColour: row[SHEET_COLUMNS.MATERIAL_COLOUR] || '',
    supervisorName: row[SHEET_COLUMNS.SUPERVISOR_NAME] || '',
    nextStepText: row[SHEET_COLUMNS.NEXT_STEP_TEXT] || '',

    // Phase 2 fields
    driveFolderId: row[SHEET_COLUMNS.DRIVE_FOLDER_ID] || '',
    contractFileId: row[SHEET_COLUMNS.CONTRACT_FILE_ID] || '',
    contractFileName: row[SHEET_COLUMNS.CONTRACT_FILE_NAME] || '',
    paymentMethod: (row[SHEET_COLUMNS.PAYMENT_METHOD] as Job['paymentMethod']) || '',
    warrantyFileId: row[SHEET_COLUMNS.WARRANTY_FILE_ID] || '',
    warrantyGeneratedDate: row[SHEET_COLUMNS.WARRANTY_GENERATED_DATE] || '',
  };
}

function jobToRow(job: Job): string[] {
  const row: string[] = [];
  // Existing fields
  row[SHEET_COLUMNS.JOB_ID] = job.jobId;
  row[SHEET_COLUMNS.TOKEN] = job.token;
  row[SHEET_COLUMNS.CUSTOMER_NAME] = job.customerName;
  row[SHEET_COLUMNS.CUSTOMER_PHONE] = job.customerPhone;
  row[SHEET_COLUMNS.CUSTOMER_EMAIL] = job.customerEmail;
  row[SHEET_COLUMNS.ADDRESS] = job.address;
  row[SHEET_COLUMNS.CITY] = job.city;
  row[SHEET_COLUMNS.POSTAL_CODE] = job.postalCode;
  row[SHEET_COLUMNS.CONTRACT_DATE] = job.contractDate;
  row[SHEET_COLUMNS.CONTRACT_SIGNED] = job.contractSigned ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.DEPOSIT_AMOUNT] = job.depositAmount;
  row[SHEET_COLUMNS.DEPOSIT_RECEIVED] = job.depositReceived ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.DEPOSIT_DATE] = job.depositDate;
  row[SHEET_COLUMNS.MATERIALS_ORDERED] = job.materialsOrdered ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.MATERIALS_ORDERED_DATE] = job.materialsOrderedDate;
  row[SHEET_COLUMNS.MATERIALS_ETA] = job.materialsETA;
  row[SHEET_COLUMNS.SUPPLIER_NOTES] = job.supplierNotes;
  row[SHEET_COLUMNS.DELIVERY_SCHEDULED] = job.deliveryScheduled ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.DELIVERY_DATE] = job.deliveryDate;
  row[SHEET_COLUMNS.DELIVERY_PLACEMENT] = job.deliveryPlacement;
  row[SHEET_COLUMNS.DELIVERY_COMPLETED] = job.deliveryCompleted ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.DELIVERY_COMPLETED_DATE] = job.deliveryCompletedDate;
  row[SHEET_COLUMNS.INSTALL_SCHEDULED] = job.installScheduled ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.INSTALL_DATE] = job.installDate;
  row[SHEET_COLUMNS.INSTALL_STARTED] = job.installStarted ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.INSTALL_STARTED_TIME] = job.installStartedTime;
  row[SHEET_COLUMNS.INSTALL_COMPLETED] = job.installCompleted ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.INSTALL_COMPLETED_DATE] = job.installCompletedDate;
  row[SHEET_COLUMNS.RETURN_SCHEDULED] = job.returnScheduled ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.RETURN_DATE] = job.returnDate;
  row[SHEET_COLUMNS.RETURN_COMPLETED] = job.returnCompleted ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.RETURN_COMPLETED_DATE] = job.returnCompletedDate;
  row[SHEET_COLUMNS.FINAL_PAYMENT_RECEIVED] = job.finalPaymentReceived ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.FINAL_PAYMENT_DATE] = job.finalPaymentDate;
  row[SHEET_COLUMNS.WARRANTY_VISIBLE] = job.warrantyVisible ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.WARRANTY_LINK] = job.warrantyLink;
  row[SHEET_COLUMNS.INVOICE_VISIBLE] = job.invoiceVisible ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.INVOICE_LINK] = job.invoiceLink;
  row[SHEET_COLUMNS.STATUS] = job.status;
  row[SHEET_COLUMNS.CANCELLED] = job.cancelled ? 'TRUE' : 'FALSE';
  row[SHEET_COLUMNS.DISPATCHER_NOTES] = job.dispatcherNotes;
  row[SHEET_COLUMNS.CREATED_AT] = job.createdAt;
  row[SHEET_COLUMNS.UPDATED_AT] = job.updatedAt;
  row[SHEET_COLUMNS.DRIVE_FOLDER] = job.driveFolder;
  
  // Phase 1 fields
  row[SHEET_COLUMNS.DEPOSIT_STATUS] = job.depositStatus || 'pending';
  row[SHEET_COLUMNS.FINAL_STATUS] = job.finalStatus || 'pending';
  row[SHEET_COLUMNS.FINAL_AMOUNT] = job.finalAmount || '';
  row[SHEET_COLUMNS.DELIVERY_PHOTO] = job.deliveryPhoto || '';
  row[SHEET_COLUMNS.INSTALL_PHOTO] = job.installPhoto || '';
  row[SHEET_COLUMNS.COMPLETED_PHOTO] = job.completedPhoto || '';
  row[SHEET_COLUMNS.MATERIAL_STYLE] = job.materialStyle || '';
  row[SHEET_COLUMNS.MATERIAL_COLOUR] = job.materialColour || '';
  row[SHEET_COLUMNS.SUPERVISOR_NAME] = job.supervisorName || '';
  row[SHEET_COLUMNS.NEXT_STEP_TEXT] = job.nextStepText || '';

  // Phase 2 fields
  row[SHEET_COLUMNS.DRIVE_FOLDER_ID] = job.driveFolderId || '';
  row[SHEET_COLUMNS.CONTRACT_FILE_ID] = job.contractFileId || '';
  row[SHEET_COLUMNS.CONTRACT_FILE_NAME] = job.contractFileName || '';
  row[SHEET_COLUMNS.PAYMENT_METHOD] = job.paymentMethod || '';
  row[SHEET_COLUMNS.WARRANTY_FILE_ID] = job.warrantyFileId || '';
  row[SHEET_COLUMNS.WARRANTY_GENERATED_DATE] = job.warrantyGeneratedDate || '';
  
  return row;
}
