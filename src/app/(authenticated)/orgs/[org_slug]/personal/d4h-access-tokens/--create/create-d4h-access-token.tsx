/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { match } from 'ts-pattern'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { S2_Input } from '@/components/ui/s2-input'
import { ExternalLink } from '@/components/ui/link'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { Spinner } from '@/components/ui/spinner'
import { S2_Table, S2_TableBody, S2_TableCell, S2_TableHead, S2_TableHeader, S2_TableRow } from '@/components/ui/s2-table'
import { S2_Textarea } from '@/components/ui/s2-textarea'
import { Paragraph } from '@/components/ui/typography'

import { addAccessToken, D4hAccessTokenData, D4HAccessTokenId, D4hAccessTokens, d4hAccessTokenSchema } from '@/lib/d4h-access-tokens'
import { D4hServerCode, D4hServerList, getD4hServer } from '@/lib/d4h-api/servers'
import { D4hWhoami } from '@/lib/d4h-api/whoami'
import { getD4hFetchClient } from '@/lib/d4h-api/client'
import { OrganizationData } from '@/lib/schemas/organization'
import { UserId } from '@/lib/schemas/user'
import * as Paths from '@/paths'




const partialTokenObjectSchema = d4hAccessTokenSchema.omit({ createdAt: true, lastVerified: true, teams: true })

type PartialTokenObject = z.infer<typeof partialTokenObjectSchema> & { serverCode: D4hServerCode | '' }


