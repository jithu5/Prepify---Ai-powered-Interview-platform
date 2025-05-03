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
import PasswordChangeModal from "./PasswordChangeModal";

interface Props {
    open: boolean;
    onClose: () => void;
    email: string;
    type: string
}

export default function OtpVerification({ open, onClose, email, type }: Props) {
    const [otp, setOtp] = useState<string>()
    const [openPasswordModal, setOpenPasswordModal] = useState<boolean>(false)
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
                // onClose()
                setOpenPasswordModal(true)

            }
            toast.error(data.message)
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || "Error in verifying email"
            toast.error(errMsg)
        } finally {
            setOtp("")
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="px-10 py-12 sm:max-w-md rounded-2xl shadow-lg">
                    <DialogHeader className="text-center space-y-2">
                        <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
                            Verify your email
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 w-[100%] text-center">
                            We've sent a 6-digit verification code to <span className="font-medium text-gray-800">{email}</span>.<br />
                            Please enter it below.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-8 flex justify-center flex-col items-center gap-1">
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
                    </form>
                </DialogContent>
            </Dialog>
            {openPasswordModal && <PasswordChangeModal open={openPasswordModal} onClose={() => setOpenPasswordModal(false)} email={email} />}
        </>
    )
}
