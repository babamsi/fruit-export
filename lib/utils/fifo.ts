import type { Transaction, TransactionCleared } from '@/lib/types';

export interface TransactionUpdate {
  transactionId: string;
  remainingBalance: number;
  status: 'Pending' | 'Partially Paid' | 'Fully Paid';
}

export interface AllocationResult {
  updates: TransactionUpdate[];
  clearedTransactions: TransactionCleared[];
  remainingPayment: number;
}

/**
 * Allocates payment to transactions using FIFO (First-In-First-Out) method
 * @param transactions - Array of transactions sorted by date (oldest first)
 * @param paymentAmount - Total payment amount to allocate
 * @returns Allocation result with updates and cleared transactions
 */
export function allocatePayment(
  transactions: Transaction[],
  paymentAmount: number
): AllocationResult {
  // Filter only pending and partially paid transactions
  const pendingTransactions = transactions
    .filter(t => t.status === 'Pending' || t.status === 'Partially Paid')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const updates: TransactionUpdate[] = [];
  const clearedTransactions: TransactionCleared[] = [];
  let remainingPayment = paymentAmount;

  for (const transaction of pendingTransactions) {
    if (remainingPayment <= 0) break;

    const transactionBalance = transaction.remainingBalance;
    const amountToAllocate = Math.min(remainingPayment, transactionBalance);

    if (amountToAllocate > 0) {
      const newRemainingBalance = transactionBalance - amountToAllocate;
      const status: 'Pending' | 'Partially Paid' | 'Fully Paid' =
        newRemainingBalance === 0 ? 'Fully Paid' : 'Partially Paid';

      updates.push({
        transactionId: transaction.id,
        remainingBalance: newRemainingBalance,
        status,
      });

      clearedTransactions.push({
        transactionId: transaction.id,
        amountCleared: amountToAllocate,
        remainingBalance: newRemainingBalance,
      });

      remainingPayment -= amountToAllocate;
    }
  }

  return {
    updates,
    clearedTransactions,
    remainingPayment,
  };
}

/**
 * Preview FIFO allocation without applying changes
 */
export function previewAllocation(
  transactions: Transaction[],
  paymentAmount: number
): AllocationResult {
  return allocatePayment(transactions, paymentAmount);
}