export function Personal_CreateD4hAccessToken_Form({ organization, userId }: { organization: OrganizationData, userId: UserId }) {
    const queryClient = useQueryClient()
    const router = useRouter()

    const form = useForm<PartialTokenObject>({
        resolver: zodResolver(partialTokenObjectSchema),
        defaultValues: {
            tokenId: D4HAccessTokenId.create(),
            orgId: organization.orgId,
            value: '',
            label: '',
            status: 'Active'
        },
    })

    const [status, setStatus] = useState<'Ready' | 'Validating' | 'Valid' | 'Error' | 'Saving'>('Ready')
    const [message, setMessage] = useState<string | null>(null)
    const [whoamiData, setWhoamiData] = useState<D4hWhoami | null>(null)


    const server = getD4hServer(useWatch({ control: form.control, name: 'serverCode' })) ?? null
    const value = useWatch({ control: form.control, name: 'value' })

    const handleValidate = form.handleSubmit(async (formData) => {
        setStatus('Validating')
        
        const fetchClient = getD4hFetchClient(formData)
        const { data, error } = await fetchClient.GET('/v3/whoami')

        if(error) {
            setStatus('Error')
            setMessage(`Error validating access token: ${error}`)
            setWhoamiData(null)
            return
        } 
        if(data) {
            const whoamiData = data as D4hWhoami
            console.log('whoami data:', whoamiData)
            setWhoamiData(whoamiData)
            setStatus('Valid')
        }
    })

    async function handleSave() {
        setStatus('Saving')

        const tokenToSave: D4hAccessTokenData = {
            ...form.getValues(),
            createdAt: new Date().toISOString(),
            lastVerified: new Date().toISOString(),
            teams: whoamiData ? whoamiData.members.map(member => ({
                id: member.owner.id,
                name: member.owner.title,
            })) : [],
        }

        addAccessToken(userId, tokenToSave)

        queryClient.invalidateQueries({ queryKey: D4hAccessTokens.queryKey({ userId, orgId: organization.orgId }) })

        handleReset()
        router.push(Paths.org(organization.slug).personal.d4hAccessTokens.href)
    }

    function handleReset() {
        form.reset()
        setStatus('Ready')
        setMessage(null)
        setWhoamiData(null)
    }

    return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>Add D4H Access Token</S2_CardTitle>
            <S2_CardDescription>Add a personal D4H access token to enable access to your D4H data.</S2_CardDescription>
        </S2_CardHeader>
        <S2_CardContent>
            <form id="create-d4h-access-token-form" onSubmit={handleValidate}>
                <FieldGroup>
                    <Controller
                        name="serverCode"
                        control={form.control}
                        render={({ field, fieldState }) => 
                             <Field
                                orientation="responsive"
                                data-invalid={fieldState.invalid}
                            >
                                <FieldContent>
                                    <FieldLabel htmlFor="d4h-server-code">D4H Server Code</FieldLabel>
                                    <FieldDescription>Select the D4H server to use.</FieldDescription>
                                    { fieldState.invalid && <FieldError errors={[fieldState.error]}/> }
                                </FieldContent>
                                <S2_Select value={field.value ?? ''} onValueChange={field.onChange}>
                                    <S2_SelectTrigger id="d4h-server-code" className="min-w-1/2" aria-invalid={fieldState.invalid}>
                                        <S2_SelectValue placeholder="Select a D4H server..." />
                                    </S2_SelectTrigger>
                                    <S2_SelectContent>
                                        {D4hServerList.map(server => 
                                            <S2_SelectItem key={server.code} value={server.code}>
                                                {server.name}
                                            </S2_SelectItem>
                                        )}
                                    </S2_SelectContent>
                                </S2_Select>
                            </Field>
                        }
                    />

                    <Show when={server != null}>

                        <FieldSeparator/>

                        <Controller
                            name="value"
                            control={form.control}
                            render={({ field, fieldState }) => 
                                 <Field
                                    data-invalid={fieldState.invalid}
                                >
                                    <FieldContent>
                                        <FieldLabel htmlFor="d4h-access-token-value">Access Token</FieldLabel>
                                        <FieldDescription>Visit <ExternalLink href={server?.tokensUrl}>{server?.tokensUrl}</ExternalLink> to generate a personal access token.</FieldDescription>
                                        { fieldState.error && <FieldError errors={[fieldState.error]}/> }
                                    </FieldContent>
                                    <S2_Textarea
                                        id="d4h-access-token-value"
                                        placeholder="Paste generated token here..."
                                        value={field.value}
                                        onChange={field.onChange}
                                        aria-invalid={fieldState.invalid}
                                    />
                                </Field>
                            }
                        />

                      
                    </Show>

                    <Show when={value?.length > 0}>
                        <Controller
                            name="label"
                            control={form.control}
                            render={({ field, fieldState }) => 
                                <Field
                                    orientation="responsive"
                                    data-invalid={fieldState.invalid}
                                >
                                    <FieldContent>
                                        <FieldLabel htmlFor="d4h-access-token-label">Label (optional)</FieldLabel>
                                        <FieldDescription>Provide a label to help identify this access token later.</FieldDescription>
                                        { fieldState.error && <FieldError errors={[fieldState.error]}/> }
                                    </FieldContent>
                                    <S2_Input
                                        type="text"
                                        id="d4h-access-token-label"
                                        placeholder="Label for this access token..."
                                        className="min-w-1/2"
                                        value={field.value}
                                        onChange={field.onChange}
                                        aria-invalid={fieldState.invalid}
                                    />
                                </Field>
                            }
                        />

                        {match(status)
                            .with('Ready', 'Validating', () => <>
                                <Field orientation="horizontal">
                                    <S2_Button
                                        type="submit"
                                        form="create-d4h-access-token-form"
                                        disabled={status === 'Validating'}
                                    >
                                        {status === 'Validating' ? <><Spinner /> Validating...</> : 'Validate'}
                                    </S2_Button>
                                    <S2_Button
                                        variant="outline"
                                        type="button"
                                        onClick={handleReset}
                                    >Cancel</S2_Button>
                                </Field>
                                </>
                            )
                            .with('Valid', 'Saving', () => <>
                                <Paragraph className="text-sm">
                                    Access Token Verified. Memberships found for the following teams:
                                </Paragraph>
                                <S2_Table>
                                    <S2_TableHead>
                                        <S2_TableRow>
                                            <S2_TableHeader>Team ID</S2_TableHeader>
                                            <S2_TableHeader>Member ID</S2_TableHeader>
                                            <S2_TableHeader>Team Name</S2_TableHeader>
                                        </S2_TableRow>
                                    </S2_TableHead>
                                    <S2_TableBody>
                                        {whoamiData?.members.map(member => 
                                            <S2_TableRow key={member.id}>
                                                <S2_TableCell>{member.owner.id}</S2_TableCell>
                                                <S2_TableCell>{member.id}</S2_TableCell>
                                                <S2_TableCell>{member.owner.title}</S2_TableCell>
                                            </S2_TableRow>
                                        )}
                                    </S2_TableBody>
                                </S2_Table>

                                <Field orientation="horizontal">
                                    <S2_Button
                                        type="submit"
                                        form="create-d4h-access-token-form"
                                        disabled={status === 'Saving'}
                                        onClick={handleSave}
                                    >
                                        {status === 'Saving' ? <><Spinner /> Saving...</> : 'Save'}
                                    </S2_Button>
                                    <S2_Button
                                        variant="outline"
                                        type="button"
                                        disabled={status === 'Saving'}
                                        onClick={handleReset}
                                    >Cancel</S2_Button>
                                </Field>
                                        
                            </>)
                            .with('Error', () => <>
                                <Alert severity="error" title={message ?? 'Error'}/>
                            </>)
                            .exhaustive()
                        }

                      
                        
                    </Show>
                   
                </FieldGroup>
            </form>
        </S2_CardContent>
    </S2_Card>
}