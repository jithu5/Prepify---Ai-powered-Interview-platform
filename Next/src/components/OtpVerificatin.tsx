"use client"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import TimeLeft from "./TimeLeft";
import { Input } from "./ui/input";

interface Props {
    open: boolean;
    onClose: () => void;
    email: string;
    type: string
}

export default function OtpVerification({ open, onClose, email, type }: Props) {
    const [otp, setOtp] = useState<string>()
    const [openPasswordModal, setOpenPasswordModal] = useState<boolean>(false)
    const [password, setPassword] = useState('');
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(otp)
        let endpoint;
        if (type.toLowerCase() === "verify") {
            endpoint = 'verify-email'
        } else {
            endpoint = 'forgot-password-verify-otp'
        }
        try {
            const { data } = await axios.post(`/api/auth/${endpoint}`, { otp: Number(otp), email: email }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (data.success) {
                toast.success(data.message)
                if (type.toLowerCase() === 'verify') {
                    router.push('/login')
                    return
                }
                setOpenPasswordModal(true)

            }
            toast.error(data.message)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.message)
            } else {
                toast.error("Server error")
            }
        } finally {
            setOtp("")
        }
    }

     const handlePasswordSubmit = async (e: React.FormEvent) => {
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
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    toast.error(error?.response?.data?.message)
                } else {
                    toast.error("Server error")
                }
            }
        };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="px-10 py-12 sm:max-w-md rounded-2xl shadow-lg">
                    <DialogHeader className="text-center space-y-2">
                        <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
                            {openPasswordModal ? " Set New Password" : "Verify your email"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 w-[100%] text-center">
                            {openPasswordModal ?" Set a new password for your account" : <>
                                We&apros; ve sent a 6-digit verification code to<span className="font-medium text-gray-800">{email}</span>.<br />
                           Please enter it below.
                           </>}
                    </DialogDescription>
                </DialogHeader>

               {!openPasswordModal? <form onSubmit={handleSubmit} className="space-y-8 flex justify-center flex-col items-center gap-1">
                    <div className="mt-6">

                        <InputOTP value={otp} onChange={(value) => setOtp(value)} maxLength={6} className="flex justify-center gap-2">
                            <InputOTPGroup>
                                {[0, 1, 2].map((i) => (
                                    <InputOTPSlot
                                        key={i}
                                        index={i}
                                        className="bg-gray-100 border border-gray-300 rounded-lg w-12 h-14 text-xl text-center"
                                    />
                                ))}
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                {[3, 4, 5].map((i) => (
                                    <InputOTPSlot
                                        key={i}
                                        index={i}
                                        className="bg-gray-100 border border-gray-300 rounded-lg w-12 h-14 text-xl text-center"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <TimeLeft open={open} onClose={onClose} />

                    <div className="mt-8 flex justify-center">
                        <Button variant="default" className="text-base px-8 py-3 rounded-lg">
                            Submit
                        </Button>
                    </div>
                </form>:
                        <form
                            onSubmit={handlePasswordSubmit}
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
                }
            </DialogContent>
        </Dialog >

        </>
    )
}
