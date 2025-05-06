import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

// Correct typing for route handler with dynamic param
export async function DELETE(
    req: NextRequest,
    context: { params: { answerId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        const userId = session?.user.id

        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized", success: false },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { is_account_verified: true },
        })

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized", success: false },
                { status: 401 }
            )
        }

        if (!user.is_account_verified) {
            return NextResponse.json(
                {
                    message: "Your account needs to be verified",
                    success: false,
                },
                { status: 401 }
            )
        }

        const answerId = context.params.answerId

        if (!answerId) {
            return NextResponse.json(
                {
                    message: "Answer does not exist",
                    success: false,
                },
                { status: 404 }
            )
        }

        const deleted = await prisma.answer.delete({
            where: { id: answerId },
        })

        if (!deleted) {
            return NextResponse.json(
                {
                    message: "Answer not found or failed to delete",
                    success: false,
                },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                message: "🎉 Successfully deleted the post...",
                success: true,
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Server Error Deleting a post:", error)
        return NextResponse.json(
            {
                message: "Server error in deleting a post",
                success: false,
            },
            { status: 500 }
        )
    }
}
