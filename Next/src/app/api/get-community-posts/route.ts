import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
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

        const { searchParams } = new URL(req.url);
        console.log(req.url)
        console.log(searchParams)
        const pageParam = searchParams.get('page');
        const limitParam = searchParams.get('limit');
        const tagParams = searchParams.get('tags')

        if (!pageParam || !limitParam) {
            return NextResponse.json({
                message: "Page and Limit are required", success: false
            }, { status: 400 });
        }

        const page = Math.max(1, parseInt(pageParam, 10));
        const limit = Math.min(Math.max(1, parseInt(limitParam, 10)), 100); // limit max 100

        const totalPosts = await prisma.post.findMany()
        if (!totalPosts) {
            return NextResponse.json({ message: "No posts found", success: false }, { status: 404 });

        }

        const skip = (page - 1) * limit;

        const posts = await prisma.post.findMany({
            where: tagParams ? {
                post_tags: {
                    some: {
                        tag: {
                            tag_name: {
                                contains: tagParams,
                                mode: "insensitive"
                            }
                        }
                    }
                }
            } : undefined,
            skip,
            take: limit,
            orderBy: {
                created_at: "desc"
            },
            include: {
                likes: {
                    select: {
                        user_id: true
                    }
                },
                Answers: {
                    select: {
                        user_id: true
                    }
                },
                user: {
                    select: {
                        firstname: true
                    }
                },
                post_tags: {
                    select: {
                        tag: {
                            select: {
                                tag_name: true
                            }
                        }
                    }
                }
            }
        });

        // Transform likes to an array of user_ids
        const transformedPosts = posts.map(post => ({
            ...post,
            likes: post.likes.map(like => like.user_id),
            answers: post.Answers.map(answer => answer.user_id),
            username:post.user.firstname,
            tags:post.post_tags.map(tag=>tag.tag.tag_name)
        }));

        return NextResponse.json({ message: "Posts fetched successfully", success: true, data: transformedPosts, totalPosts: totalPosts.length }, { status: 200 });

    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ message: "Server error in fetching posts", success: false }, { status: 500 });
    }
}
