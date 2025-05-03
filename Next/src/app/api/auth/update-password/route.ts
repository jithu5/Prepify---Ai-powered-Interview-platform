import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const bodySchema = z.object({
    email: z.string().email().trim(),
    password:z.string().trim()
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email ,password} = bodySchema.parse(body)

        if (!email || !password) {
            return NextResponse.json({ message: "Password is required", success: false }, { status: 400 })
        }
        const user = await prisma.user.findUnique({
            where:
                { email: email }
        })

        if (!user) {
            return NextResponse.json({ message: "Email not found", success: false }, { status: 401 })
        }
        const hashedPassword = await bcrypt.hash(password,10)
        const updateUser = await prisma.user.update({
            where:{email},
            data:{
                password:hashedPassword,
            }
        })
      
        return NextResponse.json({ message: "Password updated successfully", success: true }, { status: 200 })
    } catch (error) {
        console.log("Server error in sending otp", error)
        return NextResponse.json({ message: "Server error in sending otp", success: false }, { status: 500 })
    }
}