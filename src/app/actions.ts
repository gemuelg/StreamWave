// src/app/actions.ts
"use server";

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function handleSignIn(prevState: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        return { error: 'Username and password are required.' };
    }

    const supabase = createServerSupabaseClient();

    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', username.toString())
            .single();

        if (profileError || !profile) {
            return { error: 'Invalid username or password.' };
        }

        const userEmail = profile.email;

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: password.toString(),
        });

        if (signInError) {
            return { error: 'Invalid username or password.' };
        }
    } catch (err) {
        console.error('Sign-in action error:', err);
        return { error: 'An unexpected error occurred. Please try again.' };
    }

    redirect('/');
}

export async function handleSignUp(prevState: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
    const email = formData.get('email');
    const username = formData.get('username');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!email || !username || !password || !confirmPassword) {
        return { error: 'All fields are required.' };
    }
    
    if (password.toString().length < 6) {
        return { error: 'Password must be at least 6 characters.' };
    }
    
    if (password !== confirmPassword) {
        return { error: 'Passwords do not match.' };
    }

    const supabase = createServerSupabaseClient();

    try {
        const { data: existingUser } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('username', username.toString())
            .maybeSingle();

        if (existingUser) {
            return { error: 'Username is already taken. Please choose another.' };
        }
        
        const { error: signUpError } = await supabase.auth.signUp({ 
            email: email.toString(), 
            password: password.toString(),
            options: {
                data: {
                    username: username.toString()
                }
            }
        });

        if (signUpError) {
            return { error: signUpError.message || 'An unexpected error occurred during sign up.' };
        }
        
        return { error: null };
        
    } catch (err) {
        console.error("Sign-up action error:", err);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}