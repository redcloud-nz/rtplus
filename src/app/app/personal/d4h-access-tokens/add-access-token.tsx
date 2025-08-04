/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import React from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Alert } from '@/components/ui/alert'
import { AsyncButton } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExternalLink } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Paragraph } from '@/components/ui/typography'

import { addAccessToken, D4hAccessTokenData } from '@/lib/d4h-access-tokens'
import { getD4hFetchClient } from '@/lib/d4h-api/client'
import { D4hServerCode, getD4hServer } from '@/lib/d4h-api/servers'
import { D4hWhoami } from '@/lib/d4h-api/whoami'

import { createUUID } from '@/lib/id'


type PartialTokenObject = Omit<D4hAccessTokenData, 'createdAt' | 'serverCode' | 'teams'> & { serverCode: D4hServerCode | '' }

function emptyTokenObject(): PartialTokenObject {
    return {
        id: createUUID(),
        value: '',
        label: '',
        serverCode: '',
    }
}

export interface NewAccessKeyDialogProps {
    children: React.ReactNode
}

export function AddAccessTokenDialog({ children }: NewAccessKeyDialogProps) {
    const queryClient = useQueryClient()

    const [open, setOpen] = React.useState(false)
    const [status, setStatus] = React.useState<'Ready' | 'Validating' | 'Valid' | 'Error'>('Ready')
    const [tokenObj, setTokenObj] = React.useState<PartialTokenObject>(emptyTokenObject())
    const [message, setMessage] = React.useState<string | null>(null)
    const [whoamiData, setWhoamiData] = React.useState<D4hWhoami | null>(null)

    function updateTokenObj(partial: Partial<PartialTokenObject>) {
        setTokenObj(prev => ({ ...prev, ...partial }))
    }

    function handleOpenChange(newValue: boolean) {
        setOpen(newValue)
        if(!newValue) {
            
            handleClose()
        }
    }

    function handleClose() {
        setTokenObj(emptyTokenObject())
        setStatus('Ready')
        setMessage(null)
        setWhoamiData(null)
        setOpen(false)
    }

    async function handleValidate() {

        if(tokenObj.serverCode == '') {
            setStatus('Error')
            setMessage("No server selected.")
            return
        }
        setStatus('Validating')

        const fetchClient = getD4hFetchClient(tokenObj as D4hAccessTokenData)
        const { data, error } = await fetchClient.GET('/v3/whoami')

        if(error) {
            setStatus('Error')
            setMessage("Error validating access token: "+error)
            return
        }
        if(data) {
            const whoamiData = (data as D4hWhoami)
            console.log(whoamiData)
            setStatus('Valid')
            setWhoamiData(whoamiData)
        }

        setStatus('Valid')
        
    }

    async function handleSave() {
        
        // Save token to local storage
        const tokenToSave: D4hAccessTokenData = { 
            ...tokenObj, 
            createdAt: new Date().toISOString(),
            serverCode: tokenObj.serverCode as D4hServerCode,
            teams: whoamiData?.members.map(member => ({ id: member.owner.id, name: member.owner.title })) ?? []
        }
        addAccessToken(tokenToSave)

        queryClient.invalidateQueries({ queryKey: ['d4h-access-tokens'] })

        handleClose()
    }

    const server = tokenObj.serverCode !== '' ? getD4hServer(tokenObj.serverCode) : null

    return <Dialog 
        open={open} 
        onOpenChange={handleOpenChange}
    >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add D4H Access Key</DialogTitle>
                <DialogDescription>Add a personal D4H access token to enable access to your D4H data.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Which D4H server is your team using?</Label>
                    <Select 
                        value={tokenObj.serverCode} 
                        onValueChange={(newValue) => updateTokenObj({ serverCode: newValue as D4hServerCode | '' })}
                        disabled={status != 'Ready'}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select server..."/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ap">Asia Pacific</SelectItem>
                            <SelectItem value="eu">Europe</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {tokenObj.serverCode && <>
                    <Paragraph className="text-sm">
                        To add a personal D4H access token, you need to visit the following URL and create a new token: <ExternalLink href={server?.tokensUrl}>{server?.tokensUrl}</ExternalLink>
                    </Paragraph>
                    
                    <div className='space-y-2'>
                        <Label>Access Token</Label>
                        <Textarea 
                            placeholder="Paste generated token here..."
                            value={tokenObj.value ?? ''}
                            onChange={(ev) => updateTokenObj({ value: ev.target.value })}
                            disabled={status != 'Ready'}
                        />
                    </div>
                </>}
                {tokenObj.value && <>
                    <div className="space-y-2">
                        <Label>Label (optional)</Label>
                        <Input 
                            placeholder="Label for this access token..."
                            value={tokenObj.label ?? ''}
                            onChange={(ev) => updateTokenObj({ label: ev.target.value })}
                            disabled={status != 'Ready'}
                        />
                    </div>
                    
                </>}

                {(status == 'Ready' || status == 'Validating') && <AsyncButton
                    label="Validate"
                    pending="Validating..."
                    done="Validated"
                    onClick={handleValidate}
                />}

                {status == 'Valid' && whoamiData && <>
                    <Paragraph className="text-sm">
                        Access Token Verified. Memberships found for the following teams.
                    </Paragraph>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell>Team ID</TableHeadCell>
                                <TableHeadCell>Member ID</TableHeadCell>
                                <TableHeadCell>Team Name</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {whoamiData.members.map(member => 
                                <TableRow key={member.id}>
                                    <TableCell>{member.owner.id}</TableCell>
                                    <TableCell>{member.id}</TableCell>
                                    <TableCell>{member.owner.title}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <AsyncButton
                        label="Save"
                        pending="Saving..."
                        done="Saved"
                        onClick={handleSave}
                    />
                </>}

                {status == 'Error' && <Alert severity="error" title={message ?? 'Error'}/>}
            </div>
            
        </DialogContent>
    </Dialog>
}

