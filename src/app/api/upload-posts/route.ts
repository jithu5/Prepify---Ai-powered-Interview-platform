import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const postSchema = z.object({
    question: z.string().min(10, "Question should have at least 10 characters."),
    answer: z.string().min(10, "Answer should have at least 10 characters."),
    tags: z.array(z.string().min(1)).min(1, "At least one tag is required."),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true ,is_account_verified:true},
        });

        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }
        if (!user.is_account_verified) {
            return NextResponse.json({ message: "Your account is not verified...", success: false }, { status: 401 });
        }

        const body = await req.json();
        const { question, answer, tags } = postSchema.parse(body);

        const post = await prisma.post.create({
            data: {
                question,
                answer,
                user_id: user.id,
            },
        });

        if (!post) {
            return NextResponse.json({ message: "Failed to create post", success: false }, { status: 500 });
        }

        await Promise.all(
            tags.map(async (tag) => {
                const existingTag = await prisma.tag.findUnique({
                    where: { tag_name: tag },
                    select: { id: true },
                });

                const tagId = existingTag
                    ? existingTag.id
                    : (await prisma.tag.create({ data: { tag_name: tag } })).id;

                await prisma.postTag.create({
                    data: {
                        post_id: post.id,
                        tag_id: tagId,
                    },
                });
            })
        );

        return NextResponse.json({ message: "🎉 Post created successfully!", success: true }, { status: 201 });
    } catch (error) {
        console.error("[POST_CREATE_ERROR]:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message, success: false }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
}
