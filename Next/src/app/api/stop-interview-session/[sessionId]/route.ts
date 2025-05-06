import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
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
        
        // ✅ Extract dynamic param from URL
        const id = req.nextUrl.pathname.split("/").pop()
        
        if (!id) {
            return NextResponse.json({ message: "Interview id is required", success: false }, { status: 400 });
        }
        const interviewSession = await prisma.interview_session.update({
            where: { id: id },
            data: {
            end_time: new Date(),
            max_count:0          
        }
        });

        if (!interviewSession) {
            return NextResponse.json({ message: "Interview session not found", success: false }, { status: 404 });
        }

        return NextResponse.json({ message: "Interview session stopped successfully", success:  true }, { status: 200 });
        } catch (error) {
        console.error("Error stopping interview session:", error);
        return NextResponse.json({ message: "Error stopping interview session", success: false }, { status: 500 });
    }
}