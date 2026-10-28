'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CreditCard, AlertCircle, ShieldAlert, KeyRound, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/utils';

interface RazorpayCheckoutModalProps {
  bookingId: string;
  bookingReference: string;
  amount: number;
  serviceTitle: string;
  onSuccess: (result: unknown) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export function RazorpayCheckoutModal({
  bookingId,
  bookingReference,
  amount,
  serviceTitle,
  onSuccess,
  onClose,
}: RazorpayCheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfiguredInfo, setUnconfiguredInfo] = useState<{
    message: string;
    notice?: string;
  } | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);
    setUnconfiguredInfo(null);

    try {
      // 1. Request server-side order creation
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment order');
      }

      // Check if credentials are placeholders
      if (!data.isConfigured) {
        setUnconfiguredInfo({
          message: data.notice || 'Razorpay keys are in test placeholder mode.',
          notice: data.notice,
        });
        setLoading(false);
        return;
      }

      // 2. Load official Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay secure checkout SDK.');
      }

      // 3. Configure Razorpay options
      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'LordsOne Campus Services',
        description: `Reservation Fee: ${serviceTitle}`,
        order_id: data.order.id,
        prefill: {
          name: 'Campus Student',
          email: 'student@liet.ac.in',
          contact: '9876543210',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          // Cryptographically verify payment on server
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                booking_id: bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Signature verification failed');
            }

            onSuccess(verifyData);
          } catch (verifyErr: unknown) {
            const e = verifyErr as Error;
            setError(e.message);
          }
        },
        theme: {
          color: '#2563EB',
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      razorpayInstance.on('payment.failed', function (resp: any) {
        setError(`Payment declined: ${resp.error.description || 'Unknown error'}`);
      });

      razorpayInstance.open();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-sm">
                Razorpay Checkout
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {bookingReference}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Order Details */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-5 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Facility / Service</span>
            <span className="font-semibold text-navy-900 truncate max-w-[200px]">
              {serviceTitle}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Payment Gateway</span>
            <span className="font-semibold text-navy-900">Razorpay (INR)</span>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
            <span className="text-xs font-bold text-navy-900">Total Payable</span>
            <span className="text-base font-extrabold text-brand-600">
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        {/* Unconfigured Notice (If keys are in placeholder mode) */}
        {unconfiguredInfo && (
          <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Razorpay Test Credentials Required</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              The application backend and checkout pipeline are completely integrated and waiting for your Razorpay test credentials.
            </p>
            <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200/80 font-mono text-[10px] text-slate-700 space-y-1">
              <div>RAZORPAY_KEY_ID=rzp_test_...</div>
              <div>RAZORPAY_KEY_SECRET=...</div>
            </div>
            <p className="text-[10px] text-slate-500">
              Add your test keys to <code className="bg-amber-100 px-1 py-0.5 rounded">.env.local</code> to activate live test modal dialogs.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5">
          <Button
            onClick={handleInitiatePayment}
            isLoading={loading}
            className="w-full h-11 text-sm font-bold gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay {formatCurrency(amount)} with Razorpay</span>
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-xs text-slate-500"
          >
            Cancel and Return
          </Button>
        </div>
      </div>
    </div>
  );
}
