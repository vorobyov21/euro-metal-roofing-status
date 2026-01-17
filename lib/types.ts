export interface Job {
  // === EXISTING FIELDS (preserved) ===
  jobId: string;
  token: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  postalCode: string;
  contractDate: string;
  contractSigned: boolean;
  depositAmount: string;
  depositReceived: boolean;
  depositDate: string;
  materialsOrdered: boolean;
  materialsOrderedDate: string;
  materialsETA: string;
  supplierNotes: string;
  deliveryScheduled: boolean;
  deliveryDate: string;
  deliveryPlacement: string;
  deliveryCompleted: boolean;
  deliveryCompletedDate: string;
  installScheduled: boolean;
  installDate: string;
  installStarted: boolean;
  installStartedTime: string;
  installCompleted: boolean;
  installCompletedDate: string;
  returnScheduled: boolean;
  returnDate: string;
  returnCompleted: boolean;
  returnCompletedDate: string;
  finalPaymentReceived: boolean;
  finalPaymentDate: string;
  warrantyVisible: boolean;
  warrantyLink: string;
  invoiceVisible: boolean;
  invoiceLink: string;
  status: JobStatus;
  cancelled: boolean;
  dispatcherNotes: string;
  createdAt: string;
  updatedAt: string;
  driveFolder: string;

  // === PHASE 1 FIELDS ===
  
  // Payment: Deposit (enhanced)
  depositStatus: PaymentStatus;
  
  // Payment: Final Balance
  finalStatus: PaymentStatus;
  finalAmount: string;
  
  // Photos (3 categories - single URL each)
  deliveryPhoto: string;      // Materials delivered photo
  installPhoto: string;       // During installation photo
  completedPhoto: string;     // Completed roof photo
  
  // Project Details
  materialStyle: string;      // e.g. "Monterrei"
  materialColour: string;     // e.g. "Dark Brown"
  
  // Installation Day Info
  supervisorName: string;
  
  // Next Step Banner
  nextStepText: string;

  // === PHASE 2 FIELDS ===
  
  // Google Drive folder ID for this job
  driveFolderId: string;
  
  // Contract file
  contractFileId: string;
  contractFileName: string;
  
  // Payment method
  paymentMethod: PaymentMethod;
  
  // Warranty
  warrantyFileId: string;
  warrantyGeneratedDate: string;
}

// Payment status type
export type PaymentStatus = 'paid' | 'pending';

// Payment method type
export type PaymentMethod = 'online' | 'etransfer' | 'cash' | '';

export type JobStatus = 
  | 'pending_approval'
  | 'approved'
  | 'awaiting_deposit'
  | 'deposit_received'
  | 'materials_ordered'
  | 'delivery_scheduled'
  | 'delivery_completed'
  | 'install_scheduled'
  | 'install_started'
  | 'install_completed'
  | 'return_scheduled'
  | 'return_completed'
  | 'warranty_available'
  | 'cancelled';

export type SMSTrigger = 
  | 'job_approved'
  | 'deposit_received'
  | 'materials_ordered'
  | 'delivery_scheduled'
  | 'delivery_completed'
  | 'install_scheduled'
  | 'install_completed'
  | 'return_scheduled'
  | 'return_completed'
  | 'warranty_available'
  | 'payment_reminder'
  | 'review_request';

export const SHEET_COLUMNS = {
  // === EXISTING COLUMNS (preserved) ===
  JOB_ID: 0,
  TOKEN: 1,
  CUSTOMER_NAME: 2,
  CUSTOMER_PHONE: 3,
  CUSTOMER_EMAIL: 4,
  ADDRESS: 5,
  CITY: 6,
  POSTAL_CODE: 7,
  CONTRACT_DATE: 8,
  CONTRACT_SIGNED: 9,
  DEPOSIT_AMOUNT: 10,
  DEPOSIT_RECEIVED: 11,
  DEPOSIT_DATE: 12,
  MATERIALS_ORDERED: 13,
  MATERIALS_ORDERED_DATE: 14,
  MATERIALS_ETA: 15,
  SUPPLIER_NOTES: 16,
  DELIVERY_SCHEDULED: 17,
  DELIVERY_DATE: 18,
  DELIVERY_PLACEMENT: 19,
  DELIVERY_COMPLETED: 20,
  DELIVERY_COMPLETED_DATE: 21,
  INSTALL_SCHEDULED: 22,
  INSTALL_DATE: 23,
  INSTALL_STARTED: 24,
  INSTALL_STARTED_TIME: 25,
  INSTALL_COMPLETED: 26,
  INSTALL_COMPLETED_DATE: 27,
  RETURN_SCHEDULED: 28,
  RETURN_DATE: 29,
  RETURN_COMPLETED: 30,
  RETURN_COMPLETED_DATE: 31,
  FINAL_PAYMENT_RECEIVED: 32,
  FINAL_PAYMENT_DATE: 33,
  WARRANTY_VISIBLE: 34,
  WARRANTY_LINK: 35,
  INVOICE_VISIBLE: 36,
  INVOICE_LINK: 37,
  STATUS: 38,
  CANCELLED: 39,
  DISPATCHER_NOTES: 40,
  CREATED_AT: 41,
  UPDATED_AT: 42,
  DRIVE_FOLDER: 43,
  
  // === PHASE 1 COLUMNS ===
  DEPOSIT_STATUS: 44,
  FINAL_STATUS: 45,
  FINAL_AMOUNT: 46,
  DELIVERY_PHOTO: 47,
  INSTALL_PHOTO: 48,
  COMPLETED_PHOTO: 49,
  MATERIAL_STYLE: 50,
  MATERIAL_COLOUR: 51,
  SUPERVISOR_NAME: 52,
  NEXT_STEP_TEXT: 53,

  // === PHASE 2 COLUMNS ===
  DRIVE_FOLDER_ID: 54,
  CONTRACT_FILE_ID: 55,
  CONTRACT_FILE_NAME: 56,
  PAYMENT_METHOD: 57,
  WARRANTY_FILE_ID: 58,
  WARRANTY_GENERATED_DATE: 59,
} as const;

// Google Review URL (constant for all jobs)
export const GOOGLE_REVIEW_URL = 'https://maps.app.goo.gl/MwXB3nS5dTtNuyjX7';

// Company info
export const COMPANY_EMAIL = 'info@eurometalroofing.ca';
