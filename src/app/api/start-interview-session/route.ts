import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma} from "@/lib/prisma"

export async function POST(request: NextRequest) {

    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const userToken: User = session.user;

        const user = await prisma.user.findUnique({
            where: { id: userToken.id },
        });

        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const body = await request.json();

        const { position, type, level } = body;

        if (!position || !type || !level) {
            return NextResponse.json({ message: "All fields are required", success: false }, { status: 400 });
        }

        const interview = await prisma.interview_session.create({
            data: {
                position_type: position,
                type,
                level,
                user_id: user.id,
            },
        });

        return NextResponse.json({ message: "Interview session started successfully", success: true, data: interview }, { status: 201 });
    } catch (error) {
        console.error("Error in start interview route:", error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }

}

