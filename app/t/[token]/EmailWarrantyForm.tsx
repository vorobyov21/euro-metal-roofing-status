'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, RefreshCw } from 'lucide-react';

interface EmailWarrantyFormProps {
  jobId: string;
  customerEmail?: string;
}

export default function EmailWarrantyForm({ jobId, customerEmail }: EmailWarrantyFormProps) {
  const [email, setEmail] = useState(customerEmail || '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/warranty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send email');
      }
    } catch {
      setError('Failed to send email');
    }

    setSending(false);
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-800">Warranty sent to {email}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <p className="text-sm text-gray-600 mb-2">
        <Mail className="w-4 h-4 inline mr-1" />
        Want a copy of your warranty sent to your email?
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-3 py-2 border rounded-lg focus:border-euro-green outline-none text-sm"
        />
        <button
          type="submit"
          disabled={sending || !email}
          className="px-4 py-2 bg-euro-green text-white rounded-lg hover:bg-euro-green-dark disabled:opacity-50 flex items-center gap-2"
        >
          {sending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  );
}
