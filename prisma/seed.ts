import {
  BillingCycle,
  BudgetType,
  ExpenseCategory,
  RecurringCategory,
} from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? "demo@ledgeros.app";

function dateInMonth(
  year: number,
  monthIndex: number,
  day: number,
  hour = 12,
  minute = 0,
): Date {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const safeDay = Math.min(Math.max(day, 1), lastDay);

  return new Date(year, monthIndex, safeDay, hour, minute, 0, 0);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();

  result.setDate(Math.min(originalDay, lastDay));

  return result;
}

function futureDate(dayOfMonth: number, minimumDaysAhead = 1): Date {
  const now = new Date();
  let result = dateInMonth(
    now.getFullYear(),
    now.getMonth(),
    dayOfMonth,
    10,
  );

  const minimumDate = new Date(now);
  minimumDate.setDate(minimumDate.getDate() + minimumDaysAhead);

  if (result < minimumDate) {
    result = dateInMonth(
      now.getFullYear(),
      now.getMonth() + 1,
      dayOfMonth,
      10,
    );
  }

  return result;
}

async function seedSubscriptionTemplates() {
  const templates = [
    {
      name: "YouTube Premium",
      logo: "https://cdn.simpleicons.org/youtube",
      category: "Entertainment",
      plans: [
        {
          name: "Student",
          amount: "89",
          billingCycle: BillingCycle.MONTHLY,
        },
        {
          name: "Individual",
          amount: "149",
          billingCycle: BillingCycle.MONTHLY,
        },
      ],
    },
    {
      name: "ChatGPT",
      logo: "https://cdn.simpleicons.org/openai",
      category: "AI Tools",
      plans: [
        {
          name: "Plus",
          amount: "1999",
          billingCycle: BillingCycle.MONTHLY,
        },
      ],
    },
    {
      name: "Netflix",
      logo: "https://cdn.simpleicons.org/netflix",
      category: "Entertainment",
      plans: [
        {
          name: "Basic",
          amount: "199",
          billingCycle: BillingCycle.MONTHLY,
        },
        {
          name: "Standard",
          amount: "499",
          billingCycle: BillingCycle.MONTHLY,
        },
      ],
    },
    {
      name: "Chess.com",
      logo: "https://cdn.simpleicons.org/chessdotcom",
      category: "Gaming",
      plans: [
        {
          name: "Platinum",
          amount: "2499",
          billingCycle: BillingCycle.YEARLY,
        },
      ],
    },
  ] as const;

  const seededPlans = new Map<
    string,
    {
      templateId: string;
      planId: string;
      name: string;
      category: string;
      amount: string;
      billingCycle: BillingCycle;
    }
  >();

  for (const templateData of templates) {
    const template = await prisma.subscriptionTemplate.upsert({
      where: {
        name: templateData.name,
      },
      update: {
        logo: templateData.logo,
        category: templateData.category,
      },
      create: {
        name: templateData.name,
        logo: templateData.logo,
        category: templateData.category,
      },
    });

    for (const planData of templateData.plans) {
      const plan = await prisma.subscriptionPlan.upsert({
        where: {
          templateId_name_billingCycle: {
            templateId: template.id,
            name: planData.name,
            billingCycle: planData.billingCycle,
          },
        },
        update: {
          amount: planData.amount,
        },
        create: {
          templateId: template.id,
          name: planData.name,
          amount: planData.amount,
          billingCycle: planData.billingCycle,
        },
      });

      seededPlans.set(`${templateData.name}:${planData.name}`, {
        templateId: template.id,
        planId: plan.id,
        name: templateData.name,
        category: templateData.category,
        amount: planData.amount,
        billingCycle: planData.billingCycle,
      });
    }
  }

  return seededPlans;
}

