'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

/** Copies the subscriber emails on this page to the clipboard. */
export default function SubscriberActions({ emails, count }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(emails);
      setCopied(true);
      toast.success(`${count} email ${count === 1 ? 'address' : 'addresses'} copied.`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Your browser blocked clipboard access. Select the column and copy manually.');
    }
  }

  return (
    <button type="button" onClick={copy} className="btn btn-outline btn-sm shrink-0">
      {copied ? <Check className="h-3.5 w-3.5 text-teal-600" strokeWidth={2.8} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2.3} />}
      {copied ? 'Copied' : `Copy ${count} emails`}
    </button>
  );
}
