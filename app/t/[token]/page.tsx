import { getJobByToken } from '@/lib/sheets';
import { Job, GOOGLE_REVIEW_URL } from '@/lib/types';
import { 
  CheckCircle, Circle, Clock, FileText, Download, Phone, Mail, 
  Calendar, User, CreditCard, Camera, HelpCircle, Star, ChevronDown
} from 'lucide-react';
import EmailWarrantyForm from './EmailWarrantyForm';

interface PageProps {
  params: { token: string };
}

export default async function StatusPage({ params }: PageProps) {
  const job = await getJobByToken(params.token);

  if (!job) {
    return <NotFound />;
  }

  if (job.cancelled) {
    return <Cancelled />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header job={job} />
      
      {/* Next Step Banner */}
      <NextStepBanner job={job} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Desktop: Two columns | Mobile: Single column */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Timeline (Desktop) */}
          <div className="hidden lg:block lg:w-2/5">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-euro-gray mb-6">Project Timeline</h3>
              <Timeline job={job} />
            </div>
          </div>

          {/* Right Column - Cards */}
          <div className="flex-1 space-y-6">
            {/* Dynamic Current Step Card */}
            <CurrentStepCard job={job} />
            
            {/* Payment Status */}
            <PaymentStatusCard job={job} />
            
            {/* Photos */}
            <PhotosCard job={job} />

            {/* Mobile Timeline */}
            <div className="lg:hidden bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-euro-gray mb-6">Project Timeline</h3>
              <Timeline job={job} />
            </div>

            {/* Invoice Only (if available) */}
            <InvoiceCard job={job} />

            {/* FAQ */}
            <FAQCard />
            
            {/* Contact */}
            <ContactCard />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// ===========================================
// HEADER
// ===========================================

function Header({ job }: { job: Job }) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-CA', { 
        month: 'long', day: 'numeric', year: 'numeric' 
      });
    } catch { return dateStr; }
  };

  return (
    <header className="bg-euro-gray text-white py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-euro-green rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">Euro Metal Roofing</h1>
            <p className="text-gray-400 text-sm">Installation Status</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-lg font-semibold">{job.customerName}</h2>
          <p className="text-gray-300">{job.address}, {job.city}, {job.postalCode}</p>
          {job.updatedAt && (
            <p className="text-gray-500 text-xs mt-2">Last updated: {formatDate(job.updatedAt)}</p>
          )}
        </div>
      </div>
    </header>
  );
}

// ===========================================
// NEXT STEP BANNER
// ===========================================

function NextStepBanner({ job }: { job: Job }) {
  const nextStepText = job.nextStepText || getDefaultNextStep(job);
  
  return (
    <div className="bg-euro-green text-white py-4">
      <div className="max-w-6xl mx-auto px-4">
        <p className="font-medium">
          <span className="opacity-80">Next step:</span> {nextStepText}
        </p>
      </div>
    </div>
  );
}

