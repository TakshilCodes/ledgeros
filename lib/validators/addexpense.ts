import { z } from "zod";

export const AddExpenseZod = z.object({
  name: z
    .string()
    .min(2, "Expense name must be at least 2 characters")
    .max(50, "Expense name is too long"),

  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  category: z.enum(["FOOD", "TRAVEL", "SHOPPING", "OTHER"]),

  spentAt: z.date({
    message: "Date is required",
  }),

  note: z
    .string()
    .max(200, "Note is too long")
    .optional(),
});