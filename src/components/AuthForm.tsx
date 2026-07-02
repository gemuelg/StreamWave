"use client";

import React, { useState, useEffect } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { UserIcon, LockClosedIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { handleSignIn, handleSignUp } from '@/app/actions';
import { supabase } from '@/lib/supabaseClient';

const SubmitButton = ({ isRegistering }: { isRegistering: boolean }) => {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold tracking-widest uppercase text-white rounded-xl group bg-gradient-to-br from-purple-600 via-cyan-500 to-blue-500 transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)] transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
            type="submit"
            disabled={pending}
        >
            <span className="w-full relative flex items-center justify-center px-6 py-3.5 transition-all ease-in duration-200 bg-[#040406]/90 rounded-[10px] group-hover:bg-opacity-0">
                {pending ? (
                    <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="font-mono tracking-wider text-zinc-400 normal-case">Syncing Core...</span>
                    </div>
                ) : isRegistering ? (
                    'Create Account'
                ) : (
                    'Access Deck'
                )}
            </span>
        </button>
    );
};

export default function AuthForm() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isSignUpAttempted, setIsSignUpAttempted] = useState(false); 
    
    const [signInState, signInFormAction] = useFormState(handleSignIn, { error: null });
    const [signUpState, signUpFormAction] = useFormState(handleSignUp, { error: null });

    const [email, setEmail] = useState('');
    const [authMessage, setAuthMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | 'warning' | ''>('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        if (isSignUpAttempted && signUpState.error === null) {
            setShowSuccessMessage(true);
        }
    }, [signUpState, isSignUpAttempted]);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setAuthMessage('Please catalog your target email credentials.');
            setMessageType('error');
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        });

        if (error) {
            setAuthMessage('An error occurred. Check your connection or deployment vectors.');
            setMessageType('error');
        } else {
            setAuthMessage('Password decryption link dispatched. Inspect your inbox.');
            setMessageType('success');
        }
    };

    const handleFormSubmission = (formData: FormData) => {
        if (isRegistering) {
            setIsSignUpAttempted(true);
            signUpFormAction(formData);
        } else {
            signInFormAction(formData);
        }
    };
    
    // TEXT INPUT INPUT STYLING MATRIX macro helper
    const inputClasses = "w-full py-3.5 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 font-sans text-sm backdrop-blur-sm";
    const iconWrapperClasses = "absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none";
    const inlineIconClasses = "h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-cyan-400";

    if (isForgotPassword) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden bg-[#040406]" style={{ backgroundImage: "url('/images/background.jpg')" }}>
                <div className="absolute inset-0 bg-[#040406]/85 backdrop-blur-lg z-0" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[120px] pointer-events-none z-0" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[120px] pointer-events-none z-0" />

                <div className="w-full max-w-md relative z-10 p-8 sm:p-10 bg-white/[0.02] backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-white/5 text-center">
                    <h2 className="text-2xl sm:text-3xl font-black text-center tracking-tight text-white mb-2">
                        Reset Password
                    </h2>
                    <p className="text-center text-sm text-zinc-400 mb-8 max-w-xs mx-auto">
                        Provide your registered email to process a secure verification fallback route.
                    </p>
                    
                    {authMessage && (
                        <div className={`mb-6 p-3.5 rounded-xl border text-xs font-mono tracking-wide ${messageType === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                            {authMessage}
                        </div>
                    )}
                    
                    <form onSubmit={handleForgotPassword} className="w-full space-y-5">
                        <div className="relative group">
                            <div className={iconWrapperClasses}>
                                <EnvelopeIcon className={inlineIconClasses} />
                            </div>
                            <input
                                className={inputClasses}
                                id="email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            className="w-full relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold tracking-widest uppercase text-white rounded-xl group bg-gradient-to-br from-purple-600 via-cyan-500 to-blue-500 transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)] transform hover:scale-[1.01] active:scale-[0.99]"
                            type="submit"
                        >
                            <span className="w-full relative flex items-center justify-center px-6 py-3.5 transition-all ease-in duration-200 bg-[#040406]/90 rounded-[10px] group-hover:bg-opacity-0">
                                Send Reset Link
                            </span>
                        </button>
                    </form>
                    
                    <div className="mt-8 pt-4 border-t border-white/5">
                        <button
                            className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-cyan-400 transition-colors duration-200"
                            onClick={() => setIsForgotPassword(false)}
                        >
                            ← Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (showSuccessMessage) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden bg-[#040406]" style={{ backgroundImage: "url('/images/background.jpg')" }}>
                <div className="absolute inset-0 bg-[#040406]/85 backdrop-blur-lg z-0" />
                
                <div className="w-full max-w-md relative z-10 p-8 sm:p-10 bg-white/[0.02] backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-white/5 text-center">
                    <div className="relative inline-flex items-center justify-center mb-6">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                        <CheckCircleIcon className="w-16 h-16 text-emerald-400 relative z-10" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                        Transmission Sent!
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                        A confirmation link has dropped into your inbox. Run account verification inside that file loop to authorize entry.
                    </p>
                    <button
                        className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-cyan-400 transition-colors duration-200 px-4 py-2 border border-white/5 hover:border-cyan-500/20 bg-white/[0.01] rounded-xl"
                        onClick={() => {
                            setShowSuccessMessage(false);
                            setIsRegistering(false);
                            setIsSignUpAttempted(false);
                            setEmail('');
                        }}
                    >
                        Return to Hub Entrance
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden bg-[#040406]" style={{ backgroundImage: "url('/images/background.jpg')" }}>
            <div className="absolute inset-0 bg-[#040406]/85 backdrop-blur-lg z-0" />
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[130px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[130px] pointer-events-none z-0" />

            <div className="w-full max-w-md relative z-10 p-8 sm:p-10 bg-white/[0.02] backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] border border-white/5">
                <h2 className="text-2xl sm:text-3xl font-black text-center tracking-tight text-white mb-2">
                    {isRegistering ? 'Create Your Account' : 'Welcome Back'}
                </h2>
                <p className="text-center text-sm text-zinc-400 mb-8 max-w-xs mx-auto">
                    {isRegistering ? 'Join StreamWave to unlock an absolute tier of media catalog assets.' : 'Deploy your profile credentials to access the streaming matrix.'}
                </p>

                {signInState?.error && (
                    <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center tracking-wide">
                        ⚠️ {signInState.error}
                    </div>
                )}
                {signUpState?.error && (
                    <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center tracking-wide">
                        ⚠️ {signUpState.error}
                    </div>
                )}

                <form action={handleFormSubmission} className="w-full space-y-4">
                    {isRegistering ? (
                        <>
                            <div className="relative group">
                                <div className={iconWrapperClasses}>
                                    <EnvelopeIcon className={inlineIconClasses} />
                                </div>
                                <input
                                    className={inputClasses}
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    required={isRegistering}
                                />
                            </div>
                            <div className="relative group">
                                <div className={iconWrapperClasses}>
                                    <UserIcon className={inlineIconClasses} />
                                </div>
                                <input
                                    className={inputClasses}
                                    id="username"
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <div className={iconWrapperClasses}>
                                    <LockClosedIcon className={inlineIconClasses} />
                                </div>
                                <input
                                    className={inputClasses}
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <div className={iconWrapperClasses}>
                                    <LockClosedIcon className={inlineIconClasses} />
                                </div>
                                <input
                                    className={inputClasses}
                                    id="confirm-password"
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="relative group">
                                <div className={iconWrapperClasses}>
                                    <UserIcon className={inlineIconClasses} />
                                </div>
                                <input
                                    className={inputClasses}
                                    id="username"
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <div className={iconWrapperClasses}>
                                    <LockClosedIcon className={inlineIconClasses} />
                                </div>
                                <input
                                    className={inputClasses}
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </>
                    )}
                    
                    <div className="pt-2">
                        <SubmitButton isRegistering={isRegistering} />
                    </div>
                </form>

                <div className="mt-8 text-center space-y-3 pt-4 border-t border-white/5">
                    <div>
                        <button
                            className="text-xs text-zinc-400 hover:text-white font-medium transition-colors duration-200"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setIsSignUpAttempted(false);
                                setShowSuccessMessage(false);
                            }}
                        >
                            {isRegistering ? (
                                <>Already have an account? <span className="text-cyan-400 hover:underline">Sign In</span></>
                            ) : (
                                <>New to the platform? <span className="text-cyan-400 hover:underline">Register Now</span></>
                            )}
                        </button>
                    </div>
                    {!isRegistering && (
                        <div>
                            <button
                                className="text-xs font-mono tracking-wide text-zinc-500 hover:text-purple-400 transition-colors duration-200"
                                onClick={() => setIsForgotPassword(true)}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}