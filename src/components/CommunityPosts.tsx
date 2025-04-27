"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CommunityPostForm from './CommunityPostForm';
import axios from 'axios';
import { toast } from 'sonner';

interface Post {
    answer: string
    created_at: Date
    id: string
    question: string
    updated_at: Date
    user_id: string
}

function CommunityPosts() {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [posts, setPosts] = useState<Post[]>([])
    const [openForm, setOpenForm] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(25)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await axios.get(`/api/get-community-posts?page=${page}&limit=${limit}`, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                })
                if (data.success) {
                    toast.success(data.message)
                    setPosts(data.data)
                    return
                }
                toast.error(data.message)
            } catch (error: any) {
                const errMsg = error?.response?.data?.message || "Server Error";
                toast.error(errMsg)
            }
        }
        fetchPosts()
    }, [])
    console.log(posts)

    const handleToggle = () => {
        setIsExpanded((prev) => !prev);
    };
    return (
        <>
            <main className="relative flex min-h-screen w-full bg-stone-50">

                {/* Sidebar */}
                <aside className="sticky top-36 left-0 h-[calc(100vh-144px)] w-64 bg-white border-r border-stone-200 shadow-sm p-6 flex flex-col gap-6 rounded-tr-2xl">
                    <h2 className="text-xl font-semibold text-stone-800" style={{ fontFamily: 'Titillium Web' }}>
                        Menu
                    </h2>
                    <Input
                        type="text"
                        placeholder="Search interviews..."
                        className="mt-2 focus-visible:ring-2 focus-visible:ring-stone-400"
                        style={{ fontFamily: 'Quicksand Variable' }}
                    />
                    <Button onClick={() => setOpenForm(true)} variant="default" className="mt-4 rounded-xl shadow-md hover:shadow-lg transition">
                        Add Interview
                    </Button>
                </aside>

                <Separator orientation="vertical" className="bg-stone-200" />
                {
                    openForm && <CommunityPostForm open={openForm} onClose={() => setOpenForm(false)} />
                }
                {/* Main Content */}
                <section className="flex-1 p-8 w-[calc(100vw-256px)]">
                    {/* Card */}
                    {
                        posts && posts.length>0 && posts.map(post=>(
                            <div key={post.id} className="bg-white p-6 rounded-2xl shadow-md mb-8 flex flex-col gap-4">
                                {/* Username */}
                                <div className="text-sm text-stone-500" style={{ fontFamily: 'Quicksand Variable' }}>
                                    Posted by <span className="font-semibold text-stone-700">John Doe</span>
                                </div>

                                {/* Question Title */}
                                <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Titillium Web' }}>
                                    {post.question}
                                </h2>

                                {/* Answer Preview / Full */}
                                <p className="text-stone-700 leading-relaxed" style={{ fontFamily: 'Quicksand Variable' }}>
                                    {isExpanded ? post.answer : post.answer.slice(0,80)}
                                </p>

                                {/* Buttons */}
                                <div className="flex items-center justify-between mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full px-4 py-2 text-sm"
                                        onClick={handleToggle}
                                    >
                                        {isExpanded ? 'Show Less' : 'Read More'}
                                    </Button>
                                    <button className="flex items-center gap-1 text-stone-500">
                                        <ThumbsUp className=' hover:text-red-500 transition' />
                                        <span className="text-sm">Like</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </section>
            </main>
        </>
    )
}

export default CommunityPosts
