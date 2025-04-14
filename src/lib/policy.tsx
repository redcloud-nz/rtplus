/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


export interface Policy {
    name: string
    content: React.ReactNode
    version: number
    date: string
}

export type PolicyKeyType = keyof typeof Policies

export const Policies = {
    'terms-of-use': {
        name: 'Terms of Use',
        content: <>
            <p>{`'We have some terms and conditions of using this site. But we haven\'t figured out what they are yet.'`}</p>
        </>,
        version: 1,
        date: '2025-01-01',
    } satisfies Policy,
    'privacy': {
        name: 'Privacy Policy',
        content: <>
            <h2>Introduction</h2>
            <p>RT+ is committed to protecting your privacy and ensuring the security of your personal information. This privacy policy outlines how we collect, use, disclose, and safeguard your data when you access and interact with our website.</p>
            
            <p>TODO</p>


            <h2>Contact Us</h2>
            <p>If you have any questions or concerns regarding this privacy policy, please contact us at support@rtplus.nz</p>
        </>,
        version: 1,
        date: '2025-01-01',
    } satisfies Policy,
} as const

export function getPolicy(policyKey: PolicyKeyType) {
    return Policies[policyKey] as Policy
}