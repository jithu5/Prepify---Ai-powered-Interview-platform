import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

type Context = {
    params: {
        answerId: string
    }
}

export async function DELETE(
    req: NextRequest,
    context: Context
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

        if (!user || !user.is_account_verified) {
            return NextResponse.json(
                {
                    message: "Unauthorized or Unverified",
                    success: false,
                },
                { status: 401 }
            )
        }

        const answerId = context.params.answerId

        const deleted = await prisma.answer.delete({
            where: { id: answerId },
        })

        return NextResponse.json(
            {
                message: "🎉 Successfully deleted the answer.",
                success: true,
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error deleting answer:", error)
        return NextResponse.json(
            {
                message: "Server error in deleting the answer",
                success: false,
            },
            { status: 500 }
        )
    }
}
