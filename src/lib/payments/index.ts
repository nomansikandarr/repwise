/**
 * Payments. v1 uses a mock provider that always succeeds (PLAN.md): no money
 * moves, but orders, fees and refunds are recorded for real. A real gateway
 * (e.g. Safepay) can implement PaymentProvider later without touching callers.
 */

export const PLATFORM_FEE_RATE = 0.1;

/** Splits a rupee amount into the platform fee (rounded) and the coach's net. */
export function splitFee(amount: number): { fee: number; net: number } {
  if (!Number.isInteger(amount) || amount < 0) throw new Error(`Invalid amount: ${amount}`);
  const fee = Math.round(amount * PLATFORM_FEE_RATE);
  return { fee, net: amount - fee };
}

export type ChargeRequest = { amount: number; clientId: string; idempotencyKey: string; description: string };
export type ChargeResult = { ok: true; reference: string } | { ok: false; error: string };

export interface PaymentProvider {
  charge(req: ChargeRequest): Promise<ChargeResult>;
  refund(reference: string): Promise<{ ok: boolean }>;
}

export const mockPaymentProvider: PaymentProvider = {
  async charge(req) {
    return { ok: true, reference: `mock_${req.idempotencyKey}` };
  },
  async refund() {
    return { ok: true };
  },
};

export const payments: PaymentProvider = mockPaymentProvider;
