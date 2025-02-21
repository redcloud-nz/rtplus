/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /onboarding/@modal/(..)policies/[policy-key]
 */

import { notFound } from 'next/navigation'

import { getPolicy, PolicyKeyType } from '@/lib/policy'

import { PolicyDialog } from './policy-dialog'

type Props = { params: Promise<{ 'policy-key': PolicyKeyType }> }


export default async function PolicyModal({ params }: Props) {
    const { 'policy-key': policyKey } = await params

    const policy = getPolicy(policyKey)
    if(!policy) notFound()

    return <PolicyDialog policy={policy} />
}