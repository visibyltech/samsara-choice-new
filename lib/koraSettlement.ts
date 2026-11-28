import {
  commitFirestoreUpdates,
  decodeFields,
  findFirestoreDocument,
  getFirestoreDocument,
} from './firestoreRest';

export async function settleKoraPayment(input: {
  reference: string;
  amount: number;
  currency: string;
}): Promise<{ alreadyProcessed: boolean }> {
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error('Kora payment amount is invalid.');
  const transactionDocument = await findFirestoreDocument('transactions', 'reference', input.reference);
  if (!transactionDocument) throw new Error('No Samsara transaction matches this Kora reference.');
  const transaction = decodeFields(transactionDocument.fields);
  if (transaction.gateway !== 'korapay') throw new Error('This transaction was not created through KoraPay.');
  if (transaction.status === 'verified') return { alreadyProcessed: true };
  if (transaction.status !== 'pending_verification') throw new Error('This transaction is not awaiting verification.');
  if (transaction.currency !== input.currency) throw new Error('Kora payment currency does not match the order.');
  if (input.amount + 0.01 < Number(transaction.amount)) throw new Error('Kora payment amount is below the amount due.');

  const orderDocument = await getFirestoreDocument('orders', String(transaction.orderId));
  if (!orderDocument) throw new Error('The order linked to this payment could not be found.');
  const order = decodeFields(orderDocument.fields);
  const creditedAmount = Math.min(Number(transaction.amount), Number(order.balanceRemaining || 0));
  if (creditedAmount <= 0) throw new Error('The linked order has no outstanding balance.');
  const amountPaid = Math.min(Number(order.totalAmount), Number(order.amountPaid || 0) + creditedAmount);
  const balanceRemaining = Math.max(0, Number(order.totalAmount) - amountPaid);
  const paidPercent = Number(order.totalAmount) > 0 ? (amountPaid / Number(order.totalAmount)) * 100 : 100;
  const settingsDocument = await getFirestoreDocument('settings', 'storeConfig');
  const settings = settingsDocument ? decodeFields(settingsDocument.fields) : {};
  const releaseThreshold = order.paymentMode === 'pay_small_small'
    ? Number(settings.pssReleaseThresholdPercent || 100)
    : 100;
  const canDispatch = paidPercent >= releaseThreshold || balanceRemaining <= 0.01;
  const now = new Date().toISOString();

  const updates: Array<{ document: any; fields: Record<string, any> }> = [
    {
      document: transactionDocument,
      fields: {
        status: 'verified',
        verifiedBy: 'korapay_webhook',
        updatedAt: { __timestamp: now },
      },
    },
    {
      document: orderDocument,
      fields: {
        amountPaid,
        balanceRemaining,
        status: balanceRemaining <= 0.01 ? 'paid' : 'deposit_paid',
        fulfilmentStatus: canDispatch ? 'eligible_for_dispatch' : 'locked_until_paid',
        updatedAt: { __timestamp: now },
      },
    },
  ];

  if (transaction.paymentPlanId) {
    const planDocument = await getFirestoreDocument('paymentPlans', String(transaction.paymentPlanId));
    if (planDocument) {
      const plan = decodeFields(planDocument.fields);
      const planPaid = Math.min(Number(plan.totalAmount), Number(plan.amountPaid || 0) + creditedAmount);
      const planBalance = Math.max(0, Number(plan.totalAmount) - planPaid);
      let remainingToAllocate = transaction.type === 'pss_deposit' ? 0 : creditedAmount;
      const schedule = (plan.schedule || []).map((item: any) => {
        if (item.status === 'paid' || remainingToAllocate <= 0) return item;
        if (remainingToAllocate + 0.05 >= Number(item.amount)) {
          remainingToAllocate -= Number(item.amount);
          return { ...item, status: 'paid', paidAt: now };
        }
        return item;
      });
      const paidInstalments = schedule.filter((item: any) => item.status === 'paid').length;
      const nextPayment = schedule.find((item: any) => item.status !== 'paid');
      updates.push({
        document: planDocument,
        fields: {
          amountPaid: planPaid,
          balanceRemaining: planBalance,
          paidInstalments,
          schedule,
          nextPaymentDate: nextPayment?.dueDate || plan.nextPaymentDate,
          status: planBalance <= 0.01 ? 'completed' : 'active',
          updatedAt: { __timestamp: now },
        },
      });
    }
  }

  await commitFirestoreUpdates(updates);
  return { alreadyProcessed: false };
}
