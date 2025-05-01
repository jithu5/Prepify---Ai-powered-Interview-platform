// app/profile/page.tsx (or any React component)

"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"


interface User {
    firstname: string
    lastname: string
    username: string
    is_account_verified: boolean
    email: string
    phonenumber: number
    AnswersLength: number
    AverageScore: number
}


const demoUser = {
    firstname: "Abijith",
    lastname: "Kumar",
    username: "abijithk",
    bio: "Aspiring full-stack dev & AI explorer 🚀",
    verified: true,
}

const demoStats = {
    mockCount: 12,
    avgScore: 82.6,
    answersGiven: 42,
    questionsPosted: 17,
}

const demoInterviews = [
    {
        id: "int1",
        type: "Backend",
        date: "2025-04-20",
        score: 85.2,
    },
    {
        id: "int2",
        type: "Frontend",
        date: "2025-03-10",
        score: 79.5,
    },
]

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

export default function ProfilePage() {
    const [tab, setTab] = useState<string>("interviews")
    const [profileData, setProfileData] = useState<User>()
    const [profileLoading, setProfileLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchUser = async () => {
            setProfileLoading(true)
            try {
                const { data } = await axios.get("/api/profile-user", {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                })

                if (data.success) {
                    toast.success(data.message)
                    setProfileData(data.user)
                    return
                }
                toast.error(data.message)
            } catch (error: any) {
                const errMsg = error?.response?.data?.message || "Server error in getting user data";
                toast.error(errMsg)
            }
            finally {
                setProfileLoading(false)
            }
        }

        fetchUser()
    }, [])

    if (profileLoading) {
        return (
            <div className="min-h-screen w-full">Loading</div>
        )
    }
    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6 mt-24 min-h-screen">
            {/* User Info */}
            <Card className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* <Avatar>
                        <AvatarImage src={demoUser.image} />
                        <AvatarFallback>
                            {demoUser.firstname[0]}
                            {demoUser.lastname[0]}
                        </AvatarFallback>
                    </Avatar> */}
                    <div>
                        <h2 className="text-xl font-semibold">
                            {profileData?.firstname} {profileData?.lastname}
                        </h2>
                        <p className="text-sm text-muted-foreground">@{profileData?.username}</p>
                        <p className="text-sm">{demoUser.bio}</p>
                    </div>
                </div>
                {demoUser.verified && <Badge variant="outline">Verified</Badge>}
            </Card>

            {/* Stats */}
            <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-2xl font-bold">{demoStats.mockCount}</p>
                    <p className="text-muted-foreground text-sm">Mock Interviews</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">
                        {Number(profileData?.AverageScore).toFixed(1)}%
                    </p>
                    <p className="text-muted-foreground text-sm">Avg Score</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{profileData?.AnswersLength || 0}</p>
                    <p className="text-muted-foreground text-sm">Answers Given</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{demoStats.questionsPosted}</p>
                    <p className="text-muted-foreground text-sm">Questions Posted</p>
                </div>
            </Card>

            {/* Tabs */}
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="interviews">Mock Interviews</TabsTrigger>
                    <TabsTrigger value="community">Community</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>

                {/* Interview Tab */}
                <TabsContent value="interviews">
                    {demoInterviews.map((int) => (
                        <Card key={int.id} className="p-4 my-2">
                            <h3 className="font-semibold">{int.type} Interview</h3>
                            <p className="text-sm text-muted-foreground">
                                Date: {formatDate(int.date)}
                            </p>
                            <p className="text-sm">Score: {int.score.toFixed(1)}%</p>
                            <Link
                                href={`/interview/${int.id}`}
                                className="text-blue-500 text-sm underline"
                            >
                                View Feedback
                            </Link>
                        </Card>
                    ))}
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community">
                    {demoPosts.map((post) => (
                        <Card key={post.id} className="p-4 my-2">
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                Posted on: {formatDate(post.date)}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {post.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-sm mt-2">❤️ {post.likes} likes</p>
                        </Card>
                    ))}
                </TabsContent>

                {/* Saved Tab */}
                <TabsContent value="saved">
                    <p className="text-muted-foreground">No saved posts yet.</p>
                </TabsContent>
            </Tabs>
        </div>
    )
}
