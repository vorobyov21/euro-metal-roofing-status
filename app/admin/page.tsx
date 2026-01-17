'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, RefreshCw, Send, ExternalLink, X, LogOut,
  MapPin, Calendar, ChevronDown, ChevronUp, Package, Truck,
  Wrench, CreditCard, Camera, FileText, MessageSquare, CheckCircle,
  Clock, AlertCircle, User, Palette, Star, Upload, Download, Mail
} from 'lucide-react';

interface Job {
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
  status: string;
  cancelled: boolean;
  dispatcherNotes: string;
  createdAt: string;
  updatedAt: string;
  driveFolder: string;
  depositStatus: 'paid' | 'pending';
  finalStatus: 'paid' | 'pending';
  finalAmount: string;
  deliveryPhoto: string;
  installPhoto: string;
  completedPhoto: string;
  materialStyle: string;
  materialColour: string;
  supervisorName: string;
  nextStepText: string;
  // Phase 2 fields
  driveFolderId: string;
  contractFileId: string;
  contractFileName: string;
  paymentMethod: 'online' | 'etransfer' | 'cash' | '';
  warrantyFileId: string;
  warrantyGeneratedDate: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showNewJobForm, setShowNewJobForm] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('emr_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchJobs();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem('emr_auth', 'true');
        setIsAuthenticated(true);
        fetchJobs();
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Login failed');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('emr_auth');
    setIsAuthenticated(false);
    setJobs([]);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} password={password} setPassword={setPassword} error={error} />;
  }

  const filteredJobs = jobs.filter(job => 
    job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jobId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeJobs = filteredJobs.filter(j => !j.cancelled && j.status !== 'warranty_available');
  const completedJobs = filteredJobs.filter(j => j.status === 'warranty_available' && !j.cancelled);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-euro-gray text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-euro-green rounded-full flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold">Euro Metal Roofing</h1>
              <p className="text-xs text-gray-400">Dispatcher Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchJobs} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, address, or job ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-euro-green focus:ring-1 focus:ring-euro-green outline-none"
            />
          </div>
          <button
            onClick={() => setShowNewJobForm(true)}
            className="bg-euro-green text-white px-6 py-3 rounded-lg font-medium hover:bg-euro-green-dark transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Job
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Active Jobs" value={activeJobs.length} color="blue" icon={<Clock className="w-5 h-5" />} />
          <StatCard label="Completed" value={completedJobs.length} color="green" icon={<CheckCircle className="w-5 h-5" />} />
          <StatCard label="Awaiting Deposit" value={jobs.filter(j => j.depositStatus !== 'paid' && !j.depositReceived && !j.cancelled).length} color="yellow" icon={<CreditCard className="w-5 h-5" />} />
          <StatCard label="Ready for Install" value={jobs.filter(j => j.deliveryCompleted && !j.installScheduled && !j.cancelled).length} color="purple" icon={<Wrench className="w-5 h-5" />} />
          <StatCard label="Awaiting Payment" value={jobs.filter(j => j.installCompleted && j.finalStatus !== 'paid' && !j.cancelled).length} color="orange" icon={<AlertCircle className="w-5 h-5" />} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-euro-gray">Active Jobs ({activeJobs.length})</h2>
          {activeJobs.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">No active jobs found</div>
          ) : (
            activeJobs.map(job => (
              <JobCard key={job.jobId} job={job} onClick={() => setSelectedJob(job)} />
            ))
          )}

          {completedJobs.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-euro-gray mt-8">Completed ({completedJobs.length})</h2>
              {completedJobs.map(job => (
                <JobCard key={job.jobId} job={job} onClick={() => setSelectedJob(job)} />
              ))}
            </>
          )}
        </div>
      </main>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={(updated) => {
            setJobs(jobs.map(j => j.jobId === updated.jobId ? updated : j));
            setSelectedJob(updated);
          }}
        />
      )}
      {showNewJobForm && (
        <NewJobModal
          onClose={() => setShowNewJobForm(false)}
          onCreated={(job) => {
            setJobs([job, ...jobs]);
            setShowNewJobForm(false);
          }}
        />
      )}
    </div>
  );
}

