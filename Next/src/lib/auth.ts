import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials:{
                email:{
                    label:"Email",type:"text"
                },
                password:{
                    label:"Password",type:"password"
                }
            },
            async authorize(credentials){
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Missing email and password")
                }
                await prisma.$connect()
                try {

                    const user = await prisma.user.findUnique({
                       where:{
                        email:credentials.email
                       },
                       select:{
                        password:true,
                        id:true,
                        email:true,
                        firstname:true,
                        is_account_verified:true
                       }
                    })

                    if (!user) {
                        throw new Error("No user found")
                    }

                    const isValid = await bcrypt.compare(credentials.password,user.password)

                    if (!isValid) {
                        throw new Error("Invalid Password")
                    }

                    return{
                        id:user.id,
                        email:user.email,
                        name:user.firstname,
                        isAccountVerified:user.is_account_verified
                    }
                    
                } catch (error:unknown) {
                    if (error instanceof Error) {
                        console.error("Auth error:", error.message);
                        throw error;
                    }
                    throw new Error('An unexpected error occurred');
                }
                finally{
                    await prisma.$disconnect()
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name ; // Optionally add other fields to the token
                token.isAccountVerified = user.isAccountVerified
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session?.user) {
                session.user.id = token.id as string;  // Attach the token data to the session
                session.user.email = token.email as string;  // Optional: If you want to attach the email as well
                session.user.name = token.name as string;  // Optional: If you want to attach the name as well
                session.user.isAccountVerified = token.isAccountVerified as boolean
            }
            return session;
        },
    },

    pages:{
        signIn:"/login",
        error:"/login"
    },
    session:{
        strategy:"jwt",
        maxAge:30 * 24 * 60 * 60
    },
    secret:process.env.NEXTAUTH_SECRET
}