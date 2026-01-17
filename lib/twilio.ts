import twilio from 'twilio';
import { Job, SMSTrigger, GOOGLE_REVIEW_URL } from './types';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const SMS_TEMPLATES: Record<SMSTrigger, (job: Job) => string> = {
  job_approved: (job) => 
    `Hi ${job.customerName}, your roofing project with Euro Metal Roofing has been confirmed! ` +
    `Track your project progress here: ${APP_URL}/t/${job.token}\n\n` +
    `Questions? Call us at 613-297-8822`,

  deposit_received: (job) =>
    `Hi ${job.customerName}, we've received your deposit for your roofing project. Thank you! ` +
    `We'll begin ordering your materials shortly. ` +
    `Track progress: ${APP_URL}/t/${job.token}`,

  materials_ordered: (job) =>
    `Hi ${job.customerName}, great news! Materials for your roofing project have been ordered. ` +
    `We'll contact you soon to schedule delivery. ` +
    `Track progress: ${APP_URL}/t/${job.token}`,

  delivery_scheduled: (job) =>
    `Hi ${job.customerName}, your roofing materials are scheduled for delivery on ${formatDate(job.deliveryDate)}. ` +
    `Placement: ${job.deliveryPlacement || 'To be confirmed'}. ` +
    `Track progress: ${APP_URL}/t/${job.token}`,

  delivery_completed: (job) =>
    `Hi ${job.customerName}, your roofing materials have been delivered! ` +
    `We'll be in touch soon to confirm your installation date. ` +
    `Track progress: ${APP_URL}/t/${job.token}`,

  install_scheduled: (job) =>
    `Hi ${job.customerName}, your roof installation is scheduled for ${formatDate(job.installDate)}. ` +
    `Our crew will arrive in the morning. ` +
    `Track progress: ${APP_URL}/t/${job.token}`,

  install_completed: (job) =>
    `Hi ${job.customerName}, great news! Your new metal roof installation is complete! ` +
    `We'll schedule pickup of leftover materials soon. ` +
    `Track progress: ${APP_URL}/t/${job.token}`,

  return_scheduled: (job) =>
    `Hi ${job.customerName}, we'll be picking up leftover materials on ${formatDate(job.returnDate)}. ` +
    `No action needed from you. ` +
    `Track progress: ${APP_URL}/t/${job.token}`,

  return_completed: (job) =>
    `Hi ${job.customerName}, material pickup is complete! Your project is nearly finished. ` +
    `Once final payment is received, your warranty documents will be available. ` +
    `Track progress: ${APP_URL}/t/${job.token}`,

  warranty_available: (job) =>
    `Hi ${job.customerName}, thank you for choosing Euro Metal Roofing! ` +
    `Your warranty documents are now available. View them here: ${APP_URL}/t/${job.token}\n\n` +
    `Enjoy your new roof! Questions? Call 613-297-8822`,

  payment_reminder: (job) =>
    `Hi ${job.customerName}, this is a friendly reminder that final payment for your roofing project is due. ` +
    `Once received, we'll unlock your warranty documents. ` +
    `Questions? Call Euro Metal Roofing at 613-297-8822`,

review_request: (job) =>
  `Hi ${job.customerName}, this is Euro Metal Roofing. We hope you're happy with your new roof!` +
  `\n\nIf you have a moment, please share your experience in a quick Google review:` +
  `\n${GOOGLE_REVIEW_URL}\n\n` +
  `Thank you for choosing Euro Metal Roofing!`,
};

export async function sendSMS(
  trigger: SMSTrigger,
  job: Job
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (job.cancelled) {
      return { success: false, error: 'Job is cancelled' };
    }

    const template = SMS_TEMPLATES[trigger];
    if (!template) {
      return { success: false, error: `Unknown SMS trigger: ${trigger}` };
    }

    const messageBody = template(job);
    const toNumber = formatPhoneNumber(job.customerPhone);
    
    if (!toNumber) {
      return { success: false, error: 'Invalid phone number' };
    }

    const message = await client.messages.create({
      body: messageBody,
      from: FROM_NUMBER,
      to: toNumber,
    });

    return { success: true, messageId: message.sid };
  } catch (error: any) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return 'TBD';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}
