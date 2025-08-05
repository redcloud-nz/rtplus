/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

import { AsyncButton, Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormControl, FormActions, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Heading } from '@/components/ui/typography'

import { D4hAccessTokens } from '@/lib/d4h-access-tokens'
import { D4hServerList, getD4hServer } from '@/lib/d4h-api/servers'
import { useTRPC } from '@/trpc/client'





export const configureTeamD4hFormSchema = z.object({
    teamId: z.string().uuid(),
    d4hTeamId: z.coerce.number().int(),
    serverCode: z.string(),
})

export type ConfigureTeamD4hFormData = z.infer<typeof configureTeamD4hFormSchema>


interface TeamD4hConfigDialogProps extends React.ComponentProps<typeof Dialog> {
    teamId: string
}

export function TeamD4hConfigDialog({ teamId, ...props }: TeamD4hConfigDialogProps) {
    const trpc = useTRPC()

    const teamQuery = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))
    const { data: accessTokens } = useSuspenseQuery(D4hAccessTokens.queryOptions())

    const mutation = useMutation(trpc.teams.updateTeamD4h.mutationOptions({}))

    const form = useForm<ConfigureTeamD4hFormData>({
        resolver: zodResolver(configureTeamD4hFormSchema),
        defaultValues: /*teamQuery.data?.d4hInfo ||*/ { teamId, d4hTeamId: 0, serverCode: 'ap' }
    })

    async function handleSave(formData: ConfigureTeamD4hFormData) {
        console.log("handleSave", formData)
        await mutation.mutateAsync(formData)
        if(props.onOpenChange) props.onOpenChange(false)
        
    }

    function handleReset(ev: React.MouseEvent) {
        ev.preventDefault()
        form.reset()

    }

    return <Dialog {...props}>
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>Configure Team D4H Integration</DialogTitle>
                <DialogDescription>

                </DialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
                <form className="space-y-4">
                    <FormField
                        control={form.control}
                        name="serverCode"
                        render={({ field }) => <FormItem>
                            <FormLabel>D4H Server</FormLabel>
                            <FormControl>
                                <Select value={field.value} onValueChange={(newValue) => field.onChange(newValue)}>
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {D4hServerList.map(server => 
                                            <SelectItem key={server.code} value={server.code}>{server.name}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>}
                    />
                    <FormField
                        control={form.control}
                        name="d4hTeamId"
                        render={({ field }) => <FormItem>
                            <FormLabel>D4H Team ID</FormLabel>
                            <FormControl>
                                <Input type="number" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>}
                    />
                    <FormActions>
                        <AsyncButton
                            label="Save"
                            pending="Saving..."
                            done="Saved"
                            onClick={form.handleSubmit(handleSave)}
                        />
                        <Button 
                            variant="ghost"
                            onClick={handleReset}
                            disabled={!form.formState.isDirty}
                        >Reset</Button>
                   </FormActions>
                   <Separator/>
                    <Heading level={3}>Suggestions</Heading>
                    <div>From your configured access tokens.</div>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>D4H Server</TableHeadCell>
                                <TableHeadCell className="text-center">D4H ID</TableHeadCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {accessTokens.map(token => token.teams.map(team =>
                               
                                <TableRow key={team.id}>
                                    <TableCell>{team.name}</TableCell>
                                    <TableCell>{getD4hServer(token.serverCode).name}</TableCell>
                                    <TableCell className="text-center">{team.id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </form>
            </FormProvider>
        </DialogContent>
    </Dialog>
}