function getDefaultNextStep(job: Job): string {
  if (job.finalStatus === 'paid' && job.warrantyVisible) {
    return 'Your project is complete! Warranty documents are available below.';
  }
  if (job.installCompleted && job.finalStatus !== 'paid') {
    return 'Installation complete. Awaiting final payment to release warranty.';
  }
  if (job.installStarted) {
    return 'Installation is in progress.';
  }
  if (job.installScheduled && job.installDate) {
    return `Your installation is scheduled for ${formatDateShort(job.installDate)}.`;
  }
  if (job.deliveryCompleted) {
    return 'Materials delivered. We will contact you to schedule installation.';
  }
  if (job.deliveryScheduled && job.deliveryDate) {
    return `Delivery scheduled for ${formatDateShort(job.deliveryDate)}.`;
  }
  if (job.materialsOrdered) {
    return 'Your materials are being prepared. We will contact you to confirm delivery.';
  }
  if (job.depositReceived || job.depositStatus === 'paid') {
    return 'Deposit received. Materials will be ordered shortly.';
  }
  return 'Your project has been created. We will contact you shortly.';
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return 'TBD';
  try {
    return new Date(dateStr).toLocaleDateString('en-CA', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  } catch { return dateStr; }
}

// ===========================================
// TIMELINE (5 Steps)
// ===========================================

function Timeline({ job }: { job: Job }) {
  const steps = getTimelineSteps(job);
  const showWarranty = (job.finalStatus === 'paid' || job.finalPaymentReceived) && job.warrantyVisible && job.warrantyLink;

  return (
    <div className="relative">
      {steps.map((step, index) => (
        <div key={step.id} className="flex gap-4 pb-8 last:pb-0">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step.completed
                ? 'bg-euro-green text-white'
                : step.current
                ? 'bg-euro-green/20 text-euro-green border-2 border-euro-green'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {step.completed ? (
                <CheckCircle className="w-5 h-5" />
              ) : step.current ? (
                <Clock className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-0.5 flex-1 mt-2 ${step.completed ? 'bg-euro-green' : 'bg-gray-200'}`} />
            )}
          </div>
          <div className="flex-1 pb-2">
            <h4 className={`font-medium ${step.completed || step.current ? 'text-euro-gray' : 'text-gray-400'}`}>
              {step.label}
            </h4>
            {step.date && (
              <p className="text-sm text-gray-500 mt-1">{step.date}</p>
            )}
            {step.description && (step.current || step.completed) && (
              <p className={`text-sm mt-1 ${step.current ? 'text-euro-green' : 'text-gray-500'}`}>
                {step.description}
              </p>
            )}
            {/* Warranty preview inline with warranty step */}
            {step.id === 'warranty' && showWarranty && (
              <div className="mt-3 space-y-3">
                <a
                  href={job.warrantyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 p-3 bg-euro-green/10 rounded-lg hover:bg-euro-green/20 transition-colors"
                >
                  <div className="w-12 h-16 bg-white border border-gray-200 rounded flex items-center justify-center">
                    <FileText className="w-6 h-6 text-euro-green" />
                  </div>
                  <div>
                    <p className="font-medium text-euro-gray text-sm">Warranty Certificate</p>
                    <p className="text-xs text-euro-green flex items-center gap-1">
                      <Download className="w-3 h-3" /> Click to download
                    </p>
                  </div>
                </a>
                {/* Email warranty form */}
                <EmailWarrantyForm jobId={job.jobId} customerEmail={job.customerEmail} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function getTimelineSteps(job: Job) {
  return [
    {
      id: 'materials',
      label: 'Materials Ordered',
      completed: job.materialsOrdered,
      current: (job.depositReceived || job.depositStatus === 'paid') && !job.materialsOrdered,
      date: job.materialsOrderedDate ? formatDateShort(job.materialsOrderedDate) : undefined,
      description: job.materialsOrdered 
        ? 'Your materials have been ordered.' 
        : 'Your materials are being prepared.',
    },
    {
      id: 'delivery',
      label: 'Delivery',
      completed: job.deliveryCompleted,
      current: job.materialsOrdered && !job.deliveryCompleted,
      date: job.deliveryCompleted 
        ? `Completed ${formatDateShort(job.deliveryCompletedDate)}`
        : job.deliveryScheduled 
        ? `Scheduled for ${formatDateShort(job.deliveryDate)}`
        : undefined,
      description: job.deliveryCompleted 
        ? 'Materials delivered to your property.'
        : job.deliveryScheduled 
        ? 'Delivery has been scheduled.'
        : 'Scheduling delivery.',
    },
    {
      id: 'installation',
      label: 'Installation',
      completed: job.installCompleted,
      current: job.deliveryCompleted && !job.installCompleted,
      date: job.installCompleted 
        ? `Completed ${formatDateShort(job.installCompletedDate)}`
        : job.installStarted
        ? 'In progress'
        : job.installScheduled 
        ? `Scheduled for ${formatDateShort(job.installDate)}`
        : undefined,
      description: job.installCompleted 
        ? 'Your new roof is installed!'
        : job.installStarted 
        ? 'Our crew is working on your roof.'
        : job.installScheduled 
        ? 'Installation has been scheduled.'
        : 'Scheduling installation.',
    },
    {
      id: 'payment',
      label: 'Final Payment',
      completed: job.finalStatus === 'paid' || job.finalPaymentReceived,
      current: job.installCompleted && job.finalStatus !== 'paid' && !job.finalPaymentReceived,
      date: job.finalPaymentDate ? formatDateShort(job.finalPaymentDate) : undefined,
      description: (job.finalStatus === 'paid' || job.finalPaymentReceived)
        ? 'Payment received. Thank you!'
        : 'Awaiting final payment.',
    },
    {
      id: 'warranty',
      label: 'Warranty & Documents',
      completed: job.warrantyVisible && job.warrantyLink,
      current: (job.finalStatus === 'paid' || job.finalPaymentReceived) && !job.warrantyVisible,
      date: undefined,
      description: job.warrantyVisible 
        ? 'Your warranty is available below.'
        : 'Available after final payment.',
    },
  ];
}

// ===========================================
// CURRENT STEP CARD (Dynamic based on status)
// ===========================================

function getCurrentStep(job: Job): string {
  if (job.finalStatus === 'paid' || job.finalPaymentReceived) return 'warranty';
  if (job.installCompleted) return 'payment_pending';
  if (job.installStarted) return 'install_started';
  if (job.installScheduled) return 'install_scheduled';
  if (job.deliveryCompleted) return 'delivery_completed';
  if (job.deliveryScheduled) return 'delivery_scheduled';
  if (job.materialsOrdered) return 'materials_ordered';
  return 'awaiting_start';
}

function CurrentStepCard({ job }: { job: Job }) {
  const currentStep = getCurrentStep(job);

  switch (currentStep) {
    case 'materials_ordered':
      return <MaterialsOrderedCard job={job} />;
    case 'delivery_scheduled':
      return <DeliveryScheduledCard job={job} />;
    case 'delivery_completed':
      return <DeliveryCompletedCard job={job} />;
    case 'install_scheduled':
      return <InstallScheduledCard job={job} />;
    case 'install_started':
      return <InstallStartedCard job={job} />;
    case 'payment_pending':
      return <PaymentPendingCard job={job} />;
    case 'warranty':
      return <WarrantyReadyCard job={job} />;
    default:
      return <AwaitingStartCard job={job} />;
  }
}

function AwaitingStartCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Getting Started</h3>
      </div>
      <p className="text-gray-600">
        Your project has been created. We will contact you shortly to discuss the next steps.
      </p>
    </div>
  );
}

function MaterialsOrderedCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Your Order Details</h3>
      </div>
      <div className="space-y-3">
        {job.materialStyle && (
          <div className="flex justify-between">
            <span className="text-gray-600">Metal roof design</span>
            <span className="font-medium text-euro-gray">{job.materialStyle}</span>
          </div>
        )}
        {job.materialColour && (
          <div className="flex justify-between">
            <span className="text-gray-600">Metal roof colour</span>
            <span className="font-medium text-euro-gray">{job.materialColour}</span>
          </div>
        )}
        {job.materialsOrderedDate && (
          <div className="flex justify-between">
            <span className="text-gray-600">Order date</span>
            <span className="font-medium text-euro-gray">{formatDateShort(job.materialsOrderedDate)}</span>
          </div>
        )}
      </div>
      <div className="bg-gray-50 rounded-lg p-3 mt-4">
        <p className="text-sm text-gray-600">
          Want to change colour or design?{' '}
          <a href="tel:6132978822" className="text-euro-green hover:underline font-medium">
            Call us at 613-297-8822
          </a>
        </p>
      </div>
    </div>
  );
}

function DeliveryScheduledCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Delivery Scheduled</h3>
      </div>
      <div className="space-y-3">
        {job.deliveryDate && (
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery date</span>
            <span className="font-medium text-euro-gray">{formatDateShort(job.deliveryDate)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery address</span>
          <span className="font-medium text-euro-gray text-right">{job.address}, {job.city}</span>
        </div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 space-y-2">
        <p className="text-sm text-yellow-800">
          📋 Materials usually require two car-sized parking spaces. Please ensure your driveway is clear.
        </p>
        <p className="text-sm text-yellow-800">
          ⏰ Delivery date can only be changed up to 12 hours before the scheduled time.
        </p>
      </div>
    </div>
  );
}

function DeliveryCompletedCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Materials Delivered</h3>
      </div>
      <p className="text-gray-600 mb-4">
        Your materials have been delivered successfully. We will contact you shortly to schedule your installation date.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-sm text-amber-800">
          <strong>Please note:</strong> Any unused materials remain the property of Euro Metal Roofing and will be collected after installation. We kindly ask that these items are left untouched.
        </p>
      </div>
    </div>
  );
}

function InstallScheduledCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Installation Day</h3>
      </div>
      <div className="space-y-3">
        {job.installDate && (
          <div className="flex justify-between">
            <span className="text-gray-600">Installation date</span>
            <span className="font-medium text-euro-gray">{formatDateShort(job.installDate)}</span>
          </div>
        )}
        {job.supervisorName && (
          <div className="flex justify-between">
            <span className="text-gray-600">Crew lead</span>
            <span className="font-medium text-euro-gray">{job.supervisorName}</span>
          </div>
        )}
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
        <p className="text-sm text-yellow-800">
          📋 Please remove your cars from the driveway before installation begins.
        </p>
      </div>
    </div>
  );
}

function InstallStartedCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Installation In Progress</h3>
      </div>
      <p className="text-gray-600 mb-4">
        Our crew is currently working on your roof. Installation typically takes 1–3 days, depending on roof size, complexity, and weather.
      </p>
      {job.supervisorName && (
        <div className="flex justify-between py-2 border-t">
          <span className="text-gray-600">Crew lead</span>
          <span className="font-medium text-euro-gray">{job.supervisorName}</span>
        </div>
      )}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        <p className="text-sm text-amber-800">
          <strong>Please note:</strong> Every project includes extra materials to avoid delays and additional deliveries. Please leave all materials untouched — they belong to Euro Metal Roofing and will be collected after installation. If any materials are missing or stolen, their cost will be added to the remaining balance.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
        <p className="text-sm text-blue-800">
          💳 Remaining payment is expected on the final day of installation.
        </p>
      </div>
    </div>
  );
}

function PaymentPendingCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Installation Complete!</h3>
      </div>
      <p className="text-gray-600 mb-4">
        Your new metal roof has been installed. Once we receive your remaining payment, your warranty documents will be available on this page.
      </p>
      {job.finalAmount && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Remaining balance due</span>
            <span className="font-bold text-lg text-euro-gray">CAD ${Number(job.finalAmount).toLocaleString()}</span>
          </div>
        </div>
      )}
      
      {/* Payment Method Info */}
      {job.paymentMethod === 'online' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-medium text-blue-800 mb-2">💳 Online Payment</p>
          <p className="text-sm text-blue-700">Online payment will be available soon. Your project manager will contact you with payment details.</p>
        </div>
      )}
      
      {job.paymentMethod === 'etransfer' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-medium text-blue-800 mb-2">📧 E-Transfer Payment</p>
          <p className="text-sm text-blue-700 mb-2">Please send your e-transfer to:</p>
          <p className="font-mono text-blue-900 bg-blue-100 px-3 py-2 rounded text-center">info@eurometalroofing.ca</p>
          <p className="text-xs text-blue-600 mt-2">Include your name and address in the message.</p>
        </div>
      )}
      
      {job.paymentMethod === 'cash' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-medium text-blue-800 mb-2">💵 Cash Payment</p>
          <p className="text-sm text-blue-700">Your project manager will contact you to collect payment in person.</p>
        </div>
      )}
      
      {!job.paymentMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💳 Your project manager will contact you soon for payment collection.
          </p>
        </div>
      )}
    </div>
  );
}

function WarrantyReadyCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Thank You!</h3>
      </div>
      <p className="text-gray-600 mb-4">
        Your project is complete and your warranty documents are now available below. Thank you for choosing Euro Metal Roofing!
      </p>
    </div>
  );
}

// ===========================================
// PAYMENT STATUS CARD
// ===========================================

function PaymentStatusCard({ job }: { job: Job }) {
  const depositPaid = job.depositStatus === 'paid' || job.depositReceived;
  const finalPaid = job.finalStatus === 'paid' || job.finalPaymentReceived;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Payment Status</h3>
      </div>
      <div className="space-y-4">
        {/* Deposit */}
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <p className="font-medium text-euro-gray">Deposit</p>
            {job.depositAmount && (
              <p className="text-sm text-gray-500">CAD ${Number(job.depositAmount).toLocaleString()}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            depositPaid 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {depositPaid ? '✓ Paid' : 'Pending'}
          </span>
        </div>

        {/* Remaining Balance */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-euro-gray">Remaining Balance</p>
            {job.finalAmount && (
              <p className="text-sm text-gray-500">CAD ${Number(job.finalAmount).toLocaleString()}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            finalPaid 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {finalPaid ? '✓ Paid' : 'Pending'}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4 pt-4 border-t">
        All payments are processed through our office. Installers do not collect payments.
      </p>
    </div>
  );
}

// ===========================================
// PHOTOS CARD
// ===========================================

function PhotosCard({ job }: { job: Job }) {
  const hasPhotos = job.deliveryPhoto || job.installPhoto || job.completedPhoto;
  
  if (!hasPhotos) return null;

  const photos = [
    { url: job.deliveryPhoto, label: 'Materials delivered' },
    { url: job.installPhoto, label: 'During installation' },
    { url: job.completedPhoto, label: 'Completed roof' },
  ].filter(p => p.url);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Photos From Your Project</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="space-y-2">
            <a href={photo.url} target="_blank" rel="noopener noreferrer" className="block">
              <img 
                src={photo.url} 
                alt={photo.label}
                className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
            </a>
            <p className="text-sm text-gray-600 text-center">{photo.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================
// INVOICE CARD (Warranty moved to Timeline)
// ===========================================

function InvoiceCard({ job }: { job: Job }) {
  const finalPaid = job.finalStatus === 'paid' || job.finalPaymentReceived;
  const showInvoice = finalPaid && job.invoiceVisible && job.invoiceLink;

  if (!showInvoice) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Invoice</h3>
      </div>
      <a
        href={job.invoiceLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <FileText className="w-6 h-6 text-gray-600" />
        <div className="flex-1">
          <p className="font-medium text-euro-gray">Download Invoice</p>
          <p className="text-sm text-gray-500">View your project invoice</p>
        </div>
        <Download className="w-5 h-5 text-gray-600" />
      </a>
    </div>
  );
}

// ===========================================
// PROJECT DETAILS CARD - REMOVED
// Material info moved to Materials Ordered timeline step
// ===========================================

// ===========================================
// FAQ CARD
// ===========================================

function FAQCard() {
  const faqs = [
    {
      question: 'How long does installation take?',
      answer: 'Most residential installations are completed in 1–3 days, depending on the size and complexity of your roof.',
    },
    {
      question: 'Do I need to be home?',
      answer: 'Our installers are professionals who install roofs every day and do not require your supervision. All work is done from the outside, and we do not need access to the interior of your home.',
    },
    {
      question: 'Can I make changes to my ongoing project?',
      answer: 'Absolutely. We will do our best to accommodate it. Please call 613-297-8822 to confirm.',
    },
    {
      question: 'What about construction waste cleanup?',
      answer: 'Our installers collect all debris on the final day of work and remove it when they leave. In cases where excess materials or waste remain, we will send a truck to complete the cleanup within a few days.',
    },
    {
      question: 'What if the weather is bad?',
      answer: 'We monitor weather conditions closely. If conditions are unsafe for installation, we will reschedule and notify you promptly.',
    },
    {
      question: 'When do I receive my warranty certificate?',
      answer: 'Your warranty certificate becomes available on this page immediately after your final payment is processed.',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-euro-green" />
        <h3 className="text-lg font-semibold text-euro-gray">Frequently Asked Questions</h3>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details key={index} className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none py-3 border-b border-gray-100 group-open:border-euro-green">
              <span className="font-medium text-euro-gray pr-4">{faq.question}</span>
              <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-gray-600 text-sm py-3">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

// ===========================================
// CONTACT CARD
// ===========================================

function ContactCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-euro-gray mb-4">Contact Us</h3>
      <div className="space-y-3">
        <a
          href="tel:6132978822"
          className="flex items-center gap-3 text-gray-600 hover:text-euro-green transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span>613-297-8822</span>
        </a>
        <a
          href="mailto:info@eurometalroofing.ca"
          className="flex items-center gap-3 text-gray-600 hover:text-euro-green transition-colors"
        >
          <Mail className="w-5 h-5" />
          <span>info@eurometalroofing.ca</span>
        </a>
      </div>
    </div>
  );
}

// ===========================================
// FOOTER
// ===========================================

function Footer() {
  return (
    <footer className="bg-euro-gray text-gray-400 py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} Euro Metal Roofing. All rights reserved.</p>
        <p className="mt-1">Metal Roofing in Toronto & GTA</p>
      </div>
    </footer>
  );
}

// ===========================================
// ERROR STATES
// ===========================================

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Project Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn&apos;t find a project with this tracking link.</p>
        <p className="text-sm text-gray-500">
          Questions? Call Euro Metal Roofing at{' '}
          <a href="tel:6132978822" className="text-euro-green hover:underline">613-297-8822</a>
        </p>
      </div>
    </div>
  );
}

function Cancelled() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Circle className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Project Closed</h1>
        <p className="text-gray-600 mb-6">This project tracker is no longer active.</p>
        <p className="text-sm text-gray-500">
          Questions? Call Euro Metal Roofing at{' '}
          <a href="tel:6132978822" className="text-euro-green hover:underline">613-297-8822</a>
        </p>
      </div>
    </div>
  );
}
