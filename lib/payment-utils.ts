export interface PaymentSession {
  id: string;
  courseId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  gateway: 'stripe' | 'razorpay';
  createdAt: Date;
  completedAt?: Date;
}

export const createStripePaymentIntent = async (
  courseId: string,
  amount: number,
  userEmail: string
) => {
  const response = await fetch('/api/payments/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId, amount, userEmail }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return response.json();
};

export const createRazorpayOrder = async (
  courseId: string,
  amount: number,
  userEmail: string
) => {
  const response = await fetch('/api/payments/razorpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId, amount, userEmail }),
  });

  if (!response.ok) {
    throw new Error('Failed to create Razorpay order');
  }

  return response.json();
};

export const verifyRazorpayPayment = async (
  orderId: string,
  paymentId: string,
  signature: string
) => {
  const response = await fetch('/api/payments/razorpay/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, paymentId, signature }),
  });

  if (!response.ok) {
    throw new Error('Payment verification failed');
  }

  return response.json();
};
