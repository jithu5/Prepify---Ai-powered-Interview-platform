"use client"
import React, { useEffect, useState } from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import axios from 'axios'
import { toast } from 'sonner'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination'
import { Loader2, MessageCircleMore } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface Post {
    id: string;
    question: string;
    answer: string;
    created_at: Date;
    updated_at?: Date;
    likes: string[]
    answers: string[],
    tags: string[]
}

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })

function PostTab() {
    const [posts, setPosts] = useState<Post[]>([])
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(25);
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

    const router = useRouter()

    useEffect(() => {
        const fetchUsersPost = async () => {
            try {
                const { data } = await axios.get(`/api/get-users-post?page=${page}&limit=${limit}`, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                })
                if (data.success) {
                    toast.success(data.message);
                    setPosts(
                        data.data.map((post: Post) => ({
                            ...post,
                            likes: post.likes || [],
                        }))
                    );

                    setTotalPosts(data.totalPosts);  // 👈 Save total number of posts
                    return;
                }
                toast.error(data.message);
            } catch (error: any) {
                const errMsg = error?.response?.data?.message || "Server Error";
                toast.error(errMsg);
            }
        }

        fetchUsersPost()
    }, [page, limit])

    const deletePost = async (postId: string) => {
        setDeletingPostId(postId); // show progress
        try {
            const { data } = await axios.delete(`/api/delete-post/${postId}`, {
                headers: {
                    'Content-Type': "application/json",
                },
                withCredentials: true
            })
            if (data.success) {
                toast.success(data.message)
                setPosts(prevPost => {
                    return prevPost.filter(post => post.id !== postId)
                })
                return
            }
            toast.error(data.message)
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || "Server Error in deleting post"
            toast.error(errMsg)
        } finally {
            setDeletingPostId(null);
        }
    }
    console.log(posts)
    const totalPages = Math.ceil(totalPosts / limit);

    return (
        <>
            {
                posts.length === 0 && (
                    <div className='flex justify-center items-center'>
                        <Loader2 className='animate-spin' />
                    </div>
                )
            }
            {posts && posts.length > 0 && posts.map((post) => (
                <Card key={post.id} className="p-4 my-2 relative group">
                    <div onClick={() => router.push(`/community/${post.id}`)} className="cursor-pointer">
                        <h3 className="font-semibold">{post.question}</h3>
                        <p className="text-sm text-muted-foreground">
                            Posted on: {formatDate(new Date(post.created_at).toISOString())}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-sm mt-2">❤️ {post.likes.length || 0} likes</p>
                        <p className="text-sm mt-2 flex items-center gap-1"><MessageCircleMore />{post.answers.length || 0} answers</p>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deletePost(post.id);
                        }}
                        className="absolute top-3 right-2.5 text-sm text-red-500 hover:underline disabled:opacity-50"
                        disabled={deletingPostId === post.id}
                    >
                        {deletingPostId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Delete"
                        )}
                    </button>
                </Card>

            ))}
            {/* Pagination */}
            <Pagination>
                <PaginationContent>

                    {/* Previous */}
                    <PaginationItem>
                        <PaginationPrevious
                            className={`cursor-pointer ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={() => {
                                if (page > 1) setPage(prev => prev - 1);
                            }}
                        />
                    </PaginationItem>

                    {/* Current Page */}
                    <PaginationItem>
                        <PaginationLink isActive>
                            {page}
                        </PaginationLink>
                    </PaginationItem>

                    {/* Next */}
                    <PaginationItem>
                        <PaginationNext
                            className={`cursor-pointer ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={() => {
                                if (page < totalPages) setPage(prev => prev + 1);
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </>
    )
}

export default PostTab
