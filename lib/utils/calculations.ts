import type {
  Supplier,
  Container,
  PackagingItem,
  Transaction,
} from '@/lib/types';

export function calculateSupplierBalance(supplier: Supplier): number {
  return supplier.totalOwed - supplier.totalPaid;
}

export function calculateContainerValue(container: Container): number {
  return container.suppliers.reduce((sum, supplier) => sum + supplier.amount, 0);
}

export function calculateTotalPendingPayments(
  transactions: Transaction[]
): number {
  return transactions
    .filter(
      t => t.status === 'Pending' || t.status === 'Partially Paid'
    )
    .reduce((sum, t) => sum + t.remainingBalance, 0);
}

export function getLowStockItems(packagingItems: PackagingItem[]): PackagingItem[] {
  return packagingItems.filter(item => item.quantity < item.minQuantity);
}

export function calculateMonthlyExpenses(
  expenses: Array<{ amount: number; date: string }>,
  year: number,
  month: number
): number {
  return expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getFullYear() === year &&
        expenseDate.getMonth() === month
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
}



