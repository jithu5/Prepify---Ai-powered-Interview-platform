// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        console.log(session)
    
        const userId = session?.user.id;
        if (!userId) {
            return NextResponse.json({ error: 'No session found' }, { status: 401 });
        }
    
        const user = await prisma.user.findFirst({
            where:{
                id:userId
            },
            select:{
                is_account_verified:true,
                email:true
            }
        })
    
        if (user?.is_account_verified) {
            return NextResponse.json({success:true,user:user},{status:200})
        }else{
            return NextResponse.json({ error: 'Account not verified' }, { status: 403 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }
}
