import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MailtrapClient } from "mailtrap"
import { EMAIL_VERIFY_TEMPLATE } from "@/lib/emailVerifyTemplate";
// import nodemailer from "nodemailer"

// Define Zod schema to validate the input data
const registerSchema = z.object({
    username: z.string().min(3, "Username should be at least 3 characters").max(20, "Username should be at most 20 characters"),
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    phonenumber: z.string().min(10, "Phone number should be at least 10 characters"), // Update based on your phone format
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password should be at least 8 characters"), // Update based on your password strength policy
});

const TOKEN = process.env.MAIL_TOKEN!;
const SENDER_EMAIL = process.env.SENDER_MAIL!;
const client = new MailtrapClient({ token: TOKEN });

const sender = { name: "Prepify", email: SENDER_EMAIL };

export async function POST(req: NextRequest) {
    try {
        // Parse and validate the incoming data using Zod
        const data = await req.json();
        const parsedData = registerSchema.parse(data); // This will throw if the data doesn't match the schema

        const { username, firstname, lastname, phonenumber, email, password } = parsedData;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: email,
                        username: username
                    }
                ]
            }
        })

        // If user exists, return error
        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: "User with this email or username already exists.",
                error: true
            }, {
                status: 400
            });
        }

        const hashPassword = await bcrypt.hash(password, 10)
        // Create a new user (add actual user creation logic here)

        const RECIPIENT_EMAIL = email;
        const otp = Math.floor(100000 + Math.random() * 900000) // a 6 digit otp
        console.log(otp)

        const newUser = await prisma.user.create({
            data: {
                username,
                firstname,
                lastname,
                phonenumber,
                email,
                password: hashPassword, // Consider hashing the password before storing!
                verify_otp: otp,
                verify_otp_expiry: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes in ms
            }
        });

        client
            .send({
                from: sender,
                to: [{ email: RECIPIENT_EMAIL }],
                subject: "Account verification",
                html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp.toString())
            })
            .then(console.log)
            .catch(console.error);

        return NextResponse.json({
            success: true,
            message: "🎉 Registration successful. Redirecting to login...",
            data: newUser
        }, {
            status: 201
        });

    } catch (error) {
        console.log(error)

        return NextResponse.json({
            success: false,
            error: "error in user registration"
        }, {
            status: 500
        })
    }
    finally {
        await prisma.$disconnect()
    }
}