function LoginScreen({ onLogin, password, setPassword, error }: {
  onLogin: (e: React.FormEvent) => void;
  password: string;
  setPassword: (p: string) => void;
  error: string;
}) {
  return (
    <div className="min-h-screen bg-euro-gray flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-euro-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-euro-gray">Dispatcher Login</h1>
          <p className="text-gray-500 text-sm mt-1">Euro Metal Roofing</p>
        </div>
        <form onSubmit={onLogin}>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-euro-green focus:ring-1 focus:ring-euro-green outline-none mb-4"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-euro-green text-white py-3 rounded-lg font-medium hover:bg-euro-green-dark transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className={`rounded-lg p-4 border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-euro-green"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-euro-gray">{job.customerName}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(job)}`}>
              {getStatusLabel(job)}
            </span>
          </div>
          <p className="text-gray-600 text-sm flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {job.address}, {job.city}
          </p>
          <p className="text-gray-400 text-xs mt-1">{job.jobId}</p>
        </div>
        <div className="text-right">
          {job.depositAmount && (
            <p className="text-sm font-medium text-euro-gray">${Number(job.depositAmount).toLocaleString()}</p>
          )}
          {job.installDate && (
            <p className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
              <Calendar className="w-3 h-3" />
              {formatDate(job.installDate)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(job: Job) {
  if (job.cancelled) return 'bg-red-100 text-red-700';
  if (job.warrantyVisible) return 'bg-green-100 text-green-700';
  if (job.finalStatus === 'paid' || job.finalPaymentReceived) return 'bg-green-100 text-green-700';
  if (job.installCompleted) return 'bg-yellow-100 text-yellow-700';
  if (job.installStarted) return 'bg-orange-100 text-orange-700';
  if (job.installScheduled) return 'bg-blue-100 text-blue-700';
  if (job.deliveryCompleted) return 'bg-purple-100 text-purple-700';
  if (job.deliveryScheduled) return 'bg-blue-100 text-blue-700';
  if (job.materialsOrdered) return 'bg-cyan-100 text-cyan-700';
  if (job.depositStatus === 'paid' || job.depositReceived) return 'bg-green-100 text-green-700';
  return 'bg-yellow-100 text-yellow-700';
}

function getStatusLabel(job: Job) {
  if (job.cancelled) return 'Cancelled';
  if (job.warrantyVisible) return 'Complete';
  if (job.finalStatus === 'paid' || job.finalPaymentReceived) return 'Paid - Warranty Pending';
  if (job.installCompleted) return 'Awaiting Payment';
  if (job.installStarted) return 'Installing';
  if (job.installScheduled) return 'Install Scheduled';
  if (job.deliveryCompleted) return 'Ready for Install';
  if (job.deliveryScheduled) return 'Delivery Scheduled';
  if (job.materialsOrdered) return 'Materials Ordered';
  if (job.depositStatus === 'paid' || job.depositReceived) return 'Deposit Received';
  return 'Awaiting Deposit';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

function formatDateLong(dateStr: string): string {
  if (!dateStr) return 'TBD';
  try {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch { return dateStr; }
}

function getNextStepText(job: Job): string {
  if (job.finalStatus === 'paid' || job.finalPaymentReceived) {
    return 'Thank you! Your warranty documents are now available.';
  }
  if (job.installCompleted) {
    return 'Installation complete. Awaiting final payment to release warranty.';
  }
  if (job.installStarted) {
    return 'Installation is in progress.';
  }
  if (job.installScheduled && job.installDate) {
    return `Your installation is scheduled for ${formatDateLong(job.installDate)}.`;
  }
  if (job.deliveryCompleted) {
    return 'Materials delivered. We will contact you to schedule installation.';
  }
  if (job.deliveryScheduled && job.deliveryDate) {
    return `Delivery scheduled for ${formatDateLong(job.deliveryDate)}.`;
  }
  if (job.materialsOrdered) {
    return 'Your materials have been ordered. We will contact you to schedule delivery.';
  }
  return 'Your project has been created. We will contact you shortly.';
}

// ===========================================
// JOB DETAIL MODAL
// ===========================================

function JobDetailModal({ job, onClose, onUpdate }: {
  job: Job;
  onClose: () => void;
  onUpdate: (job: Job) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [sendingSMS, setSendingSMS] = useState<string | null>(null);
  const [formData, setFormData] = useState(job);
  const [expandedSection, setExpandedSection] = useState('status');
  const [showConfirmDialog, setShowConfirmDialog] = useState<{ action: string; message: string } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'delivery' | 'install' | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [generatingWarranty, setGeneratingWarranty] = useState(false);

  // Auto-save function
  const saveToServer = async (data: Job) => {
    setSaving(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        onUpdate(result.job);
        setFormData(result.job);
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
    setSaving(false);
  };

  // Toggle status with auto-save and cascade rollback
  const toggleStatus = async (statusKey: string, dateValue?: string) => {
    let newData = { ...formData };
    const isCurrentlySet = getStatusValue(formData, statusKey);

    if (isCurrentlySet) {
      // Rolling back - cascade clear all later steps
      newData = cascadeRollback(newData, statusKey);
    } else {
      // Setting new status
      newData = setStatusOn(newData, statusKey, dateValue);
    }

    // Update next step text
    newData.nextStepText = getNextStepText(newData);

    await saveToServer(newData);
  };

  const getStatusValue = (data: Job, key: string): boolean => {
    switch (key) {
      case 'materialsOrdered': return data.materialsOrdered;
      case 'deliveryScheduled': return data.deliveryScheduled;
      case 'deliveryCompleted': return data.deliveryCompleted;
      case 'installScheduled': return data.installScheduled;
      case 'installStarted': return data.installStarted;
      case 'installCompleted': return data.installCompleted;
      case 'finalPayment': return data.finalStatus === 'paid';
      default: return false;
    }
  };

  const setStatusOn = (data: Job, key: string, dateValue?: string): Job => {
    const now = new Date().toISOString();
    switch (key) {
      case 'materialsOrdered':
        return { ...data, materialsOrdered: true, materialsOrderedDate: now };
      case 'deliveryScheduled':
        return { ...data, deliveryScheduled: true, deliveryDate: dateValue || '' };
      case 'deliveryCompleted':
        return { ...data, deliveryCompleted: true, deliveryCompletedDate: now };
      case 'installScheduled':
        return { ...data, installScheduled: true, installDate: dateValue || '' };
      case 'installStarted':
        return { ...data, installStarted: true, installStartedTime: now };
      case 'installCompleted':
        return { ...data, installCompleted: true, installCompletedDate: now };
      case 'finalPayment':
        return { ...data, finalStatus: 'paid', finalPaymentReceived: true, finalPaymentDate: now };
      default:
        return data;
    }
  };

  const cascadeRollback = (data: Job, fromKey: string): Job => {
    let newData = { ...data };
    const rollbackOrder = ['materialsOrdered', 'deliveryScheduled', 'deliveryCompleted', 'installScheduled', 'installStarted', 'installCompleted', 'finalPayment'];
    const startIndex = rollbackOrder.indexOf(fromKey);

    for (let i = startIndex; i < rollbackOrder.length; i++) {
      const key = rollbackOrder[i];
      switch (key) {
        case 'materialsOrdered':
          newData.materialsOrdered = false;
          newData.materialsOrderedDate = '';
          break;
        case 'deliveryScheduled':
          newData.deliveryScheduled = false;
          newData.deliveryDate = '';
          break;
        case 'deliveryCompleted':
          newData.deliveryCompleted = false;
          newData.deliveryCompletedDate = '';
          break;
        case 'installScheduled':
          newData.installScheduled = false;
          newData.installDate = '';
          break;
        case 'installStarted':
          newData.installStarted = false;
          newData.installStartedTime = '';
          break;
        case 'installCompleted':
          newData.installCompleted = false;
          newData.installCompletedDate = '';
          break;
        case 'finalPayment':
          newData.finalStatus = 'pending';
          newData.finalPaymentReceived = false;
          newData.finalPaymentDate = '';
          newData.warrantyVisible = false;
          break;
      }
    }
    return newData;
  };

  const handleFinalPaymentClick = () => {
    const isCurrentlyPaid = formData.finalStatus === 'paid';
    setShowConfirmDialog({
      action: 'finalPayment',
      message: isCurrentlyPaid 
        ? 'Are you sure you want to mark final payment as NOT received? This will also hide the warranty.'
        : 'Mark final payment as received? This will automatically generate the warranty certificate.'
    });
  };

  const confirmAction = async () => {
    if (showConfirmDialog?.action === 'finalPayment') {
      const isCurrentlyPaid = formData.finalStatus === 'paid';
      
      if (!isCurrentlyPaid) {
        // Setting payment as received - toggle status then generate warranty
        await toggleStatus('finalPayment');
        
        // Auto-generate warranty
        setGeneratingWarranty(true);
        try {
          const res = await fetch('/api/warranty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: job.jobId }),
          });
          
          if (res.ok) {
            const data = await res.json();
            // Update form data with warranty info
            setFormData(prev => ({
              ...prev,
              warrantyFileId: data.fileId,
              warrantyLink: data.viewLink,
              warrantyVisible: true,
            }));
            onUpdate({
              ...formData,
              finalStatus: 'paid',
              finalPaymentReceived: true,
              warrantyFileId: data.fileId,
              warrantyLink: data.viewLink,
              warrantyVisible: true,
            });
          } else {
            const error = await res.json();
            alert(`Warranty generation failed: ${error.error}`);
          }
        } catch (err) {
          alert('Failed to generate warranty');
        }
        setGeneratingWarranty(false);
      } else {
        // Removing payment - just toggle
        await toggleStatus('finalPayment');
      }
    }
    setShowConfirmDialog(null);
  };

  const handleSendSMS = async (trigger: string) => {
    setSendingSMS(trigger);
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.jobId, trigger }),
      });
      const data = await res.json();
      if (data.success) alert('SMS sent successfully!');
      else alert(`SMS failed: ${data.error}`);
    } catch {
      alert('Failed to send SMS');
    }
    setSendingSMS(null);
  };

  // For non-status fields, update locally then save
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveFields = async () => {
    await saveToServer(formData);
  };

  const statusLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/t/${job.token}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl my-8 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-euro-gray text-white p-4 rounded-t-xl flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-lg">{formData.customerName}</h2>
            <p className="text-sm text-gray-300">{formData.address}, {formData.city}</p>
          </div>
          <div className="flex items-center gap-2">
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status Link */}
          <div className="bg-euro-green/10 rounded-lg p-3 flex items-center justify-between">
            <div className="flex-1 truncate">
              <p className="text-xs text-gray-500">Customer Status Link</p>
              <p className="text-sm text-euro-gray truncate">{statusLink}</p>
            </div>
            <a href={statusLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-euro-green text-white rounded-lg hover:bg-euro-green-dark">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Status Buttons - Auto Save with SMS */}
          <Section title="Quick Status Updates" icon={<CheckCircle className="w-4 h-4" />} expanded={expandedSection === 'status'} onToggle={() => setExpandedSection(expandedSection === 'status' ? '' : 'status')}>
            <p className="text-xs text-gray-500 mb-3">Click to toggle status. Changes save automatically. Click again to undo.</p>
            <div className="space-y-3">
              {/* Materials Ordered */}
              <div className="flex items-center gap-2">
                <StatusButton
                  label="Materials Ordered"
                  done={formData.materialsOrdered}
                  onClick={() => toggleStatus('materialsOrdered')}
                  icon={<Package className="w-4 h-4" />}
                  saving={saving}
                  className="flex-1"
                />
                <button
                  onClick={() => handleSendSMS('materials_ordered')}
                  disabled={sendingSMS !== null || !formData.materialsOrdered}
                  className="px-3 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send SMS Update"
                >
                  {sendingSMS === 'materials_ordered' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>

              {/* Delivery Scheduled */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <StatusButton
                    label="Delivery Scheduled"
                    done={formData.deliveryScheduled}
                    onClick={() => {
                      if (formData.deliveryScheduled) {
                        toggleStatus('deliveryScheduled');
                      } else {
                        setShowDatePicker('delivery');
                      }
                    }}
                    icon={<Truck className="w-4 h-4" />}
                    saving={saving}
                    className="flex-1"
                  />
                  {formData.deliveryScheduled && formData.deliveryDate && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {formatDateShort(formData.deliveryDate)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleSendSMS('delivery_scheduled')}
                  disabled={sendingSMS !== null || !formData.deliveryScheduled}
                  className="px-3 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send SMS Update"
                >
                  {sendingSMS === 'delivery_scheduled' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>

              {/* Delivery Completed */}
              <div className="flex items-center gap-2">
                <StatusButton
                  label="Delivery Completed"
                  done={formData.deliveryCompleted}
                  onClick={() => toggleStatus('deliveryCompleted')}
                  icon={<Truck className="w-4 h-4" />}
                  saving={saving}
                  className="flex-1"
                />
                <button
                  onClick={() => handleSendSMS('delivery_completed')}
                  disabled={sendingSMS !== null || !formData.deliveryCompleted}
                  className="px-3 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send SMS Update"
                >
                  {sendingSMS === 'delivery_completed' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>

              {/* Install Scheduled */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <StatusButton
                    label="Install Scheduled"
                    done={formData.installScheduled}
                    onClick={() => {
                      if (formData.installScheduled) {
                        toggleStatus('installScheduled');
                      } else {
                        setShowDatePicker('install');
                      }
                    }}
                    icon={<Wrench className="w-4 h-4" />}
                    saving={saving}
                    className="flex-1"
                  />
                  {formData.installScheduled && formData.installDate && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {formatDateShort(formData.installDate)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleSendSMS('install_scheduled')}
                  disabled={sendingSMS !== null || !formData.installScheduled}
                  className="px-3 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send SMS Update"
                >
                  {sendingSMS === 'install_scheduled' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>

              {/* Install Started */}
              <div className="flex items-center gap-2">
                <StatusButton
                  label="Install Started"
                  done={formData.installStarted}
                  onClick={() => toggleStatus('installStarted')}
                  icon={<Wrench className="w-4 h-4" />}
                  saving={saving}
                  className="flex-1"
                />
                <button
                  onClick={() => handleSendSMS('install_started')}
                  disabled={sendingSMS !== null || !formData.installStarted}
                  className="px-3 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send SMS Update"
                >
                  {sendingSMS === 'install_started' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>

              {/* Install Completed - Shows payment method dialog when toggling ON */}
              <div className="flex items-center gap-2">
                <StatusButton
                  label="Install Completed"
                  done={formData.installCompleted}
                  onClick={() => {
                    if (formData.installCompleted) {
                      // Toggling OFF - just rollback
                      toggleStatus('installCompleted');
                    } else {
                      // Toggling ON - show payment method dialog first
                      setShowPaymentMethodDialog(true);
                    }
                  }}
                  icon={<CheckCircle className="w-4 h-4" />}
                  saving={saving}
                  className="flex-1"
                />
                <button
                  onClick={() => handleSendSMS('install_completed')}
                  disabled={sendingSMS !== null || !formData.installCompleted}
                  className="px-3 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send SMS Update"
                >
                  {sendingSMS === 'install_completed' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>

              {/* Payment Method Display */}
              {formData.paymentMethod && formData.installCompleted && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <span className="text-blue-700 font-medium">Payment Method: </span>
                  <span className="text-blue-800">
                    {formData.paymentMethod === 'online' && 'Online Payment'}
                    {formData.paymentMethod === 'etransfer' && 'E-Transfer'}
                    {formData.paymentMethod === 'cash' && 'Cash'}
                  </span>
                  <button
                    onClick={() => setShowPaymentMethodDialog(true)}
                    className="ml-2 text-blue-600 hover:underline text-xs"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Final Payment - Auto generates warranty */}
              <StatusButton
                label={generatingWarranty ? "Generating Warranty..." : "Final Payment Received"}
                done={formData.finalStatus === 'paid'}
                onClick={handleFinalPaymentClick}
                icon={generatingWarranty ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                saving={saving || generatingWarranty}
                highlight
              />
            </div>
          </Section>

          {/* Customer Info */}
          <Section title="Customer Info" icon={<User className="w-4 h-4" />} expanded={expandedSection === 'customer'} onToggle={() => setExpandedSection(expandedSection === 'customer' ? '' : 'customer')}>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Name" value={formData.customerName} onChange={v => updateField('customerName', v)} />
              <Input label="Phone" value={formData.customerPhone} onChange={v => updateField('customerPhone', v)} />
              <Input label="Email" value={formData.customerEmail} onChange={v => updateField('customerEmail', v)} className="col-span-2" />
              <Input label="Address" value={formData.address} onChange={v => updateField('address', v)} className="col-span-2" />
              <Input label="City" value={formData.city} onChange={v => updateField('city', v)} />
              <Input label="Postal Code" value={formData.postalCode} onChange={v => updateField('postalCode', v)} />
            </div>
            <button onClick={saveFields} className="mt-3 px-4 py-2 bg-euro-green text-white rounded-lg text-sm hover:bg-euro-green-dark">Save Customer Info</button>
          </Section>

          {/* Payments */}
          <Section title="Payments" icon={<CreditCard className="w-4 h-4" />} expanded={expandedSection === 'payments'} onToggle={() => setExpandedSection(expandedSection === 'payments' ? '' : 'payments')}>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm text-gray-700 mb-2">Deposit</p>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Status"
                    value={formData.depositStatus}
                    onChange={v => updateField('depositStatus', v)}
                    options={[{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }]}
                  />
                  <Input label="Amount" value={formData.depositAmount} onChange={v => updateField('depositAmount', v)} placeholder="5000" />
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm text-gray-700 mb-2">Final Balance</p>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Status"
                    value={formData.finalStatus}
                    onChange={v => updateField('finalStatus', v)}
                    options={[{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }]}
                  />
                  <Input label="Amount" value={formData.finalAmount} onChange={v => updateField('finalAmount', v)} placeholder="8500" />
                </div>
              </div>
            </div>
            <button onClick={saveFields} className="mt-3 px-4 py-2 bg-euro-green text-white rounded-lg text-sm hover:bg-euro-green-dark">Save Payments</button>
          </Section>

          {/* Project Details */}
          <Section title="Project Details" icon={<Palette className="w-4 h-4" />} expanded={expandedSection === 'details'} onToggle={() => setExpandedSection(expandedSection === 'details' ? '' : 'details')}>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Material Style" value={formData.materialStyle} onChange={v => updateField('materialStyle', v)} placeholder="e.g. Monterrei" />
              <Input label="Colour" value={formData.materialColour} onChange={v => updateField('materialColour', v)} placeholder="e.g. Dark Brown" />
              <Input label="Crew Lead" value={formData.supervisorName} onChange={v => updateField('supervisorName', v)} placeholder="Name" />
              <Input label="Install Date" type="date" value={formData.installDate?.split('T')[0] || ''} onChange={v => updateField('installDate', v)} />
            </div>
            <button onClick={saveFields} className="mt-3 px-4 py-2 bg-euro-green text-white rounded-lg text-sm hover:bg-euro-green-dark">Save Details</button>
          </Section>

          {/* Contract Upload */}
          <Section title="Contract" icon={<FileText className="w-4 h-4" />} expanded={expandedSection === 'contract'} onToggle={() => setExpandedSection(expandedSection === 'contract' ? '' : 'contract')}>
            <div className="space-y-3">
              {formData.contractFileName ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{formData.contractFileName}</p>
                    <p className="text-xs text-green-600">Contract uploaded</p>
                  </div>
                  <a 
                    href={`https://drive.google.com/file/d/${formData.contractFileId}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-green-100 rounded-lg hover:bg-green-200"
                  >
                    <ExternalLink className="w-4 h-4 text-green-700" />
                  </a>
                </div>
              ) : (
                <FileUpload
                  label="Upload Contract (Photo or PDF)"
                  jobId={job.jobId}
                  fileType="contract"
                  onUploadComplete={(url) => {
                    setFormData(prev => ({ ...prev, contractFileName: 'Contract uploaded' }));
                    onUpdate({ ...formData, contractFileName: 'Contract uploaded' });
                  }}
                />
              )}
            </div>
          </Section>

          {/* Photos */}
          <Section title="Photos" icon={<Camera className="w-4 h-4" />} expanded={expandedSection === 'photos'} onToggle={() => setExpandedSection(expandedSection === 'photos' ? '' : 'photos')}>
            <div className="space-y-4">
              {/* Delivery Photo */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Materials Delivered Photo</label>
                {formData.deliveryPhoto ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <img src={formData.deliveryPhoto} alt="Delivery" className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm text-green-800">Photo uploaded</p>
                    </div>
                    <button
                      onClick={() => { updateField('deliveryPhoto', ''); saveFields(); }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    label="Upload Delivery Photo"
                    jobId={job.jobId}
                    fileType="delivery"
                    onUploadComplete={(url) => {
                      setFormData(prev => ({ ...prev, deliveryPhoto: url }));
                      onUpdate({ ...formData, deliveryPhoto: url });
                    }}
                    accept="image/*"
                  />
                )}
              </div>

              {/* Installation Photo */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">During Installation Photo</label>
                {formData.installPhoto ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <img src={formData.installPhoto} alt="Installation" className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm text-green-800">Photo uploaded</p>
                    </div>
                    <button
                      onClick={() => { updateField('installPhoto', ''); saveFields(); }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    label="Upload Installation Photo"
                    jobId={job.jobId}
                    fileType="install"
                    onUploadComplete={(url) => {
                      setFormData(prev => ({ ...prev, installPhoto: url }));
                      onUpdate({ ...formData, installPhoto: url });
                    }}
                    accept="image/*"
                  />
                )}
              </div>

              {/* Completed Photo */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Completed Roof Photo</label>
                {formData.completedPhoto ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <img src={formData.completedPhoto} alt="Completed" className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm text-green-800">Photo uploaded</p>
                    </div>
                    <button
                      onClick={() => { updateField('completedPhoto', ''); saveFields(); }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    label="Upload Completed Photo"
                    jobId={job.jobId}
                    fileType="completed"
                    onUploadComplete={(url) => {
                      setFormData(prev => ({ ...prev, completedPhoto: url }));
                      onUpdate({ ...formData, completedPhoto: url });
                    }}
                    accept="image/*"
                  />
                )}
              </div>
            </div>
          </Section>

          {/* Warranty */}
          <Section title="Warranty" icon={<FileText className="w-4 h-4" />} expanded={expandedSection === 'warranty'} onToggle={() => setExpandedSection(expandedSection === 'warranty' ? '' : 'warranty')}>
            <div className="space-y-4">
              {formData.warrantyLink ? (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Warranty Certificate Generated</p>
                      <p className="text-xs text-green-600">Generated on {formatDateShort(formData.warrantyGeneratedDate)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={formData.warrantyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-center text-sm hover:bg-green-200"
                    >
                      View Warranty
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">
                    {formData.finalStatus === 'paid' 
                      ? 'Final payment received. You can generate the warranty certificate.'
                      : 'Warranty will be auto-generated when final payment is received.'
                    }
                  </p>
                  {formData.finalStatus === 'paid' && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/warranty', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jobId: job.jobId }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            setFormData(prev => ({ 
                              ...prev, 
                              warrantyLink: data.viewLink,
                              warrantyVisible: true,
                              warrantyGeneratedDate: new Date().toISOString()
                            }));
                            alert('Warranty generated successfully!');
                          } else {
                            alert('Failed to generate warranty: ' + data.error);
                          }
                        } catch (err) {
                          alert('Error generating warranty');
                        }
                      }}
                      className="w-full px-4 py-2 bg-euro-green text-white rounded-lg hover:bg-euro-green-dark"
                    >
                      Generate Warranty Certificate
                    </button>
                  )}
                </div>
              )}
              
              <Checkbox 
                label="Show Warranty on Customer Page" 
                checked={formData.warrantyVisible} 
                onChange={v => { updateField('warrantyVisible', v); saveFields(); }} 
              />
            </div>
          </Section>

          {/* Invoice */}
          <Section title="Invoice" icon={<FileText className="w-4 h-4" />} expanded={expandedSection === 'invoice'} onToggle={() => setExpandedSection(expandedSection === 'invoice' ? '' : 'invoice')}>
            <div className="space-y-3">
              <Input label="Invoice URL" value={formData.invoiceLink} onChange={v => updateField('invoiceLink', v)} placeholder="Google Drive link to invoice PDF" />
              <Checkbox label="Show Invoice on Customer Page" checked={formData.invoiceVisible} onChange={v => updateField('invoiceVisible', v)} />
            </div>
            <button onClick={saveFields} className="mt-3 px-4 py-2 bg-euro-green text-white rounded-lg text-sm hover:bg-euro-green-dark">Save Invoice</button>
          </Section>

          {/* Notes */}
          <Section title="Dispatcher Notes" icon={<MessageSquare className="w-4 h-4" />} expanded={expandedSection === 'notes'} onToggle={() => setExpandedSection(expandedSection === 'notes' ? '' : 'notes')}>
            <textarea
              value={formData.dispatcherNotes}
              onChange={(e) => updateField('dispatcherNotes', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:border-euro-green outline-none h-24 resize-none"
              placeholder="Internal notes (not visible to customer)"
            />
            <button onClick={saveFields} className="mt-3 px-4 py-2 bg-euro-green text-white rounded-lg text-sm hover:bg-euro-green-dark">Save Notes</button>
          </Section>

          {/* Review Request */}
          <Section title="Review Request" icon={<Star className="w-4 h-4" />} expanded={expandedSection === 'review'} onToggle={() => setExpandedSection(expandedSection === 'review' ? '' : 'review')}>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Send a review request to this customer after the project is complete.</p>
              <button
                onClick={() => handleSendSMS('review_request')}
                disabled={sendingSMS !== null || !formData.installCompleted || formData.finalStatus !== 'paid'}
                className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingSMS === 'review_request' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Review Request SMS
              </button>
              {(!formData.installCompleted || formData.finalStatus !== 'paid') && (
                <p className="text-xs text-gray-500">Available after installation complete and final payment received.</p>
              )}
            </div>
          </Section>

          {/* Cancel Job */}
          <div className="border-t pt-4">
            <Checkbox
              label="Cancel Job"
              checked={formData.cancelled}
              onChange={v => {
                updateField('cancelled', v);
                saveFields();
              }}
            />
            <p className="text-xs text-gray-500 ml-6">Cancelled jobs are hidden from the customer</p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg text-euro-gray mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-6">{showConfirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-euro-green text-white rounded-lg hover:bg-euro-green-dark"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Dialog */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg text-euro-gray mb-2">
              {showDatePicker === 'delivery' ? 'Select Delivery Date' : 'Select Installation Date'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {showDatePicker === 'delivery' 
                ? 'Choose the date when materials will be delivered.'
                : 'Choose the date when installation will begin.'
              }
            </p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border rounded-lg focus:border-euro-green outline-none text-lg mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDatePicker(null);
                  setSelectedDate('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedDate) {
                    if (showDatePicker === 'delivery') {
                      toggleStatus('deliveryScheduled', selectedDate);
                    } else {
                      toggleStatus('installScheduled', selectedDate);
                    }
                    setShowDatePicker(null);
                    setSelectedDate('');
                  }
                }}
                disabled={!selectedDate}
                className="px-4 py-2 bg-euro-green text-white rounded-lg hover:bg-euro-green-dark disabled:opacity-50"
              >
                Confirm Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Dialog */}
      {showPaymentMethodDialog && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-lg text-euro-gray mb-2">Select Payment Method</h3>
            <p className="text-gray-600 text-sm mb-4">
              How will the customer pay their remaining balance?
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={async () => {
                  await updateField('paymentMethod', 'online');
                  await toggleStatus('installCompleted');
                  await saveToServer({ ...formData, paymentMethod: 'online', installCompleted: true, installCompletedDate: new Date().toISOString() });
                  setShowPaymentMethodDialog(false);
                }}
                className="w-full p-4 border-2 rounded-lg text-left hover:border-euro-green hover:bg-euro-green/5 transition-colors"
              >
                <p className="font-medium text-euro-gray">💳 Online Payment</p>
                <p className="text-sm text-gray-500">Customer will see "Online payment available soon"</p>
              </button>
              
              <button
                onClick={async () => {
                  await updateField('paymentMethod', 'etransfer');
                  await toggleStatus('installCompleted');
                  await saveToServer({ ...formData, paymentMethod: 'etransfer', installCompleted: true, installCompletedDate: new Date().toISOString() });
                  setShowPaymentMethodDialog(false);
                }}
                className="w-full p-4 border-2 rounded-lg text-left hover:border-euro-green hover:bg-euro-green/5 transition-colors"
              >
                <p className="font-medium text-euro-gray">📧 E-Transfer</p>
                <p className="text-sm text-gray-500">Customer will see: Send to info@eurometalroofing.ca</p>
              </button>
              
              <button
                onClick={async () => {
                  await updateField('paymentMethod', 'cash');
                  await toggleStatus('installCompleted');
                  await saveToServer({ ...formData, paymentMethod: 'cash', installCompleted: true, installCompletedDate: new Date().toISOString() });
                  setShowPaymentMethodDialog(false);
                }}
                className="w-full p-4 border-2 rounded-lg text-left hover:border-euro-green hover:bg-euro-green/5 transition-colors"
              >
                <p className="font-medium text-euro-gray">💵 Cash</p>
                <p className="text-sm text-gray-500">Customer will see: Project manager will collect payment</p>
              </button>
            </div>
            
            <button
              onClick={() => setShowPaymentMethodDialog(false)}
              className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================
// NEW JOB MODAL
// ===========================================

function NewJobModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (job: Job) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    city: '',
    postalCode: '',
    depositAmount: '',
    finalAmount: '',
    materialStyle: '',
    materialColour: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        onCreated(data.job);
      }
    } catch (err) {
      console.error('Failed to create job:', err);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-euro-gray text-white p-4 rounded-t-xl flex items-center justify-between sticky top-0">
          <h2 className="font-bold">New Job</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input label="Customer Name *" value={formData.customerName} onChange={v => setFormData({...formData, customerName: v})} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone *" value={formData.customerPhone} onChange={v => setFormData({...formData, customerPhone: v})} required />
            <Input label="Email" value={formData.customerEmail} onChange={v => setFormData({...formData, customerEmail: v})} />
          </div>
          <Input label="Address *" value={formData.address} onChange={v => setFormData({...formData, address: v})} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City *" value={formData.city} onChange={v => setFormData({...formData, city: v})} required />
            <Input label="Postal Code" value={formData.postalCode} onChange={v => setFormData({...formData, postalCode: v})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Deposit Amount" value={formData.depositAmount} onChange={v => setFormData({...formData, depositAmount: v})} placeholder="5000" />
            <Input label="Final Amount" value={formData.finalAmount} onChange={v => setFormData({...formData, finalAmount: v})} placeholder="8500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Material Style" value={formData.materialStyle} onChange={v => setFormData({...formData, materialStyle: v})} placeholder="Monterrei" />
            <Input label="Colour" value={formData.materialColour} onChange={v => setFormData({...formData, materialColour: v})} placeholder="Dark Brown" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-euro-green text-white rounded-lg hover:bg-euro-green-dark flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===========================================
// HELPER COMPONENTS
// ===========================================

function Section({ title, icon, children, expanded, onToggle }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 font-medium text-euro-gray">
          {icon}
          {title}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {expanded && <div className="p-4">{children}</div>}
    </div>
  );
}

function StatusButton({ label, done, onClick, icon, saving, className = '', highlight = false }: {
  label: string;
  done: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  saving: boolean;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors disabled:opacity-50 ${
        done
          ? 'bg-green-50 border-green-200 text-green-700'
          : highlight
          ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-400 hover:bg-yellow-100 text-yellow-800'
          : 'bg-white border-gray-200 hover:border-euro-green hover:bg-euro-green/5 text-gray-700'
      } ${className}`}
    >
      {done ? <CheckCircle className="w-5 h-5 text-green-600" /> : icon}
      <span className="text-sm font-medium">{label}</span>
      {done && <span className="text-xs ml-auto">✓</span>}
    </button>
  );
}

function Input({ label, value, onChange, type = 'text', className = '', placeholder = '', required = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border rounded-lg focus:border-euro-green outline-none text-sm"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:border-euro-green outline-none text-sm bg-white"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({ label, checked, onChange, className = '' }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-gray-300 text-euro-green focus:ring-euro-green"
      />
      <span className="text-sm text-euro-gray">{label}</span>
    </label>
  );
}

function FileUpload({ label, jobId, fileType, onUploadComplete, accept = '*' }: {
  label: string;
  jobId: string;
  fileType: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobId', jobId);
      formData.append('fileType', fileType);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUploadComplete(data.viewUrl || data.viewLink);
      } else {
        const error = await res.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (err) {
      alert('Upload failed');
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        dragOver ? 'border-euro-green bg-euro-green/5' : 'border-gray-300 hover:border-euro-green'
      }`}
    >
      {uploading ? (
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Uploading...</span>
        </div>
      ) : (
        <label className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-xs text-gray-400">Click or drag file here</span>
          </div>
          <input
            type="file"
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
