'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader } from 'lucide-react';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
  price: number;
  onSuccess: (paymentId: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutModal({
  open,
  onOpenChange,
  courseId,
  courseName,
  price,
  onSuccess,
}: CheckoutModalProps) {
  const { user } = useAuth();
  const [gateway, setGateway] = useState<'stripe' | 'razorpay'>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!user) {
      setError('Please sign in to enroll');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (gateway === 'stripe') {
        await handleStripePayment();
      } else {
        await handleRazorpayPayment();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    // This is a simplified version. In production, use @stripe/react-stripe-js
    const response = await fetch('/api/payments/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        amount: price,
        userEmail: user?.email,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment');
    }

    const data = await response.json();
    
    // Redirect to Stripe checkout in production
    alert(`Payment Intent Created: ${data.paymentIntentId}\n\nIn production, you would be redirected to Stripe Checkout.`);
    onSuccess(data.paymentIntentId);
    onOpenChange(false);
  };

  const handleRazorpayPayment = async () => {
    const response = await fetch('/api/payments/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        amount: price,
        userEmail: user?.email,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    const data = await response.json();

    // Initialize Razorpay payment
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      description: `Enrollment in ${courseName}`,
      prefill: {
        email: user?.email,
      },
      handler: async (response: any) => {
        try {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/razorpay', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error('Payment verification failed');
          }

          onSuccess(response.razorpay_payment_id);
          onOpenChange(false);
        } catch (error) {
          setError('Payment verification failed');
        }
      },
      modal: {
        ondismiss: () => {
          setError('Payment cancelled');
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll in {courseName}</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method to complete the enrollment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg bg-card p-4 border border-border">
            <p className="text-lg font-semibold">
              Price: <span className="text-primary">${price}</span>
            </p>
          </div>

          <RadioGroup value={gateway} onValueChange={(value: any) => setGateway(value)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                  <div className="font-medium">Stripe</div>
                  <div className="text-xs text-muted-foreground">Credit/Debit Cards, Apple Pay, Google Pay</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer">
                <RadioGroupItem value="razorpay" id="razorpay" />
                <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                  <div className="font-medium">Razorpay</div>
                  <div className="text-xs text-muted-foreground">UPI, Cards, NetBanking, Wallets</div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {error && (
            <div className="flex gap-2 p-3 rounded-lg bg-red-950 border border-red-800 text-red-100">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handlePayment}
            disabled={loading || !user}
            className="w-full"
            size="lg"
          >
            {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Processing...' : `Pay $${price}`}
          </Button>

          {!user && (
            <p className="text-xs text-muted-foreground text-center">
              Please sign in to enroll in courses
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
