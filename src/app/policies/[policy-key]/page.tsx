/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /policies/[policy-key]
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AppPage } from '@/components/app-page'
import * as Paths from '@/paths'
import { Policies, PolicyKeyType } from '@/lib/policy'


type Props = { params: Promise<{ 'policy-key': PolicyKeyType }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { 'policy-key': policyKey } = await params

    const policy = Policies[policyKey]

    if (!policy) {
        return {
            title: 'Not Found',
        }
    }

    return {    
        title: `${policy.name} | Policies`,
    }
}

export default async function PolicyPage({ params }: Props) {
    const { 'policy-key': policyKey } = await params

    const policy = Policies[policyKey]
    if(!policy) notFound()

    return <AppPage 
        breadcrumbs={[
            { label: 'Policies', href: Paths.policies.index },
        ]}
        label={policy.name}
        >
        <div className="flex flex-col gap-4 max-w-xl">
            <h1 className="text-3xl font-bold">{policy.name}</h1>
            {policy.content}
        </div>
    </AppPage>
}