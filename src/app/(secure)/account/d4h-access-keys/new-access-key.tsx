'use client'

import { PlusIcon } from 'lucide-react'
import React from 'react'

import Alert from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Text } from '@/components/ui/text'

import { D4hFetchClient } from '@/lib/d4h-api/client'
import { D4hWhoami } from '@/lib/d4h-api/whoami'

import { createAccessKey } from './actions'
import { SubmitButton, SubmitButtonLabel } from '@/components/ui/submit-button'
import { assertNonNull } from '@/lib/utils'


type FormState = { key: string, label: string, primary: boolean, memberId: number | null }
const defaultFormState: FormState = { key: "", label: "", primary: true, memberId: null }

type Validation = { status: 'Init' } | { status: 'Error', message: string } | { status: 'Success', data: D4hWhoami }

export function NewAccessKeyDialog() {
    const [open, setOpen] = React.useState(false)
    const [formState, setFormState] = React.useState<FormState>(defaultFormState)
    const [validation, setValidation] = React.useState<Validation>({ status: 'Init'})


    function handleOpenChange(newValue: boolean) {
        if(newValue) setOpen(true)
        else handleClose()
    }

    function handleClose() {
        setOpen(false)
        setFormState(defaultFormState)
        setValidation({ status: 'Init' })
    }

    async function handleValidate() {

        // Check that the access key allows us to connect to D4H.
        const { data, error } = await D4hFetchClient.GET('/v3/whoami', { headers: { Authorization: `Bearer ${formState.key}` }})

        if(error) {
            setValidation({ status: 'Error', message: error })
        }
        if(data) {
            setValidation({ status: 'Success', data: data as D4hWhoami })
        }
    }


    async function handleSave() {
        if(validation.status == 'Success' && formState.memberId != null) {

            const member = validation.data.members.find(member => member.id == formState.memberId)
            assertNonNull(member, "Selected member must exist in member list.")
            const team = member.owner

            await createAccessKey({ ...formState, teamId: team.id, teamName: team.title, memberId: formState.memberId })

            handleClose()
        }
    }

    function toggleSelected(memberId: number) {
        console.log(`toggleSelected(${memberId})`)
        setFormState({...formState, memberId: formState.memberId == memberId ? null : memberId})
    }

    return <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
            <Button><PlusIcon/> Add Key</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Access Key</DialogTitle>
                <DialogDescription>Add a new D4H access key.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="accessKey">Access Key</Label>
                    <Input id="accessKey" value={formState.key} onChange={ev => setFormState({...formState, key: ev.target.value})}/>
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="label">Label</Label>
                    <Input id="label" value={formState.label} onChange={ev => setFormState({...formState, label: ev.target.value})}/>
                </div>
                <div className="items-top flex space-x-2">
                    <Checkbox id="primary" checked={formState.primary} onCheckedChange={(newValue) => setFormState({...formState, primary: newValue === true})}/>
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="primary">Primary</Label>
                        <p className="text-sm text-muted-foreground">
                            Mark this key as your primary access key.
                        </p>
                    </div>
                </div>
                {validation.status == 'Error' && <Alert severity="error" title={validation.message}/>}
                {validation.status == 'Success' && <>
                    <Text className="mt-8 mb-4">Found memberships to the following teams. Please select the one you would like to use with this access key.</Text>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell className="text-right">ID</TableHeadCell>
                                <TableHeadCell>Title</TableHeadCell>
                                <TableHeadCell className="text-center">Permissions</TableHeadCell>
                                <TableHeadCell className="text-center">Use</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                                {validation.data.members
                                    .filter(member => member.owner.resourceType == 'Team')
                                    .map(member =>
                                        <TableRow key={member.id}>
                                            <TableCell className="text-right">{member.owner.id}</TableCell>
                                            <TableCell>{member.owner.title}</TableCell>
                                            <TableCell className="text-center">{member.permissions ? 'YES' : 'NO'}</TableCell>
                                            <TableCell className="text-current">
                                                <Checkbox
                                                    checked={formState.memberId == member.id}
                                                    onCheckedChange={() => toggleSelected(member.id)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                    </Table>
                </>}
            </div>
            <DialogFooter>
                {(validation.status == 'Init' || validation.status == 'Success') && <Button onClick={handleClose} variant="ghost">Cancel</Button>}
                {validation.status == 'Init' && <SubmitButton 
                    onClick={handleValidate} 
                    disabled={formState.key.length == 0}   
                >
                    <SubmitButtonLabel activeState="ready">Validate</SubmitButtonLabel>
                    <SubmitButtonLabel activeState="pending">Validating</SubmitButtonLabel>
                </SubmitButton>}
                {validation.status == 'Success' && <SubmitButton 
                    onClick={handleSave} 
                    disabled={formState.memberId == null}
                >
                    <SubmitButtonLabel activeState="ready">Save</SubmitButtonLabel>
                    <SubmitButtonLabel activeState="pending">Saving</SubmitButtonLabel>
                </SubmitButton>}
            </DialogFooter>
        </DialogContent>
    </Dialog>
}