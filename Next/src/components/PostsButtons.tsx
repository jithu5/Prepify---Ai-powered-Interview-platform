import React from 'react'
import { Button } from './ui/button'
import { MessageCircleMore, ThumbsUp } from 'lucide-react'
import { Post } from './CommunityPosts'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Props{
    isExpanded:boolean,
    post:Post,
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    setPosts:React.Dispatch<React.SetStateAction<Post[]>>
}

function PostsButtons({ isExpanded, post, setIsExpanded, setPosts }:Props) {
    const {data:session}= useSession()
    const router = useRouter()

    const handleToggle = () => {
        setIsExpanded(prev => !prev);
    };

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
            toast.error("Failed to like post");
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
              <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 py-2 text-sm"
                  onClick={handleToggle}
              >
                  {isExpanded ? 'Show Less' : 'Read More'}
              </Button>
              <div className='flex items-center justify-center gap-2'>
                  <p className='text-stone-700 text-md cursor-pointer' onClick={() => router.push(`/community/${post.id}`)}>View</p>
                  <MessageCircleMore />
                  {post.comments.length}
                comments
              </div>
              <button
                  className='flex items-center gap-1'
              >
                  <ThumbsUp onClick={() => addLike(post.id)} className={`transition cursor-pointer ${session?.user?.id && post.likes.includes(session.user.id) ? 'fill-red-500' : ''}`} />
                  <span className="text-sm">{post.likes.length} Likes</span>
              </button>
          </div>
    </>
  )
}

export default PostsButtons
