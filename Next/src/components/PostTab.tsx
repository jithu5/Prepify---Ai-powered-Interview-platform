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

const demoPosts = [
    {
        id: "post1",
        title: "How to scale a Node.js app?",
        tags: ["Node.js", "Backend", "Scalability"],
        date: "2025-04-10",
        likes: 5,
    },
    {
        id: "post2",
        title: "Tips for better technical interviews",
        tags: ["Interview", "Tips"],
        date: "2025-04-05",
        likes: 10,
    },
]

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
console.log(posts)
    const totalPages = Math.ceil(totalPosts / limit);

    return (
        <>
        {
            posts.length === 0 && (
                <div className='flex justify-center items-center'>
                    <Loader2 className='animate-spin'/>
                </div>
            )
        }
            {posts && posts.length>0 && posts.map((post) => (
                <Card onClick={() => router.push(`/community/${post.id}`)} key={post.id} className="p-4 my-2 cursor-pointer">
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
                    <p className="text-sm mt-2 flex items-center gap-1">   <MessageCircleMore />{post.answers.length || 0} answers</p>
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
