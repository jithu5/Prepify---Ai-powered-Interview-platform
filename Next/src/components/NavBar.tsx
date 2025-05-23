"use client"
import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import '@fontsource/titillium-web';
import '@fontsource-variable/quicksand';
import OtpVerification from "./OtpVerificatin"
import axios from "axios"
import { toast } from "sonner"

function NavBar() {
    const { data: session } = useSession()
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [sendingOtp, setSendingOtp] = useState<boolean>(false)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleModalOpen = async () => {
        setSendingOtp(true)
        try {
            const { data } = await axios.get("/api/auth/send-otp", {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            })

            if (data.success) {
                toast.success(data.message)
                setModalOpen(true)
                return
            }
            toast.error(data.message)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.message)
            }else{
                toast.error("Server error")
            }
        }
        finally {
            setSendingOtp(false)
        }
    }

    return (
        <nav className="w-full bg-white px-10 py-6 flex items-center justify-between fixed left-0 top-0 z-50 shadow-md">
            <Link href={'/'} className="cursor-pointer">
                <h1 className="text-xl md:text-3xl font-light text-black cursor-pointer" style={{
                    fontFamily: 'Titillium Web'
                }}>PREPIFY</h1>
            </Link>
            <div className="flex items-center gap-16">
                <Link href='/community' className="text-stone-700 font-semibold text-md hover:text-stone-900" style={{ fontFamily: 'Quicksand Variable' }}>pricing</Link>
                <Link href='/community' className="text-stone-700 font-semibold text-md hover:text-stone-900" style={{ fontFamily: 'Quicksand Variable' }}>community</Link>
                {
                    session?.user ? (
                        <>
                            <div className="relative" ref={menuRef}>
                                <div
                                    className="cursor-pointer"
                                    onClick={() => setMenuOpen((prev) => !prev)}
                                >
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                        <AvatarFallback>{session.user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg z-50 border border-gray-100 animate-fade-in">
                                        <ul className="py-2 text-sm text-gray-700">
                                            <li>
                                                <button
                                                    onClick={() =>{ router.push('/profile')
                                                        setMenuOpen(false)
                                                    }}
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-150"
                                                >
                                                    Profile
                                                </button>
                                            </li>
                                            <li>
                                                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-150">
                                                    Settings
                                                </button>
                                            </li>
                                            {session?.user && !session.user.isAccountVerified && (
                                                <li>
                                                    <button
                                                        disabled={sendingOtp}
                                                        onClick={handleModalOpen}
                                                        className={`w-full px-4 py-2 text-left transition-colors duration-150 ${sendingOtp
                                                                ? 'text-stone-300 cursor-not-allowed'
                                                                : 'hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        Verify Account
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <Button variant="default" className="text-lg px-8 py-4 cursor-pointer" onClick={() => signOut()}>
                                <LogOut size={20} />
                            </Button>
                        </>
                    ) : (
                        <Button variant="default" className="text-lg px-8 py-4 cursor-pointer" onClick={() => router.replace("/login")}>
                            Login
                        </Button>
                    )
                }
            </div>
            {modalOpen && session?.user && <OtpVerification open={modalOpen} onClose={() => setModalOpen(false)} email={session?.user.email} type="verify" />}
        </nav>
    )
}

export default NavBar
