"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { Loader2, SendHorizontal, ThumbsUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/FormateRelativeTime";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Post {
    id: string;
    question: string;
    answer: string;
    likes: string[]; // user_ids
    Answers: {
        id: string;
        answer: string;
        firstname: string;
        created_at: string;
    }[];
    created_at: Date,
    updated_at: Date,
    user_id: string
}

function PostPage() {
    const [post, setPost] = useState<Post | null>(null);
    const [userId, setUserId] = useState<string>(""); // Replace with session logic
    const { postId } = useParams()
    const [answer, setAnswer] = useState<string>("")
    const [postingAnswer, setPostingAnswer] = useState<boolean>(false)
    const [hasLiked, setHasLiked] = useState<boolean>(false)
    const { data: session } = useSession()

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`/api/post-byId/${postId}`);
            setPost(res.data.post);
            setUserId(res.data.userId);
        };
        fetchData();
    }, [postId]);

    useEffect(() => {
        if (post && userId) {
            setHasLiked(post.likes.includes(userId));
        }
    }, [post, userId]);

    const addLike = async (postId: string) => {
        if (!session?.user || !session?.user.id) {
            toast.error("Unauthorized")
            return
        }
        setPost((prevPost) => {
            if (prevPost === null) return null;
            return { ...prevPost, likes: prevPost.likes.includes(session.user.id) ? prevPost.likes.filter(like => like !== session.user.id) : [...prevPost.likes, session.user.id] };
        });
        // setPost((prevPost) => {
        //     if (prevPost === null) return null;
        //     const hasLiked = prevPost.likes.includes(session.user.id);
        //     return {
        //         ...prevPost,
        //         likes: hasLiked
        //             ? prevPost.likes.filter(like => like !== session.user.id) // remove like
        //             : [...prevPost.likes, session.user.id] // add like
        //     };
        // });
        try {
            const { data } = await axios.post(`/api/like-post`, { postId }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });

            if (!data.success) {
                throw new Error(data.message);
            }
            toast.success(data.message)
        } catch (error: AxiosError | unknown) {
            setPost((prevPost) => {
                if (!prevPost) return null;
                return { ...prevPost, likes: prevPost.likes.includes(session.user.id) ? prevPost.likes.filter(like => like !== session.user.id) : [...prevPost.likes, session.user.id] };
            })
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.message || "An error occurred");
                return
            }
            toast.error("An error occured")
            // Optionally revert

        }
    };
    const addAnswer = async (e: React.FormEvent) => {
        e.preventDefault()
        if (answer.trim() === "") {
            toast.error("Answer is empty")
            return
        }
        setPostingAnswer(true)
        try {
            const { data } = await axios.post('/api/post-answer', {
                answer, postId
            }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            })

            if (data.success) {
                console.log(data.answer)
                toast.success(data.message)
                setPost((prev) => prev ? {
                    ...prev,
                    Answers: [...(prev.Answers || []), data.answer]
                } : null)
                return
            }
            toast.error(data.message)
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || "Server error in posting answer"
            toast.error(errMsg)
        }
        finally {
            setAnswer("")
            setPostingAnswer(false)
        }
    }

    if (!post) return (
        <div className="min-h-screen w-full flex justify-center items-center">
            <Loader2 className="w-24 h-24 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto mt-12 md:mt-24 px-4 sm:px-6 lg:px-8 py-6 md:py-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 font-sans relative">

            {/* MAIN CONTENT - Reordered to appear first on mobile */}
            <div className="md:col-span-2 space-y-6 order-2 md:order-1">

                {/* Question */}
                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 capitalize">
                        {post.question}
                    </h1>
                    <h1 className="text-lg sm:text-xl font-medium text-gray-800 capitalize">
                        Answer: {post.answer}
                    </h1>
                    <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <img src="/amazon-logo.png" alt="Amazon" className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Asked at Amazon • {formatRelativeTime(new Date(post.created_at).toISOString())}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    {["👍 I was asked this", "🔗 Share"].map((text) => (
                        <button
                            key={text}
                            className="px-2 py-1 sm:px-3 sm:py-1 rounded-md border bg-white text-xs sm:text-sm hover:bg-gray-50 shadow-sm"
                        >
                            {text}
                        </button>
                    ))}
                    <button
                        className='flex items-center gap-1'
                    >
                        <ThumbsUp
                            onClick={() => addLike(post.id)}
                            className={`cursor-pointer transition ${hasLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                }`}
                        />
                        <span className="text-sm">{post.likes.length} Likes</span>
                    </button>
                </div>

                {/* Guidelines */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-gray-700 space-y-2">
                    <p className="font-semibold">Community Guidelines</p>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1">
                        <li>
                            <strong>Stay on topic.</strong> Use this section for submitting
                            solutions and providing feedback.
                        </li>
                        <li>
                            <strong>Be inclusive.</strong> Respect everyone's opinions and
                            beliefs.
                        </li>
                    </ul>
                </div>

                {/* Answer Input */}
                <form onSubmit={addAnswer} className="flex gap-2 items-start">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm sm:text-base">
                        A
                    </div>
                    <textarea
                        value={answer}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
                        placeholder="Add your own answer to this question..."
                        className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        rows={4}
                    ></textarea>
                    <Button type="submit" variant={"default"} className="w-10 h-10 rounded-full self-end flex items-center justify-center">{
                        postingAnswer ? (<><Loader2 className="w-3 h-3 animate-spin" /></>) : (<><SendHorizontal /></>)}</Button>
                </form>

                {/* Answers */}
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                        Answers ({post.Answers?.length || 0})
                    </h2>
                    <div className="flex flex-col w-full items-center gap-3">
                        {post.Answers && post.Answers.length > 0 && post.Answers.map(ans => (
                            <div key={ans.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm w-full">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-xs sm:text-sm">

                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                                {ans.firstname}.
                                                <span className="ml-1 sm:ml-2 text-purple-600 text-xs sm:text-sm bg-purple-100 px-1 sm:px-2 py-0.5 rounded-full">
                                                    Member ⭐ 1k
                                                </span>
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500">{new Date(ans.created_at).toISOString() || Date.now()}</p>
                                        </div>
                                    </div>
                                    <div className="text-orange-600 text-xs sm:text-sm font-semibold">
                                        🔥 Hot
                                    </div>
                                </div>
                                <p className="mt-2 sm:mt-3 text-gray-800 text-sm sm:text-base leading-relaxed">
                                    {ans.answer}
                                </p>
                            </div>
                        ))

                        }
                    </div>
                </div>
            </div>

            {/* SIDEBAR - Appears first on mobile */}
            <aside className="space-y-4 sm:space-y-6 order-1 md:order-2 max-md:mt-10">
                {/* Interview Details */}
                <div className="bg-white p-3 sm:p-4 border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Interview Details</h3>
                    <p className="text-xs sm:text-sm"><strong>Role:</strong> Product Manager</p>
                    <p className="text-xs sm:text-sm"><strong>Company:</strong> Amazon</p>
                    <p className="text-xs sm:text-sm"><strong>Category:</strong> Behavioral</p>
                </div>

                {/* Related Questions */}
                <div className="bg-white p-3 sm:p-4 border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Related Questions</h3>
                    <ul className="space-y-2 text-xs sm:text-sm">
                        <li className="text-blue-600 hover:underline">
                            How would you explain the role of a product manager to a 4-year-old?
                        </li>
                        <li className="text-blue-600 hover:underline">
                            You're an Apple product manager. Improve the iPhone Notes app.
                        </li>
                    </ul>
                </div>
            </aside>
        </div>
    );
}

export default PostPage;