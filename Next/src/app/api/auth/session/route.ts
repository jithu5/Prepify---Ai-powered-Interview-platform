// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (session?.user.id) {
        return NextResponse.json(session);
    }
    return NextResponse.json({ error: 'No session found' }, { status: 401 });
}
