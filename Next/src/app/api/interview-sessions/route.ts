import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const userId = session.user.id;

        if (!userId) {
            return NextResponse.json({ message: "User ID not found", success: false }, { status: 400 });

        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                is_account_verified: true,
                interviewSessions: {
                    orderBy:{
                        start_time:"desc"    
                    },
                    include: {
                        Response: {
                            select: {
                                score: true
                            }
                        }
                    }
                },
            },
            
        });

        if (!user) {
            return NextResponse.json({ message: "User not found", success: false }, { status: 404 });

        }

        if (!user.is_account_verified) {
            return NextResponse.json({ message: "Account not verified", success: false }, { status: 401 });
        }

        const interviewSessions = user.interviewSessions || [];

        if (interviewSessions.length === 0) {
            return NextResponse.json({ message: "No interview sessions found", success: false }, { status: 404 });

        }
        const interviewData = user.interviewSessions.map((interview) => {
            const totalScore = interview.Response.reduce((accumulator, curr) => accumulator + (curr.score || 0), 0);

            const averageScore = (totalScore / (interview.Response.length * 10)) * 100

            return {
                ...interview,
                score: averageScore,
            };
        });

        if (interviewData.length === 0) {
            return NextResponse.json({ message: "No interview sessions found", success: false }, { status: 404 });

        }

        return NextResponse.json({ message: "Interview sessions fetched successfully", data: interviewData, success: true }, { status: 200 });

    } catch (error) {
        console.error("Error fetching interview sessions:", error);
        return NextResponse.json({ message: "Error fetching interview sessions", success: false }, { status: 500 });

    }
}