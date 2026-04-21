import Stripe from 'stripe';

let client: Stripe | null = null;
export const stripe = (): Stripe => {
  if (!client) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) throw new Error('STRIPE_SECRET_KEY is not set');
    client = new Stripe(secret, { apiVersion: '2024-10-28.acacia' });
  }
  return client;
};

export const createExpressAccount = async (
  params: { email: string | null; country: string },
): Promise<Stripe.Account> =>
  stripe().accounts.create({
    type: 'express',
    country: params.country,
    email: params.email ?? undefined,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
  });

export const createOnboardingLink = async (
  accountId: string,
  refreshUrl: string,
  returnUrl: string,
): Promise<Stripe.AccountLink> =>
  stripe().accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

export const chargeLeadFee = async (
  accountId: string,
  amountCents: number,
  metadata: Record<string, string>,
): Promise<Stripe.PaymentIntent> =>
  stripe().paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    on_behalf_of: accountId,
    transfer_data: { destination: accountId, amount: 0 },
    metadata,
  });
