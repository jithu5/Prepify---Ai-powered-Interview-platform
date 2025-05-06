import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { MailtrapClient } from "mailtrap";
import { EMAIL_VERIFY_TEMPLATE } from "@/lib/emailVerifyTemplate";

const TOKEN = process.env.MAIL_TOKEN!;
const SENDER_EMAIL = process.env.SENDER_MAIL!;
const client = new MailtrapClient({ token: TOKEN });

const sender = { name: "Prepify", email: SENDER_EMAIL };

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        const userId = session?.user.id

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized", success: false }, {
                status: 404
            })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true
            }
        })
        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, {
                status: 404
            })
        }

        const RECIPIENT_EMAIL = user.email;
        const otp = Math.floor(100000 + Math.random() * 900000) // a 6 digit otp
        console.log(otp)

        if (!otp) {
            return NextResponse.json({ message: "Failed creating OTP", success: false }, {
                status: 400
            })
        }

        const updateUser = await prisma.user.update({
            where: { id: userId },
            data: {
                verify_otp: otp,
                verify_otp_expiry: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes in ms
            }
        })
        if (!updateUser) {
            return NextResponse.json({ message: "Failed creating OTP and updating user", success: false }, {
                status: 400
            })
        }
        client.send({
            from: sender,
            to: [{ email: RECIPIENT_EMAIL }],
            subject: "Account verification",
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp.toString())
        })
            .then(console.log)
            .catch(console.error);

        return NextResponse.json({
            success: true,
            message: "OTP send successfully..."
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Error checking otp:", error);
        return NextResponse.json({ message: "Error Checking otp", success: false }, { status: 500 });
    }
}