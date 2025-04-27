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
                username: true
            }
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "User profile fetched successfully", user }, { status: 200 })
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
    }
}