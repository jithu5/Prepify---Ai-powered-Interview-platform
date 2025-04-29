import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
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

        const body = await req.json()

        const { postId } = body

        if (!postId) {
            return NextResponse.json({ message: "Post cannot be found", success: false }, {
                status: 400
            })
        }

        const post = await prisma.post.findUnique({
            where: { id: postId }
        })

        if (!post) {
            return NextResponse.json({ message: "Post cannot be found", success: false }, {
                status: 400
            })
        }
        const liked = await prisma.like.findUnique({
            where: {
                userPost:{
                    user_id:user.id,
                    post_id:post.id
                }
            }
        });

        if (liked) {
            const removeLike = await prisma.like.delete({
                where:{
                    userPost:{
                        user_id: user.id,
                        post_id: post.id
                    }
                }
            })

            if (!removeLike) {
                return NextResponse.json({ message: "Failed in removing like", success: false }, {
                    status: 400
                })
            }
            return NextResponse.json({ message: "🎉 Successfully removed liked from the post", success: true }, { status: 201 })
        }

        const createLike = await prisma.like.create({
            data: {
                user_id: user.id,
                post_id: post.id
            }
        })

        if (!createLike) {
            return NextResponse.json({ message: "Failed in liking", success: false }, {
                status: 400
            })
        }
        return NextResponse.json({ message: "🎉 Successfully liked the post", success: true }, { status: 201 })
    } catch (error) {
        console.log("Error in liking post", error)
        return NextResponse.json({ message: "Server error in liking post", success: false }, { status: 500 })
    }
}