/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /onboarding
 */

import Image from 'next/image'

import { AppPage, AppPageContainer } from '@/components/app-page'

import { OnBoardingForm } from './onboarding-form'



export default function OnBoardingPage() {
    return <AppPageContainer slotProps={{headerControls: {hidden: true}}}>
        <AppPage label="Onboarding" variant="centered" className="gap-8">
            <Image
                className="dark:invert"
                src="/logo.svg"
                alt="RT+ logo"
                width={200}
                height={100}
                priority
            />
            <OnBoardingForm/>
        </AppPage>
    </AppPageContainer>
}


