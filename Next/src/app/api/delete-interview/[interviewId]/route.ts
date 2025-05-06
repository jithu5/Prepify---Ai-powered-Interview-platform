import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

type Context = {
    params: {
        interviewId: string
    }
}


export async function DELETE(req: NextRequest, context:Context) {
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
            select: { is_account_verified: true }
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

        const interviewId = context.params.interviewId;

        if (!interviewId) {
            return NextResponse.json({
                message: "Interview not exists",
                success: false
            }, { status: 404 })
        }
        const deleteInterview = await prisma.interview_session.delete({
            where: { id: interviewId }
        })
        if (!deleteInterview) {
            return NextResponse.json({
                message: "Post not exists or Error in deleting",
                success: false
            }, { status: 404 })
        }

        return NextResponse.json({
            message: "🎉 successfully deleted the post...",
            success: true
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Server Error Deleting a post:", error);
        return NextResponse.json({ message: "Server error in deleting a post", success: false }, { status: 500 });
    }
}