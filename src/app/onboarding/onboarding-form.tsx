/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AsyncButton } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Link } from '@/components/ui/link'

import { RTPlusLogger } from '@/lib/logger'
import * as Paths from '@/paths'

import { completeOnboardingAction } from './complete-onboarding-action'


const logger = new RTPlusLogger(OnBoardingForm)

export function OnBoardingForm() {

    const router = useRouter()
    
    const [termsAccepted, setTermsAccepted] = React.useState(false)
    const [privacyAccepted, setPrivacyAccepted] = React.useState(false)

    async function handleClick() {
        await completeOnboardingAction({
            policies: [
                { policyKey: 'terms-of-use', policyVersion: 1 },
                { policyKey: 'privacy', policyVersion: 1 },
            ]
        })
        logger.info('Onboarding complete')
        router.push("/")
    }

    return <Card>
        <CardHeader className="mb-4">
            <CardTitle>Complete Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center space-x-2">
                    <Checkbox id="acceptTermsAndConditions" checked={termsAccepted} onCheckedChange={(newValue) => setTermsAccepted(newValue == true)}/>
                    <Label htmlFor="acceptTermsOfUse">I accept the <Link className="text-indigo-500 font-semibold hover:underline" href={Paths.policies.policy('terms-of-use')}>Terms of Use</Link>.</Label>
                </div>
                <div className="flex item-center space-x-2">
                    <Checkbox id="acceptPrivacyPolicy" checked={privacyAccepted} onCheckedChange={(newValue) => setPrivacyAccepted(newValue == true)}/>
                    <Label htmlFor="acceptPrivacyPolicy">I have read and understood the <Link className="text-indigo-500 font-semibold hover:underline" href={Paths.policies.policy('privacy')}>Privacy Policy</Link>.</Label>
                </div>
            </div>
            <div className="flex justify-center">
                <AsyncButton 
                    disabled={!(termsAccepted && privacyAccepted)}
                    onClick={handleClick}
                    label="Complete"
                    pending="Updating..."
                    done="Complete"
                />
            </div>
            
        </CardContent>
        
    </Card>
}