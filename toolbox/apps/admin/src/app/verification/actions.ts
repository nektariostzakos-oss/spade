'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function decideVerification(
  proId: string,
  decision: 'approve' | 'reject',
): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  const admin = await prisma.user.findFirst({ where: { clerkId: userId, role: 'ADMIN' } });
  if (!admin) throw new Error('Forbidden');
  const status = decision === 'approve' ? 'VERIFIED' : 'REJECTED';
  await prisma.proProfile.update({
    where: { id: proId },
    data: { licenseStatus: status, insuranceStatus: status },
  });
  revalidatePath('/verification');
}
