import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Context = {
    params: {
        sessionId: string
    }
}


export async function GET(request: NextRequest, context:Context) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const userId = session.user.id;

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }
        if (!user.is_account_verified) {
            return NextResponse.json({ message: "Account not verified", success: false }, { status: 401 });
        }

        const id = await context.params.sessionId;

        const interviewSession = await prisma.interview_session.findUnique({
            where: { id: id },
            include: {
                questions: {
                    orderBy: {
                        created_at: 'asc', // Sorting questions by created_at in ascending order
                    }, include: {
                        response: true
                    }
                },
                technologies: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!interviewSession) {
            return NextResponse.json({ message: "Interview session not found", success: false }, { status: 404 });
        }

        return NextResponse.json({ data: interviewSession.questions, success: true, message: "success" }, { status: 200 });
    } catch (error) {
        console.error("Error fetching interview session:", error);
        return NextResponse.json({ message: "Error fetching interview session", success: false }, { status: 500 });
    }
}

