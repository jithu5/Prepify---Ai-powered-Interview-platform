import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        if (!userId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });

        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                firstname: true,
                lastname: true,
                email: true,
                phonenumber: true,
                username: true,
                is_account_verified: true,
                posts: true,
                Answer:true,
                interviewSessions:true
            }
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const transformedUser = {...user,Answerlength:user.Answer?.length || 0,AverageScore:user.interviewSessions.reduce((acc,curr)=>acc + (curr.avg_score || 0),0),mockInterviews:user.interviewSessions.length || 0,questionLength:user.posts.length || 0}
        console.log(transformedUser)

        return NextResponse.json({ success: true, message: "User profile fetched successfully", user:transformedUser }, { status: 200 })
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
    }
}