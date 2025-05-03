// app/profile/page.tsx (or any React component)
"use client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import ProfileTabs from "@/components/ProfileTabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export interface User {
    firstname: string
    lastname: string
    username: string
    is_account_verified: boolean
    email: string
    phonenumber: number
    Answerlength: number
    AverageScore: number
    questionLength:number
    mockInterviews:number
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
            <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md rounded-2xl">
            <div className="flex items-center gap-5">
                <Avatar className="h-14 w-14 border border-gray-200 shadow-sm">
                <AvatarFallback className="text-lg font-medium">
                    {profileData?.firstname?.[0]}
                    {profileData?.lastname?.[0]}
                </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-tight">
                    {profileData?.firstname} {profileData?.lastname}
                </h2>
                <p className="text-sm text-muted-foreground">@{profileData?.username}</p>
                {demoUser?.bio && (
                    <p className="text-sm text-gray-500">{demoUser.bio}</p>
                )}
                </div>
            </div>

            {profileData?.is_account_verified && (
                <Badge variant="outline" className="self-start sm:self-center text-green-700 border-green-300 bg-green-50">
                ✅ Verified
                </Badge>
            )}
            </Card>

            {/* Stats */}
            <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
                    <p className="text-2xl font-bold">{profileData?.mockInterviews}</p>
                    <p className="text-muted-foreground text-sm">Mock Interviews</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">
                        {Number(profileData?.AverageScore).toFixed(1)}%
                    </p>
                    <p className="text-muted-foreground text-sm">Avg Score</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{profileData?.Answerlength || 0}</p>
                    <p className="text-muted-foreground text-sm">Answers Given</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{profileData?.questionLength}</p>
                    <p className="text-muted-foreground text-sm">Questions Posted</p>
                </div>
            </Card>

            <ProfileTabs setProfileData={setProfileData}/>
        </div>
    )
}
