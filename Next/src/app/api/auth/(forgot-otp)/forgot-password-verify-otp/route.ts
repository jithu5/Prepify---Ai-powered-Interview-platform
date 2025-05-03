import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
    email: z.string().email().trim(),
    otp: z.string().trim()
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, otp } = bodySchema.parse(body)

        if (!email || !otp) {
            return NextResponse.json({ message: "OTP is required", success: false }, { status: 400 })
        }
        const user = await prisma.user.findUnique({
            where:
                { email: email }
        })

        if (!user) {
            return NextResponse.json({ message: "Email not found", success: false }, { status: 401 })
        }
        if (user.forgot_password_otp !== Number(otp)) {
            return NextResponse.json({ message: "OTP doesnt match", success: false }, { status: 401 })
        }
        const now = new Date
        if (!user.forgot_password_otp_expiry) {
            return NextResponse.json({ message: "Error in otp expiry", success: false }, { status: 400 })
        }

        const diff = Math.abs(now.getTime() - user.forgot_password_otp_expiry?.getTime())

        console.log(now.getTime())

        // 2 minutes in milliseconds
        const twoMinutes = 2 * 60 * 1000;
        if (diff > twoMinutes) {
            return NextResponse.json({ message: "Time limit expired", success: false }, { status: 401 });
        }
        const updateUser = await prisma.user.update({
            where: { email },
            data: {
                forgot_password_otp: null,
                forgot_password_otp_expiry: null
            }
        })
        return NextResponse.json({ message: "OTP verified successfully", success: true }, { status: 200 })
    } catch (error) {
        console.log("Server error in sending otp", error)
        return NextResponse.json({ message: "Server error in sending otp", success: false }, { status: 500 })
    }
}