import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const supabase = createRouteHandlerClient({ cookies });

    // The sign-out function also clears the session cookie
    await supabase.auth.signOut();

    return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 });
}