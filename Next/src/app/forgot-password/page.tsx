"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import OtpVerification from "@/components/OtpVerificatin";
import { emit } from "process";
import Email from "next-auth/providers/email";
import axios, { AxiosError } from "axios";

type FormValues = {
    email: string;
};

function ForgotPasswordPage() {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<FormValues>();
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("")

    const onSubmit = async (formData: FormValues) => {
        setEmail(formData.email)
        try {
            const { data } = await axios.post("/api/auth/forgot-password-send-otp", {
                email:formData.email
            }, { headers: { 'Content-Type': "application/json" }, withCredentials: true })
            if (data.success) {
                toast.success("✅ Password reset email sent to " + formData.email);
                setModalOpen(true)
                return
            }
            toast.error(data.message)

        } catch (err:AxiosError|unknown) {
            if (axios.isAxiosError(err)) {
                
                const errMsg = err?.response?.data?.message;
                toast.error(errMsg);
            }else{
                toast.error("Server error in submitting")
            }
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    Forgot Password?
                </h2>
                <p className="text-sm text-center text-gray-600 mb-6">
                    Enter your email and we'll send you a OTP to reset your password.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            {...register("email", { required: true })}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="you@example.com"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 text-lg"
                    >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>
            </div>
            {modalOpen && <OtpVerification open={modalOpen} onClose={() => setModalOpen(false)} email={email} type="update" />}
        </main>
    );
}

export default ForgotPasswordPage;