async function main() {
  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const currentMonth = currentMonthIndex + 1;

  const previousMonthDate = addMonths(
    new Date(currentYear, currentMonthIndex, 1),
    -1,
  );

  const twoMonthsAgoDate = addMonths(
    new Date(currentYear, currentMonthIndex, 1),
    -2,
  );

  const user = await prisma.user.upsert({
    where: {
      email: DEMO_EMAIL,
    },
    update: {
      displayName: "Takshil",
    },
    create: {
      email: DEMO_EMAIL,
      displayName: "Takshil",
    },
  });

  /*
   * Clear only user-owned demo data.
   * Shared subscription templates and plans are kept and upserted below.
   */
  await prisma.$transaction([
    prisma.expense.deleteMany({
      where: {
        userId: user.id,
      },
    }),
    prisma.budget.deleteMany({
      where: {
        userId: user.id,
      },
    }),
    prisma.subscription.deleteMany({
      where: {
        userId: user.id,
      },
    }),
    prisma.recurringExpense.deleteMany({
      where: {
        userId: user.id,
      },
    }),
  ]);

  const plans = await seedSubscriptionTemplates();

  /*
   * Current-month expenses
   */
  await prisma.expense.createMany({
    data: [
      {
        userId: user.id,
        name: "Monthly hostel rent",
        category: ExpenseCategory.OTHER,
        amount: "6500",
        note: "Monthly accommodation",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 1, 9),
      },
      {
        userId: user.id,
        name: "Blinkit groceries",
        category: ExpenseCategory.FOOD,
        amount: "846",
        note: "Snacks and groceries",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 2, 18, 20),
      },
      {
        userId: user.id,
        name: "YouTube Premium",
        category: ExpenseCategory.SUBSCRIPTION,
        amount: "89",
        note: "Student plan",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 3, 8),
      },
      {
        userId: user.id,
        name: "Uber",
        category: ExpenseCategory.TRAVEL,
        amount: "238",
        note: "College to home",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 4, 17, 35),
      },
      {
        userId: user.id,
        name: "Lunch with friends",
        category: ExpenseCategory.FOOD,
        amount: "720",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 5, 14, 10),
      },
      {
        userId: user.id,
        name: "ChatGPT Plus",
        category: ExpenseCategory.SUBSCRIPTION,
        amount: "1999",
        note: "Development and research",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 6, 10),
      },
      {
        userId: user.id,
        name: "Mechanical keyboard",
        category: ExpenseCategory.SHOPPING,
        amount: "3499",
        note: "Work setup upgrade",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 7, 20, 15),
      },
      {
        userId: user.id,
        name: "Metro recharge",
        category: ExpenseCategory.TRAVEL,
        amount: "500",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 8, 11),
      },
      {
        userId: user.id,
        name: "Netflix",
        category: ExpenseCategory.SUBSCRIPTION,
        amount: "199",
        note: "Basic plan",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 9, 8),
      },
      {
        userId: user.id,
        name: "PS5 game",
        category: ExpenseCategory.SHOPPING,
        amount: "2499",
        note: "Physical edition",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 10, 16, 45),
      },
      {
        userId: user.id,
        name: "Cafe coffee",
        category: ExpenseCategory.FOOD,
        amount: "280",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 11, 17, 30),
      },
      {
        userId: user.id,
        name: "Domain renewal",
        category: ExpenseCategory.OTHER,
        amount: "899",
        note: "Annual portfolio domain",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 12, 12),
      },
      {
        userId: user.id,
        name: "Amazon order",
        category: ExpenseCategory.SHOPPING,
        amount: "1249",
        note: "Laptop accessories",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 13, 19),
      },
      {
        userId: user.id,
        name: "Dinner",
        category: ExpenseCategory.FOOD,
        amount: "610",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 14, 21),
      },
      {
        userId: user.id,
        name: "Auto fare",
        category: ExpenseCategory.TRAVEL,
        amount: "180",
        spentAt: dateInMonth(currentYear, currentMonthIndex, 15, 13),
      },

      /*
       * Previous month
       */
      {
        userId: user.id,
        name: "Hostel rent",
        category: ExpenseCategory.OTHER,
        amount: "6500",
        spentAt: dateInMonth(
          previousMonthDate.getFullYear(),
          previousMonthDate.getMonth(),
          1,
          9,
        ),
      },
      {
        userId: user.id,
        name: "Groceries",
        category: ExpenseCategory.FOOD,
        amount: "1840",
        spentAt: dateInMonth(
          previousMonthDate.getFullYear(),
          previousMonthDate.getMonth(),
          4,
          18,
        ),
      },
      {
        userId: user.id,
        name: "ChatGPT Plus",
        category: ExpenseCategory.SUBSCRIPTION,
        amount: "1999",
        spentAt: dateInMonth(
          previousMonthDate.getFullYear(),
          previousMonthDate.getMonth(),
          6,
          10,
        ),
      },
      {
        userId: user.id,
        name: "Gaming accessories",
        category: ExpenseCategory.SHOPPING,
        amount: "4299",
        spentAt: dateInMonth(
          previousMonthDate.getFullYear(),
          previousMonthDate.getMonth(),
          9,
          20,
        ),
      },
      {
        userId: user.id,
        name: "College commute",
        category: ExpenseCategory.TRAVEL,
        amount: "1450",
        spentAt: dateInMonth(
          previousMonthDate.getFullYear(),
          previousMonthDate.getMonth(),
          12,
          8,
        ),
      },
      {
        userId: user.id,
        name: "Food and dining",
        category: ExpenseCategory.FOOD,
        amount: "3120",
        spentAt: dateInMonth(
          previousMonthDate.getFullYear(),
          previousMonthDate.getMonth(),
          18,
          20,
        ),
      },
      {
        userId: user.id,
        name: "Clothing",
        category: ExpenseCategory.SHOPPING,
        amount: "2450",
        spentAt: dateInMonth(
          previousMonthDate.getFullYear(),
          previousMonthDate.getMonth(),
          22,
          17,
        ),
      },

      /*
       * Two months ago
       */
      {
        userId: user.id,
        name: "Hostel rent",
        category: ExpenseCategory.OTHER,
        amount: "6500",
        spentAt: dateInMonth(
          twoMonthsAgoDate.getFullYear(),
          twoMonthsAgoDate.getMonth(),
          1,
          9,
        ),
      },
      {
        userId: user.id,
        name: "Food and groceries",
        category: ExpenseCategory.FOOD,
        amount: "4360",
        spentAt: dateInMonth(
          twoMonthsAgoDate.getFullYear(),
          twoMonthsAgoDate.getMonth(),
          8,
          19,
        ),
      },
      {
        userId: user.id,
        name: "Subscriptions",
        category: ExpenseCategory.SUBSCRIPTION,
        amount: "2287",
        spentAt: dateInMonth(
          twoMonthsAgoDate.getFullYear(),
          twoMonthsAgoDate.getMonth(),
          12,
          10,
        ),
      },
      {
        userId: user.id,
        name: "Travel",
        category: ExpenseCategory.TRAVEL,
        amount: "1180",
        spentAt: dateInMonth(
          twoMonthsAgoDate.getFullYear(),
          twoMonthsAgoDate.getMonth(),
          17,
          15,
        ),
      },
      {
        userId: user.id,
        name: "Development tools",
        category: ExpenseCategory.SHOPPING,
        amount: "2750",
        spentAt: dateInMonth(
          twoMonthsAgoDate.getFullYear(),
          twoMonthsAgoDate.getMonth(),
          23,
          13,
        ),
      },
    ],
  });

  /*
   * Budgets
   */
  await prisma.budget.createMany({
    data: [
      {
        userId: user.id,
        name: "Monthly spending limit",
        type: BudgetType.MONTHLY,
        amount: "30000",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: user.id,
        name: "Daily spending target",
        type: BudgetType.DAILY_LIMIT,
        amount: "1000",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: user.id,
        name: "Food budget",
        type: BudgetType.CATEGORY,
        category: ExpenseCategory.FOOD,
        amount: "6000",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: user.id,
        name: "Shopping budget",
        type: BudgetType.CATEGORY,
        category: ExpenseCategory.SHOPPING,
        amount: "9000",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: user.id,
        name: "Travel budget",
        type: BudgetType.CATEGORY,
        category: ExpenseCategory.TRAVEL,
        amount: "3000",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: user.id,
        name: "Subscription budget",
        type: BudgetType.CATEGORY,
        category: ExpenseCategory.SUBSCRIPTION,
        amount: "3500",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: user.id,
        name: "Other expenses budget",
        type: BudgetType.CATEGORY,
        category: ExpenseCategory.OTHER,
        amount: "8500",
        month: currentMonth,
        year: currentYear,
      },
    ],
  });

  const youtubePlan = plans.get("YouTube Premium:Student");
  const chatgptPlan = plans.get("ChatGPT:Plus");
  const netflixPlan = plans.get("Netflix:Basic");
  const chessPlan = plans.get("Chess.com:Platinum");

  if (!youtubePlan || !chatgptPlan || !netflixPlan || !chessPlan) {
    throw new Error("One or more subscription plans were not seeded.");
  }

  /*
   * Subscriptions
   */
  await prisma.subscription.createMany({
    data: [
      {
        userId: user.id,
        templateId: youtubePlan.templateId,
        planId: youtubePlan.planId,
        name: youtubePlan.name,
        planName: "Student",
        category: youtubePlan.category,
        amount: youtubePlan.amount,
        billingCycle: youtubePlan.billingCycle,
        nextRenewalDate: futureDate(16, 2),
        isActive: true,
      },
      {
        userId: user.id,
        templateId: chatgptPlan.templateId,
        planId: chatgptPlan.planId,
        name: chatgptPlan.name,
        planName: "Plus",
        category: chatgptPlan.category,
        amount: chatgptPlan.amount,
        billingCycle: chatgptPlan.billingCycle,
        nextRenewalDate: futureDate(19, 3),
        isActive: true,
      },
      {
        userId: user.id,
        templateId: netflixPlan.templateId,
        planId: netflixPlan.planId,
        name: netflixPlan.name,
        planName: "Basic",
        category: netflixPlan.category,
        amount: netflixPlan.amount,
        billingCycle: netflixPlan.billingCycle,
        nextRenewalDate: futureDate(24, 5),
        isActive: true,
      },
      {
        userId: user.id,
        templateId: chessPlan.templateId,
        planId: chessPlan.planId,
        name: chessPlan.name,
        planName: "Platinum",
        category: chessPlan.category,
        amount: chessPlan.amount,
        billingCycle: chessPlan.billingCycle,
        nextRenewalDate: addMonths(now, 5),
        isActive: true,
      },
      {
        userId: user.id,
        name: "Spotify",
        planName: "Individual",
        category: "Music",
        amount: "119",
        billingCycle: BillingCycle.MONTHLY,
        nextRenewalDate: futureDate(27, 7),
        isActive: true,
      },
      {
        userId: user.id,
        name: "Canva",
        planName: "Pro",
        category: "Design",
        amount: "3999",
        billingCycle: BillingCycle.YEARLY,
        nextRenewalDate: addMonths(now, 8),
        isActive: true,
      },
      {
        userId: user.id,
        name: "Old cloud storage plan",
        planName: "Starter",
        category: "Cloud Storage",
        amount: "130",
        billingCycle: BillingCycle.MONTHLY,
        nextRenewalDate: futureDate(10, 2),
        isActive: false,
      },
    ],
  });

  /*
   * Recurring expenses
   */
  await prisma.recurringExpense.createMany({
    data: [
      {
        userId: user.id,
        name: "Hostel rent",
        amount: "6500",
        category: RecurringCategory.HOUSING,
        billingCycle: BillingCycle.MONTHLY,
        nextDueDate: futureDate(1, 2),
        note: "Monthly accommodation payment",
        isActive: true,
      },
      {
        userId: user.id,
        name: "Home internet",
        amount: "799",
        category: RecurringCategory.INTERNET_PHONE,
        billingCycle: BillingCycle.MONTHLY,
        nextDueDate: futureDate(8, 2),
        note: "Broadband plan",
        isActive: true,
      },
      {
        userId: user.id,
        name: "Mobile recharge",
        amount: "349",
        category: RecurringCategory.INTERNET_PHONE,
        billingCycle: BillingCycle.MONTHLY,
        nextDueDate: futureDate(12, 2),
        isActive: true,
      },
      {
        userId: user.id,
        name: "SIP investment",
        amount: "8000",
        category: RecurringCategory.INVESTMENT,
        billingCycle: BillingCycle.MONTHLY,
        nextDueDate: futureDate(5, 2),
        note: "Monthly mutual fund investment",
        isActive: true,
      },
      {
        userId: user.id,
        name: "College fees",
        amount: "18000",
        category: RecurringCategory.EDUCATION,
        billingCycle: BillingCycle.HALF_YEARLY,
        nextDueDate: addMonths(now, 4),
        note: "Semester fee",
        isActive: true,
      },
      {
        userId: user.id,
        name: "Health insurance",
        amount: "7200",
        category: RecurringCategory.INSURANCE,
        billingCycle: BillingCycle.YEARLY,
        nextDueDate: addMonths(now, 7),
        isActive: true,
      },
      {
        userId: user.id,
        name: "Old device EMI",
        amount: "2400",
        category: RecurringCategory.EMI,
        billingCycle: BillingCycle.MONTHLY,
        nextDueDate: futureDate(15, 2),
        note: "Completed payment plan",
        isActive: false,
      },
    ],
  });

  const [
    expenseCount,
    budgetCount,
    subscriptionCount,
    recurringExpenseCount,
  ] = await Promise.all([
    prisma.expense.count({
      where: { userId: user.id },
    }),
    prisma.budget.count({
      where: { userId: user.id },
    }),
    prisma.subscription.count({
      where: { userId: user.id },
    }),
    prisma.recurringExpense.count({
      where: { userId: user.id },
    }),
  ]);

  console.log("LedgerOS demo data seeded successfully.");
  console.table({
    user: user.email,
    expenses: expenseCount,
    budgets: budgetCount,
    subscriptions: subscriptionCount,
    recurringExpenses: recurringExpenseCount,
  });
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed LedgerOS demo data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });