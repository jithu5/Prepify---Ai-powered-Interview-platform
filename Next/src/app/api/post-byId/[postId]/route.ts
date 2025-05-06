import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

type Context = {
    params: {
        postId: string
    }
}


export async function GET(req: NextRequest, context:Context) {
    try {
        const session = await getServerSession(authOptions)

        const userId = session?.user.id
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
        }
        if (!user.is_account_verified) {
            return NextResponse.json({ message: "Verify your account", success: false }, { status: 401 })
        }

        const postId = await context.params.postId

        if (!postId) {
            return NextResponse.json({ message: "post cannot be found", success: false }, { status: 401 })
        }
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                likes: {
                    select: {
                        user_id: true
                    }
                },
                Answers: {
                    select: {
                        id: true,
                        answer: true,
                        created_at: true,
                        updated_at: true,
                        user: {
                            select: {
                                firstname: true
                            }
                        }
                    }
                }
            }
        })
        if (!post) {
            return NextResponse.json({ message: "post cannot be found", success: false }, { status: 401 })
        }
        const transformedPosts = { ...post, likes: post?.likes.map(like => like.user_id), Answers: post.Answers.map(answer => ({...answer, firstname: answer.user.firstname})) };

        return NextResponse.json({ message: "🎉 Successfully liked the post", success: true, post: transformedPosts }, { status: 201 })
    } catch (error) {
        console.log("Error in liking post", error)
        return NextResponse.json({ message: "Server error in liking post", success: false }, { status: 500 })
    }
}