/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/users/[user_id]
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { auth, User } from '@clerk/nextjs/server'

import { Lexington } from '@/components/blocks/lexington'
import { ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardAction, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Link } from '@/components/ui/link'
import { S2_Value } from '@/components/ui/s2-value'

import { formatDate, TITLE_SEPARATOR } from '@/lib/utils'
import * as Paths from '@/paths'
import { getClerkClient } from '@/server/clerk'
import { getOrganization } from '@/server/organization'
import { Hermes } from '@/components/blocks/hermes'




const fetchUser = cache(async (userId: string) => {
    const clerkClient = getClerkClient()
    
    try {
        return await clerkClient.users.getUser(userId)
    } catch(error) {
        console.log(error)
        notFound()
    }
})


export async function getMetadata(props: PageProps<'/orgs/[org_slug]/admin/users/[user_id]'>): Promise<Metadata> {
    const { org_slug: orgSlug, user_id: userId } = await props.params
    
    const user = await fetchUser(userId)
    return {
        title: `${user.fullName} ${TITLE_SEPARATOR} Users`
    }

}


export default async function AdminModule_User_Page(props: PageProps<'/orgs/[org_slug]/admin/users/[user_id]'>) {
    const { org_slug: orgSlug, user_id: userId } = await props.params
    const organization = await getOrganization(orgSlug)
    
    auth.protect({ role: 'org:admin' })

    const clerkClient = getClerkClient()
    const user: User = await fetchUser(userId)

    const { data: memberships } = await clerkClient.users.getOrganizationMembershipList({ userId, limit: 1000})

    const membership = memberships.find(m => m.organization.id === organization.orgId)
    if(!membership) notFound()

    return <Lexington.Root>
        <Lexington.Header/>
        <Lexington.Page>
            <Lexington.Column width="lg">
                <Hermes.Section>
                    <Hermes.SectionHeader>
                        <Hermes.BackButton to={Paths.org(organization.slug).admin.users}>
                            Users List
                        </Hermes.BackButton>
                    </Hermes.SectionHeader>

                    <S2_Card>
                        <S2_CardHeader>
                            <S2_CardTitle>{user.fullName}</S2_CardTitle>
                            <S2_CardDescription>{user.id}</S2_CardDescription>
                            <S2_CardAction>
                                <img src={user.imageUrl} alt={`${user.fullName}'s profile image`} className="rounded-full w-12 h-12"/>
                            </S2_CardAction>
                        </S2_CardHeader>
                        <S2_CardContent>
                            <FieldGroup>
                                <Field orientation="responsive">
                                    <FieldLabel>Email</FieldLabel>
                                    <S2_Value>
                                        {user.primaryEmailAddress
                                            ? <>{user.primaryEmailAddress.emailAddress} <span className="text-muted-foreground ml-2">({user.primaryEmailAddress.verification?.status})</span></>
                                            : <span className="text-muted-foreground">None</span>
                                        }
                                    </S2_Value>
                                </Field>
                                <Field orientation="responsive">
                                    <FieldLabel>Organisation Role</FieldLabel>
                                    <S2_Value value={membership.role == 'org:admin' ? 'Admin' : 'Member'}/>
                                </Field>
                                <Field orientation="responsive">
                                    <FieldLabel>Joined</FieldLabel>
                                    <S2_Value value={membership.createdAt ? formatDate(new Date(membership.createdAt)) : 'Unknown'}/>
                                </Field>
                            </FieldGroup>
                        </S2_CardContent>
                    </S2_Card>
                </Hermes.Section>
                
                
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}