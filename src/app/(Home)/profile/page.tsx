'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
    firstname: string;
    lastname: string;
    phonenumber: string;
    email: string;
}

interface InterviewSession {
    id: string;
    createdAt: string;
    questionsCount: number;
    answeredCount: number;
}

const ProfilePage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [sessions, setSessions] = useState<InterviewSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const userRes = await axios.get('/api/user');
                const sessionRes = await axios.get('/api/auth/session');

                setUser(userRes.data.user);
                // setSessions(sessionRes.data.sessions);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pt-36 pb-20 px-6 md:px-24">
            <h1 className="text-4xl font-bold mb-10 text-gray-800">👤 Your Profile</h1>

            {/* Profile Info */}
            <Card className="mb-12 shadow-md border border-slate-200">
                <CardContent className="p-8 space-y-6">
                    <h2 className="text-2xl font-semibold text-slate-700">User Information</h2>
                    {loading ? (
                        <Skeleton className="h-24 w-full" />
                    ) : user ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-700">
                            <div>
                                <p className="text-sm text-slate-500">First Name</p>
                                <p className="font-medium">{user.firstname}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Last Name</p>
                                <p className="font-medium">{user.lastname}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Phone</p>
                                <p className="font-medium">{user.phonenumber}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-red-500">User data not available.</p>
                    )}
                </CardContent>
            </Card>

            {/* Interview History */}
            <h2 className="text-3xl font-semibold text-slate-800 mb-6">📜 Interview History</h2>
            {/* <div className="space-y-6">
                {loading ? (
                    <>
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </>
                ) : sessions.length === 0 ? (
                    <p className="text-slate-500 text-lg">You haven't attended any interviews yet.</p>
                ) : (
                    sessions.map((session) => (
                        <Card key={session.id} className="shadow-sm border border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-slate-500 text-sm">Session ID</p>
                                        <p className="font-medium">{session.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-sm">Date</p>
                                        <p className="font-medium">
                                            {new Date(session.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-sm">Answered</p>
                                        <p className="font-medium">{session.answeredCount} / {session.questionsCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div> */}
        </div>
    );
};

export default ProfilePage;
