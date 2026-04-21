import { prisma } from '@toolbox/db';
import { appError, err, ok, type Result } from '@toolbox/shared';
import type { AuthedUser } from '../plugins/auth';
import { chargeLeadFee } from './stripe.service';

export const inboxForPro = async (authed: AuthedUser) => {
  const pro = await prisma.proProfile.findFirst({
    where: { user: { clerkId: authed.clerkId } },
  });
  if (!pro) return err(appError('NOT_FOUND', 'No pro profile'));
  const leads = await prisma.lead.findMany({
    where: { proId: pro.id, status: { in: ['SENT', 'VIEWED', 'ACCEPTED'] } },
    include: { job: true },
    orderBy: { sentAt: 'desc' },
    take: 50,
  });
  return ok(leads);
};

export const markLeadViewed = async (authed: AuthedUser, leadId: string) => {
  const pro = await prisma.proProfile.findFirst({
    where: { user: { clerkId: authed.clerkId } },
  });
  if (!pro) return err(appError('NOT_FOUND', 'No pro profile'));
  const lead = await prisma.lead.findFirst({ where: { id: leadId, proId: pro.id } });
  if (!lead) return err(appError('NOT_FOUND', 'Lead not found'));
  if (lead.status !== 'SENT') return ok(lead);
  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { status: 'VIEWED' },
  });
  return ok(updated);
};

export const respondToLead = async (
  authed: AuthedUser,
  leadId: string,
  accept: boolean,
): Promise<Result<{ leadId: string; status: string; paymentIntentId: string | null }>> => {
  const pro = await prisma.proProfile.findFirst({
    where: { user: { clerkId: authed.clerkId } },
  });
  if (!pro) return err(appError('NOT_FOUND', 'No pro profile'));

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, proId: pro.id },
  });
  if (!lead) return err(appError('NOT_FOUND', 'Lead not found'));
  if (!['SENT', 'VIEWED'].includes(lead.status))
    return err(appError('CONFLICT', 'Lead already decided'));
  if (lead.expiresAt.getTime() < Date.now()) {
    await prisma.lead.update({ where: { id: leadId }, data: { status: 'EXPIRED' } });
    return err(appError('CONFLICT', 'Lead expired'));
  }

  if (!accept) {
    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'DECLINED', respondedAt: new Date() },
    });
    return ok({ leadId: updated.id, status: updated.status, paymentIntentId: null });
  }

  if (
    pro.licenseStatus !== 'VERIFIED' ||
    pro.insuranceStatus !== 'VERIFIED' ||
    !pro.stripeAccountId
  ) {
    return err(appError('PAYMENT_REQUIRED', 'Verification + payout setup required to accept leads'));
  }

  const pi = await chargeLeadFee(pro.stripeAccountId, lead.feeAmountCents, {
    leadId: lead.id,
    jobId: lead.jobId,
    proId: lead.proId,
  });

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: 'ACCEPTED',
      feeStatus: 'CHARGED',
      respondedAt: new Date(),
    },
  });
  return ok({ leadId: updated.id, status: updated.status, paymentIntentId: pi.id });
};
