import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        const userId = session?.user.id;
        if (!userId) {
            return NextResponse.json({
                message: "Unauthorized", success: false
            }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { is_account_verified: true, id: true }
        });

        if (!user) {
            return NextResponse.json({
                message: "Unauthorized", success: false
            }, { status: 401 });
        }

        if (!user.is_account_verified) {
            return NextResponse.json({
                message: "Your account needs to be verified", success: false
            }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        console.log(req.url)
        console.log(searchParams)
        const pageParam = searchParams.get('page');
        const limitParam = searchParams.get('limit');

        if (!pageParam || !limitParam) {
            return NextResponse.json({
                message: "Page and Limit are required", success: false
            }, { status: 400 });
        }

        const page = Math.max(1, parseInt(pageParam, 10));
        const limit = Math.min(Math.max(1, parseInt(limitParam, 10)), 100); // limit max 100

        const totalAnswers = await prisma.answer.findMany()
        if (!totalAnswers) {
            return NextResponse.json({ message: "No posts found", success: false }, { status: 404 });

        }

        const skip = (page - 1) * limit;

        const userAnswers = await prisma.answer.findMany({
            where: { user_id: user.id },
            skip,
            take: limit,
            orderBy: {
                created_at: "desc"
            },
            include: {
                post: {
                    select: {
                        question: true,
                        id: true
                    }
                }
            }
        })
        console.log(userAnswers)
        return NextResponse.json({ message: "Posts fetched successfully", success: true, data: userAnswers, totalAnswers: totalAnswers.length }, { status: 200 });

    } catch (error) {
        console.log("Server Error in getting users posts", error)
        return NextResponse.json({ message: "Server Error in getting users post", success: false }, {
            status: 500
        })
    }
}