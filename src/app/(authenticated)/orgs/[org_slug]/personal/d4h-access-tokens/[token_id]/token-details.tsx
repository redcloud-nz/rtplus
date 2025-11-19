/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { useRouter } from 'next/navigation'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { Lexington } from '@/components/blocks/lexington'
import { Hermes } from '@/components/blocks/hermes'
import { DeleteObjectIcon, DropdownMenuTriggerIcon, ToParentPageIcon } from '@/components/icons'
import { NotFound } from '@/components/nav/errors'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { S2_Button } from '@/components/ui/s2-button'
import { ButtonGroup } from '@/components/ui/button-group'
import { S2_Card, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Link } from '@/components/ui/link'
import { Paragraph } from '@/components/ui/typography'
import { S2_Value } from '@/components/ui/s2-value'

import { D4hAccessTokens, removeAccessToken, updateAccessToken } from '@/lib/d4h-access-tokens'
import { D4hClient} from '@/lib/d4h-api/client'
import { OrganizationData } from '@/lib/schemas/organization'
import { UserId } from '@/lib/schemas/user'
import { formatDateTime } from '@/lib/utils'
import * as Paths from '@/paths'
import { useEffect } from 'react'



export function Personal_D4hAccessTokens_Token_Details({ organization, userId, tokenId }: { organization: OrganizationData, userId: UserId, tokenId: string }) {
    const queryClient = useQueryClient()
    const router = useRouter()

    const { data: accessTokens = [] } = useQuery(D4hAccessTokens.queryOptions({ orgId: organization.orgId, userId: userId }))

    const accessToken = accessTokens.find(token => token.tokenId === tokenId)

    const whoamiQuery = useQuery({ ...D4hClient.whoami.queryOptions(accessToken!), enabled: !!accessToken })

    useEffect(() => {
        if(whoamiQuery.data != undefined) {
            updateAccessToken(userId, tokenId, {
                ...accessToken!,
                lastVerified: new Date().toISOString()
            })
        }
    }, [whoamiQuery.data])

    function handleDelete() {
        removeAccessToken(userId, tokenId)

        router.push(Paths.org(organization.slug).personal.d4hAccessTokens.href)

        queryClient.invalidateQueries({ queryKey: D4hAccessTokens.queryKey({ orgId: organization.orgId, userId: userId }) })
        queryClient.invalidateQueries({ queryKey: D4hClient.whoami.queryKey() })
    }

    return <Lexington.Column width="lg">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).personal.d4hAccessTokens }>
                        <ToParentPageIcon/> Access Token List
                    </Link>
                </S2_Button>
                <ButtonGroup>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <S2_Button variant="outline" size="icon">
                                <DropdownMenuTriggerIcon/>
                            </S2_Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                                    <DeleteObjectIcon/> Delete
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                </ButtonGroup>
            </Hermes.SectionHeader>
            {accessToken 
                ? <S2_Card>
                    <S2_CardHeader>
                        <S2_CardTitle>Access Token Details</S2_CardTitle>
                        <S2_CardDescription>ID: {accessToken.tokenId}</S2_CardDescription>
                    </S2_CardHeader>
                    <S2_CardContent>
                        <FieldGroup>
                            <Field orientation="responsive">
                                <FieldLabel>Label</FieldLabel>
                                {accessToken.label 
                                    ? <S2_Value value={accessToken.label} className="min-w-1/2"/> 
                                    : <S2_Value className="min-w-1/2" muted>No Label</S2_Value>
                                }
                            </Field>
                            <Field orientation="responsive">
                                <FieldLabel>Created At</FieldLabel>
                                <S2_Value value={formatDateTime(new Date(accessToken.createdAt))} className="min-w-1/2"/>
                            </Field>
                            <Field orientation="responsive">
                                <FieldLabel>Last Verified</FieldLabel>
                                <S2_Value value={formatDateTime(new Date(accessToken.lastVerified))} className="min-w-1/2"/>
                            </Field>
                            <Field orientation="responsive">
                                <FieldLabel>Valid</FieldLabel>
                                <S2_Value value={whoamiQuery.data ? "Yes" : "No"} className="min-w-1/2"/>
                            </Field>
                            <Field orientation="responsive">
                                <FieldLabel>Status</FieldLabel>
                                <S2_Value value={accessToken.status} className="min-w-1/2"/>
                            </Field>
                        </FieldGroup>
                    </S2_CardContent>
                </S2_Card> 
                : <NotFound/>
            }
        </Hermes.Section>

        
        { whoamiQuery.data && <>
            <Paragraph className="mt-6">This access token provides access to the following teams:</Paragraph>
            <Accordion type="multiple">
                {whoamiQuery.data.members.map(member => 
                    <AccordionItem key={member.id} value={member.id.toString()}>
                        <AccordionTrigger><div>{member.owner.title} <span className="ml-2 text-muted-foreground">({member.owner.id})</span></div></AccordionTrigger>
                        <AccordionContent>
                            <FieldGroup>
                                <Field orientation="responsive">
                                    <FieldLabel>D4H Member</FieldLabel>
                                    <S2_Value className="min-w-1/2">
                                        {member.name}<span className="ml-2 text-muted-foreground">({member.id})</span>
                                    </S2_Value>
                                </Field>
                                <FieldSet>
                                    <FieldLegend>Permissions</FieldLegend>
                                    <FieldGroup className="ml-2 gap-2">
                                        {Object.entries(member.permissions || {}).map(([key, permissions]) => {
                                            const permissionList = Object.entries(permissions).filter(([_, value]) => value).map(([permKey, _]) => permKey)

                                            if(permissionList.length === 0) return null

                                            return <Field key={key} orientation="responsive">
                                                <FieldLabel>{key}</FieldLabel>
                                                <S2_Value className="max-w-1/2 min-w-1/2 h-fit">
                                                    {permissionList.join(', ')}
                                                </S2_Value>
                                            </Field>
                                        })}
                                    </FieldGroup>
                                </FieldSet>
                            </FieldGroup>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </>}
    </Lexington.Column>
}