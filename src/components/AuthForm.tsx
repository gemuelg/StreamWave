// src/components/AuthForm.tsx
"use client";

import React, { useState } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { UserIcon, LockClosedIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { handleSignIn, handleSignUp } from '@/app/actions';
import { supabase } from '@/lib/supabaseClient'; // Make sure this is the client-side client

const SubmitButton = ({ isRegistering }: { isRegistering: boolean }) => {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full bg-accentBlue text-white font-bold py-3 px-4 rounded-lg hover:bg-accentPurple transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accentBlue"
            type="submit"
            disabled={pending}
        >
            {pending ? 'Loading...' : isRegistering ? 'Register' : 'Sign In'}
        </button>
    );
};

export default function AuthForm() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    
    // Server Actions will handle all the logic, including form state
    const [signInState, signInFormAction] = useFormState(handleSignIn, { error: null });
    const [signUpState, signUpFormAction] = useFormState(handleSignUp, { error: null });

    // Handle success message for sign up
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    if (signUpState.error === null && isRegistering && !showSuccessMessage) {
        setShowSuccessMessage(true);
    }
    
    const [email, setEmail] = useState('');
    const [authMessage, setAuthMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | 'warning' | ''>('');
    
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        // This is still a client-side action
        if (!email) {
            setAuthMessage('Please enter your email address.');
            setMessageType('error');
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        });

        if (error) {
            setAuthMessage('An error occurred. Please try again or check your email address.');
            setMessageType('error');
        } else {
            setAuthMessage('Password reset link sent! Please check your email.');
            setMessageType('success');
        }
    };
    
    if (isForgotPassword) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/background.jpg')" }}>
                <div className="absolute inset-0 bg-black opacity-80 backdrop-blur-md"></div>
                <div className="w-full max-w-md relative z-10 p-8 sm:p-10 bg-primaryBg/70 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700">
                    <h2 className="text-3xl font-bold text-center text-textLight mb-2">
                        Reset Password
                    </h2>
                    <p className="text-center text-textMuted mb-8">
                        Enter your email to receive a password reset link.
                    </p>
                    {authMessage && (
                        <p className={`mb-4 text-center ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                            {authMessage}
                        </p>
                    )}
                    <form onSubmit={handleForgotPassword} className="w-full space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <EnvelopeIcon className="h-5 w-5 text-textMuted" />
                            </div>
                            <input
                                className="w-full py-3 pl-10 pr-4 rounded-lg bg-secondaryBg bg-opacity-70 text-textLight border border-transparent
                                            focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue transition-colors duration-200"
                                id="email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            className="w-full bg-accentBlue text-white font-bold py-3 px-4 rounded-lg hover:bg-accentPurple transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accentBlue"
                            type="submit"
                        >
                            {'Send Reset Link'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button
                            className="text-textMuted hover:text-accentBlue transition-colors duration-200"
                            onClick={() => setIsForgotPassword(false)}
                        >
                            Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (showSuccessMessage) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/images/background.jpg')" }}>
                <div className="absolute inset-0 bg-black opacity-80 backdrop-blur-md"></div>
                <div className="w-full max-w-md relative z-10 p-8 sm:p-10 bg-primaryBg/70 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 text-center">
                    <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-textLight mb-2">
                        Success!
                    </h2>
                    <p className="text-textMuted mb-8">
                        A confirmation link has been sent to your email. Please check your inbox and verify your account to sign in.
                    </p>
                    <button
                        className="text-textMuted hover:text-accentBlue transition-colors duration-200"
                        onClick={() => {
                            setShowSuccessMessage(false);
                            setIsRegistering(false);
                            setEmail('');
                            // You will not need the other state hooks as they are now handled by the server action
                            // setUsername('');
                            // setPassword('');
                            // setConfirmPassword('');
                            // setAuthMessage('');
                        }}
                    >
                        Back to Sign In
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/images/background.jpg')" }}>
            <div className="absolute inset-0 bg-black opacity-80 backdrop-blur-md"></div>

            <div className="w-full max-w-md relative z-10 p-8 sm:p-10 bg-primaryBg/70 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700">
                <h2 className="text-3xl font-bold text-center text-textLight mb-2">
                    {isRegistering ? 'Create Your Account' : 'Welcome Back'}
                </h2>
                <p className="text-center text-textMuted mb-8">
                    {isRegistering ? 'Join StreamWave to unlock a world of entertainment.' : 'Sign in to your account to continue.'}
                </p>

                {signInState?.error && (
                    <p className="mb-4 text-center text-red-500">{signInState.error}</p>
                )}
                {signUpState?.error && (
                    <p className="mb-4 text-center text-red-500">{signUpState.error}</p>
                )}

                <form action={isRegistering ? signUpFormAction : signInFormAction} className="w-full space-y-6">
                    {isRegistering && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <EnvelopeIcon className="h-5 w-5 text-textMuted" />
                            </div>
                            <input
                                className="w-full py-3 pl-10 pr-4 rounded-lg bg-secondaryBg bg-opacity-70 text-textLight border border-transparent
                                            focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue transition-colors duration-200"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Email address"
                                required={isRegistering}
                            />
                        </div>
                    )}
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <UserIcon className="h-5 w-5 text-textMuted" />
                        </div>
                        <input
                            className="w-full py-3 pl-10 pr-4 rounded-lg bg-secondaryBg bg-opacity-70 text-textLight border border-transparent
                                        focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue transition-colors duration-200"
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Username"
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <LockClosedIcon className="h-5 w-5 text-textMuted" />
                        </div>
                        <input
                            className="w-full py-3 pl-10 pr-4 rounded-lg bg-secondaryBg bg-opacity-70 text-textLight border border-transparent
                                        focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue transition-colors duration-200"
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                        />
                    </div>

                    {isRegistering && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <LockClosedIcon className="h-5 w-5 text-textMuted" />
                            </div>
                            <input
                                className="w-full py-3 pl-10 pr-4 rounded-lg bg-secondaryBg bg-opacity-70 text-textLight border border-transparent
                                            focus:outline-none focus:border-accentBlue focus:ring-1 focus:ring-accentBlue transition-colors duration-200"
                                id="confirm-password"
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                required={isRegistering}
                            />
                        </div>
                    )}
                    
                    <SubmitButton isRegistering={isRegistering} />
                </form>

                <div className="mt-6 text-center">
                    <button
                        className="text-textMuted hover:text-accentBlue transition-colors duration-200"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setShowSuccessMessage(false);
                            // These lines will now be unnecessary
                            // signInState.error = null;
                            // signUpState.error = null;
                        }}
                    >
                        {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register Now'}
                    </button>
                </div>
                {!isRegistering && (
                    <div className="mt-4 text-center">
                        <button
                            className="text-accentBlue hover:text-accentPurple transition-colors duration-200 text-sm"
                            onClick={() => setIsForgotPassword(true)}
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}