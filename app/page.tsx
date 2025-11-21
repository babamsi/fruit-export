'use client';

import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { LowStockAlerts } from '@/components/dashboard/LowStockAlerts';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your fruit export business
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <LowStockAlerts />
      </div>

      <ExpenseChart />
    </div>
  );
}
