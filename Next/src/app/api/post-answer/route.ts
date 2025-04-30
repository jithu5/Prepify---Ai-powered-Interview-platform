import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { z } from "zod";

const answerSchema = z.object({
    answer: z.string().trim().min(20, "Answer needs minimum of 20 characters"),
    postId: z.string()
})

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        const userId = session?.user.id
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized", success: false }, {
                status: 401
            })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, {
                status: 401
            })
        }

        if (!user.is_account_verified) {
            return NextResponse.json({ message: "Verify your account first...", success: false }, {
                status: 401
            })
        }

        const body = await req.json()
        const parsedData = answerSchema.parse(body)

        const { answer, postId } = parsedData
        if (!answer || !postId) {
            return NextResponse.json({ message: "Answer is required", success: false }, {
                status: 400
            })
        }

        const createAnswer = await prisma.answer.create({
            data: {
                answer: answer,
                user_id: user.id,
                post_id: postId
            },
            select:{
                answer:true,
                created_at:true,
                id:true,
                user:{
                    select:{
                        firstname:true
                    }
                }
            }
        })
        
        const transformedAnswer = {...createAnswer,firstname:createAnswer.user.firstname}

        return NextResponse.json({ message: "Successfully submitted your answer", success: true, answer: transformedAnswer }, {
            status: 201
        })
    } catch (error) {
        console.log("Error while Posting answer", error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message, success: false }, { status: 400 });
        }
        return NextResponse.json({ message: "Server Error posting answer", success: false }, {
            status: 500
        })
    }
}