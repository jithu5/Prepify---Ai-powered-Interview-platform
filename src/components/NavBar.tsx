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

function NavBar() {
    const { data: session } = useSession()
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

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

    return (
        <nav className="w-full bg-white px-10 py-6 flex items-center justify-between fixed left-0 top-0 z-50 shadow-md">
            <Link href={'/'} className="cursor-pointer">
                <h1 className="text-xl md:text-3xl font-light text-black cursor-pointer" style={{
                    fontFamily: 'Titillium Web'
                }}>PREPIFY</h1>
            </Link>
            <div className="flex items-center gap-10">
                {
                    session?.user ? (
                        <>
                            <div className="relative" ref={menuRef}>
                                <div className="cursor-pointer" onClick={() => setMenuOpen(prev => !prev)}>
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                        <AvatarFallback>{session.user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
                                        <ul className="py-2 text-sm text-gray-700">
                                            <li>
                                                <button className="w-full px-4 py-2 text-left hover:bg-gray-100">Account</button>
                                            </li>
                                            <li>
                                                <button className="w-full px-4 py-2 text-left hover:bg-gray-100">Settings</button>
                                            </li>
                                            <li>
                                                <button
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                                    onClick={() => signOut()}
                                                >
                                                    Logout
                                                </button>
                                            </li>
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
        </nav>
    )
}

export default NavBar
