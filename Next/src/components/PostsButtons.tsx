import React from 'react'
import { MessageCircleMore, ThumbsUp } from 'lucide-react'
import { Post } from './CommunityPosts'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import axios from 'axios'

interface Props {
    post: Post,
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>
}

function PostsButtons({ post, setPosts }: Props) {
    const { data: session } = useSession()
    const addLike = async (postId: string) => {
        if (!session?.user || !session?.user.id) {
            toast.error("Unauthorized")
            return
        }
        setPosts((prevPosts) =>
            prevPosts.map((post) => {
                if (post.id === postId) {
                    const hasLiked = post.likes.includes(session.user.id);
                    const updatedLikes = hasLiked
                        ? post.likes.filter(id => id !== session.user.id)
                        : [...post.likes, session.user.id];
                    return { ...post, likes: updatedLikes };
                }
                return post;
            })
        );


        try {
            const { data } = await axios.post(`/api/like-post`, { postId }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });

            if (!data.success) {
                throw new Error(data.message);
            }
            toast.success(data.message)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.message)
            } else {
                toast.error("Server error")
            }
            // Optionally revert
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id === postId) {
                        const hasLiked = post.likes.includes(session.user.id);
                        const updatedLikes = hasLiked
                            ? [...post.likes, session.user.id]
                            : post.likes.filter(id => id !== session.user.id);
                        return { ...post, likes: updatedLikes };
                    }
                    return post;
                })
            );
        }
    };
    return (
        <>
            <div className="flex items-center justify-between mt-4">

                <div className='flex items-center justify-center gap-2'>
                    <MessageCircleMore />
                    <p>{post.answers.length}{" "}
                        answers</p>
                </div>

                <button
                    className='flex items-center gap-1'
                >
                    <ThumbsUp onClick={(e) =>{e.stopPropagation() 
                        addLike(post.id)}} className={`transition cursor-pointer ${session?.user?.id && post.likes.includes(session.user.id) ? 'fill-red-500' : ''}`} />
                    <span className="text-sm">{post.likes.length} Likes</span>
                </button>
            </div>
        </>
    )
}

export default PostsButtons
