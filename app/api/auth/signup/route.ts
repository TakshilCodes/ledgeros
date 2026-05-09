import prisma from "@/lib/prisma";
import { SignupZod } from "@/lib/validators/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const valid = SignupZod.safeParse(body);

        if (!valid.success) {
            return NextResponse.json(
                {
                    ok: false,
                    error: valid.error.flatten().fieldErrors,
                    msg: null,
                },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: valid.data.email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Email already exists!",
                    msg: null,
                },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(valid.data.password, 12);

        const user = await prisma.user.create({
            data: {
                email: valid.data.email,
                displayName: valid.data.displayName,
                hashedPassword,
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                ok: true,
                error: null,
                msg: "Account created successfully!",
                user,
            },
            { status: 201 }
        );
    } catch (e) {
        return NextResponse.json(
            {
                ok: false,
                error: e,
                msg: null,
            },
            { status: 500 }
        );
    }
}