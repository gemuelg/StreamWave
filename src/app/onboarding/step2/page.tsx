// This is a server component by default
import { Suspense } from 'react';
import OnboardingStep2Content from './OnboardingStep2Content';

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingStep2Content />
        </Suspense>
    );
}