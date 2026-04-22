import { loadPayments } from "./settings";

/**
 * Tiny Stripe Checkout wrapper. We don't ship the @stripe/stripe SDK to keep
 * the bundle lean — instead we hit the REST endpoint directly. Works for the
 * common case of redirecting a shop order to Stripe-hosted Checkout.
 *
 * Returns the hosted checkout URL on success, null if Stripe isn't configured.
 */
export async function createCheckoutSession(input: {
  lineItems: Array<{ name: string; amount: number; qty: number }>;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  orderId: string;
}): Promise<{ url: string; sessionId: string } | null> {
  const pay = await loadPayments();
  if (!pay.stripeSecretKey || !pay.stripeSecretKey.startsWith("sk_")) {
    return null;
  }
  const currency = (pay.currency || "gbp").toLowerCase();

  // application/x-www-form-urlencoded — Stripe REST API expects this for POST.
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", input.successUrl);
  params.set("cancel_url", input.cancelUrl);
  params.set("customer_email", input.customerEmail);
  params.set("metadata[order_id]", input.orderId);
  input.lineItems.forEach((li, i) => {
    params.set(`line_items[${i}][quantity]`, String(Math.max(1, Math.floor(li.qty))));
    params.set(`line_items[${i}][price_data][currency]`, currency);
    params.set(`line_items[${i}][price_data][product_data][name]`, li.name.slice(0, 250));
    // Stripe wants the smallest currency unit (pence / cents).
    params.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(li.amount * 100)));
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pay.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Stripe: ${res.status} ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { id: string; url: string };
  return { url: data.url, sessionId: data.id };
}
