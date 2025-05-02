"use client"
import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import InterviewTab from './InterviewTab'
import PostTab from './PostTab'

function ProfileTabs() {
    const [tab, setTab] = useState<string>("interviews")
    return (
        <>
            {/* Tabs */}
            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="interviews">Mock Interviews</TabsTrigger>
                    <TabsTrigger value="community">Community</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>

                {/* Interview Tab */}
                <TabsContent value="interviews">
                    <InterviewTab />
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community">
                    <PostTab />
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
