export type DashboardData = {
  month: number;
  year: number;

  summaryCards: {
    todaySpend: {
      title: string;
      value: number;
      formattedValue: string;
      subtitle: string;
    };
    thisMonthSpend: {
      title: string;
      value: number;
      formattedValue: string;
      subtitle: string;
    };
    subscriptionsTotal: {
      title: string;
      value: number;
      formattedValue: string;
      subtitle: string;
    };
    budgetLeft: {
      title: string;
      value: number;
      formattedValue: string;
      subtitle: string;
      isOverBudget: boolean;
    };
  };

  alert: {
    type: string;
    title: string;
    message: string;
  } | null;

  expenseOverview: {
    totalSpent: number;
    categoryBreakdown: {
      category: string;
      label: string;
      amount: number;
      percentage: number;
    }[];
  };

  recentExpenses: {
    id: string;
    name: string;
    category: string;
    label: string;
    amount: number;
    formattedAmount: string;
    spentAt: string;
  }[];

  upcomingRenewals: {
    id: string;
    name: string;
    planName: string | null;
    amount: number;
    formattedAmount: string;
    billingCycle: string;
    nextRenewalDate: string;
    due: string;
  }[];

  categoryBudgets: {
    id: string;
    name: string;
    category: string | null;
    label: string;
    amount: number;
    spent: number;
    remaining: number;
    usedPercentage: number;
  }[];

  noSpend: {
    streak: number;
    days: {
      label: string;
      date: string;
      isFuture: boolean;
      isToday: boolean;
      hasExpense: boolean;
      isNoSpendDay: boolean;
    }[];
  };

  meta: {
    expenseCount: number;
    activeSubscriptionCount: number;
    hasMonthlyBudget: boolean;
    hasDailyLimit: boolean;
  };
};