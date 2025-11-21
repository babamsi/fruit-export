'use client';

import { StatCard } from '@/components/shared/StatCard';
import { DollarSign, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useContainerStore } from '@/lib/stores/containerStore';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import { useExpenseStore } from '@/lib/stores/expenseStore';
import { calculateTotalPendingPayments } from '@/lib/utils/calculations';
import { getLowStockItems } from '@/lib/utils/calculations';
import { startOfMonth, endOfMonth } from 'date-fns';

export function DashboardStats() {
  const transactions = useTransactionStore((state) => state.transactions);
  const containers = useContainerStore((state) => state.containers);
  const inventoryItems = useInventoryStore((state) => state.items);
  const expenses = useExpenseStore((state) => state.expenses);

  const totalPendingPayments = calculateTotalPendingPayments(transactions);
  const activeContainers = containers.filter(
    (c) => c.status === 'Preparing' || c.status === 'In Transit'
  ).length;
  const lowStockItems = getLowStockItems(inventoryItems);
  const lowStockCount = lowStockItems.length;

  // Calculate monthly expenses
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthlyExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Pending Payments"
        value={totalPendingPayments}
        icon={DollarSign}
        formatAsCurrency
        variant={totalPendingPayments > 0 ? 'danger' : 'success'}
      />
      <StatCard
        title="Active Containers"
        value={activeContainers}
        icon={Package}
        variant="default"
      />
      <StatCard
        title="Low Stock Alerts"
        value={lowStockCount}
        icon={AlertTriangle}
        variant={lowStockCount > 0 ? 'warning' : 'success'}
      />
      <StatCard
        title="Monthly Expenses"
        value={monthlyExpenses}
        icon={TrendingUp}
        formatAsCurrency
        variant="default"
      />
    </div>
  );
}



