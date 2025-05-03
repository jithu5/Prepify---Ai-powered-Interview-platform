"use client"
import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import InterviewTab from './InterviewTab'
import PostTab from './PostTab'
import { User } from '@/app/(Home)/profile/page'
import AnswersTab from './AnswersTab'
export interface ProfileProps {
    setProfileData: React.Dispatch<React.SetStateAction<User | undefined>>
}
function ProfileTabs({setProfileData}:ProfileProps) {
    const [tab, setTab] = useState<string>("interviews")
    return (
        <>
            {/* Tabs */}
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="interviews">Mock Interviews</TabsTrigger>
                    <TabsTrigger value="community">Community</TabsTrigger>
                    <TabsTrigger value="answers">Answers</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>

                {/* Interview Tab */}
                <TabsContent value="interviews">
                    <InterviewTab setProfileData={setProfileData}/>
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community">
                    <PostTab setProfileData={setProfileData} />
                </TabsContent>

                {/* Answers Tab */}
                <TabsContent value="answers">
                    <AnswersTab setProfileData={setProfileData} />
                </TabsContent>

                {/* Saved Tab */}
                <TabsContent value="saved">
                    <p className="text-muted-foreground">No saved posts yet.</p>
                </TabsContent>
            </Tabs>
        </>
    )
}

export default ProfileTabs
