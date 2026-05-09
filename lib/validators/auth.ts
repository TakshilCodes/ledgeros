import z from "zod";

export const SignupZod = z.object({
    email: z.string().email().max(50),
    displayName: z.string().min(3).max(20),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password cannot exceed 20 characters" }).regex(/[A-Z]/, { message: "Must contain an uppercase letter" })
        .regex(/[a-z]/, { message: "Must contain a lowercase letter" })
        .regex(/[0-9]/, { message: "Must contain a number" })
})

export const SignInZod = z.object({
    email: z.string().email().max(50),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password cannot exceed 20 characters" }).regex(/[A-Z]/, { message: "Must contain an uppercase letter" })
        .regex(/[a-z]/, { message: "Must contain a lowercase letter" })
        .regex(/[0-9]/, { message: "Must contain a number" })
})