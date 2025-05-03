"use client"
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onClose: () => void;
    email: string;
}

function PasswordChangeModal({ open, onClose, email }: Props) {
    const [password, setPassword] = useState('');
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Add your password change API call here
        try {
            const { data } = await axios.post('/api/auth/update-password', {
                email,
                password
            }, {
                headers: { 'Content-Type': "application/json" },
                withCredentials: true
            })
            if (data.success) {
                toast.success(data.message)
                router.push("/login")
                return
            }
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || "Server erro in updating password";
            toast.error(errMsg)
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="px-8 py-10 sm:max-w-md rounded-2xl shadow-xl">
                <DialogHeader className="text-center space-y-1">
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                        Set New Password
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        Set a new password for your account associated with{' '}
                        <span className="font-medium text-gray-800">{email}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5 flex flex-col items-center w-full"
                >
                    <div className="w-full">
                        <label
                            htmlFor="password"
                            className="block mb-2 text-sm font-medium text-gray-700"
                        >
                            New Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="default"
                        className="w-full py-3 text-base font-medium rounded-lg mt-2"
                    >
                        Update Password
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default PasswordChangeModal;
