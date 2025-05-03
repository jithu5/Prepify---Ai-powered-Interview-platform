import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MailtrapClient } from "mailtrap";
import { FORGOT_PASSWORD_TEMPLATE } from "@/lib/emailVerifyTemplate";

const bodySchema = z.object({
    email: z.string().email().trim()
})

const TOKEN = process.env.MAIL_TOKEN!;
const SENDER_EMAIL = process.env.SENDER_MAIL!;
const client = new MailtrapClient({ token: TOKEN });

const sender = { name: "Prepify", email: SENDER_EMAIL };

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email } = bodySchema.parse(body)

        if (!email) {
            return NextResponse.json({ message: "Email is required", success: false }, { status: 400 })
        }
        const user = await prisma.user.findUnique({
            where:
                { email: email }
        })

        if (!user) {
            return NextResponse.json({ message: "Email not found", success: false }, { status: 401 })
        }

        const RECIPIENT_EMAIL = email;
        const otp = Math.floor(100000 + Math.random() * 900000) // a 6 digit otp
        console.log(otp)

        const updateUser = await prisma.user.update({
            where: { email: email },
            data: {
                forgot_password_otp: otp,
                forgot_password_otp_expiry: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes in ms
            }
        })

        client
            .send({
                from: sender,
                to: [{ email: RECIPIENT_EMAIL }],
                subject: "Account verification",
                html: FORGOT_PASSWORD_TEMPLATE.replace("{{otp}}", otp.toString())
            })
            .then(console.log)
            .catch(console.error);

        return NextResponse.json({ message: "Succefuly send otp to your email", success: true }, { status: 200 })
    } catch (error) {
        console.log("Server error in sending otp", error)
        return NextResponse.json({ message: "Server error in sending otp", success: false }, { status: 500 })
    }
}