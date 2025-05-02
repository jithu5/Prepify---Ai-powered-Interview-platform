// app/profile/page.tsx (or any React component)

"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import ProfileTabs from "@/components/ProfileTabs"


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

            <ProfileTabs />
        </div>
    )
}
