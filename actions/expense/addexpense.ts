"use server"

import prisma from "@/lib/prisma";
import { AddExpenseZod } from "@/lib/validators/addexpense"
import { ExpenseCategory } from "@/app/generated/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type data = {
  name: string;
  amount: number;
  category: ExpenseCategory;
  spentAt: Date;
  note?: string;
};

export async function Addexpense(data: data) {
    try {

        const session = await getServerSession(authOptions)

        const userId = session?.user.id

        if(!userId){
            return {
                ok: false,
                msg: null,
                error: "Unauthenticated!"
            }
        }

        const valid = AddExpenseZod.safeParse(data);

        if (!valid.success) {
            return {
                ok: false,
                msg: null,
                error: "Invalid data!"
            }
        }

        await prisma.expense.create({
            data:{
                userId,
                name: data.name,
                amount: data.amount,
                category: data.category,
                note: data.note,
                spentAt : data.spentAt
            }
        })

        return {
            ok: true,
            msg: "Done",
            error: null
        }

    } catch (e : any) {
        return {
            ok: false,
            msg: null,
            error: "something went wrong!"
        }
    }
}