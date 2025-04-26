import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        if (!body) {
            return NextResponse.json({ message: "Body is required", success: false }, { status: 401 });
        }
        const { otp, email } = body

        if (!otp || !email) {
            return NextResponse.json({ message: "Otp is required", success: false }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })
        if (!user) {
            return NextResponse.json({ message: "User cannot found , Error in registration", success: false }, { status: 401 });
        }
        if (user.verify_otp !== otp) {
            return NextResponse.json({ message: "Entered otp doesnt match", success: false }, { status: 401 });
        }

        const now = new Date
        if (!user.verify_otp_expiry) {
            return NextResponse.json({ message: "Error in otp expiry", success: false }, { status: 400 })
        }

        const diff = Math.abs(now.getTime() - user.verify_otp_expiry?.getTime())

        console.log(now.getTime())

        // 2 minutes in milliseconds
        const twoMinutes = 2 * 60 * 1000;
        if (diff > twoMinutes) {
            return NextResponse.json({ message: "Time limit expired", success: false }, { status: 401 });
        }
        const updateuser = await prisma.user.update({
            where: { email },
            data: {
                is_account_verified: true,
                verify_otp: null,
                verify_otp_expiry: null
            }
        })
        if (!updateuser) {
            return NextResponse.json({ message: "User cannot be updated", success: false }, { status: 401 });
        }

        return NextResponse.json({ message: "User account verification succeeded", success: true }, { status: 200 })
    } catch (error) {
        console.error("Error checking otp:", error);
        return NextResponse.json({ message: "Error Checking otp", success: false }, { status: 500 });
    }
}