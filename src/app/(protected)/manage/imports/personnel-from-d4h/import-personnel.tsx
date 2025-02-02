/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import React from 'react'

import { Alert } from '@/components/ui/alert'
import { AsyncButton, Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Stepper } from '@/components/ui/stepper'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { D4hAccessKeyWithTeam, useD4hAccessKeysQuery } from '@/lib/api/d4h-access-keys'
import { fetchTeamMemberships } from '@/lib/api/teams'
import { changeCountsToString } from '@/lib/change-counts'
import { D4hListResponse, getD4hFetchClient } from '@/lib/d4h-api/client'
import { D4hMember, toTeamMembershipStatus } from '@/lib/d4h-api/member'
import { assertNonNull } from '@/lib/utils'

import { type ImportPersonnelActionResult, importPersonnelAction, type MemberDiff } from './import-personnel-action'
import { Show } from '@/components/show'



type ImportState = { status: 'Init' } | { status: 'Review', team: D4hAccessKeyWithTeam['team'], diffs: MemberDiff[] } | { status: 'Done', result: ImportPersonnelActionResult } | { status: 'Error', message: string, canRetry?: boolean }

export function ImportPersonnel() {    

    const accessKeysQuery = useD4hAccessKeysQuery()

    const [state, setState] = React.useState<ImportState>({ status: 'Init' })
    const [teamId, setTeamId] = React.useState<string>('')

    React.useEffect(() => {
        if(accessKeysQuery.data.length == 1) setTeamId(accessKeysQuery.data[0].team.id)
    }, [accessKeysQuery.data])

    async function handleFetch() {
        const accessKey = accessKeysQuery.data.find(key => key.team.id == teamId)
        assertNonNull(accessKey)

        let d4hMembers: D4hMember[] = []
        try {
            const { data, error } = await getD4hFetchClient(accessKey).GET('/v3/{context}/{contextId}/members', { 
                params: {
                    path: { context: 'team', contextId: accessKey.team.d4hTeamId! },
                    query: { status: ['OPERATIONAL', 'NON_OPERATIONAL'] }
                }
            })
            if(error) {
                setState({ status: 'Error', message: ''+error})
                return
            }
            d4hMembers = (data as D4hListResponse<D4hMember>).results
        } catch(ex) {
            setState({ status: 'Error', message: ''+ex })
        }
    
        const teamMemberships = await fetchTeamMemberships(teamId)

        const diffs: MemberDiff[] = []

        for(const d4hMember of d4hMembers) {
            const d4hStatus = toTeamMembershipStatus(d4hMember.status)

            const savedMember = teamMemberships.find(member => member.d4hInfo?.d4hMemberId == d4hMember.id)

            if(savedMember) {
                // Already exists, check if updates are required
                const fields: MemberDiff['fields'] = {}
                if(d4hMember.name != savedMember.person.name) fields.name = d4hMember.name
                if(d4hMember.email.value != savedMember.person.email) fields.email = d4hMember.email.value
                if(savedMember.d4hInfo == null || d4hMember.position != savedMember.d4hInfo.position) fields.position = d4hMember.position
                if(savedMember.d4hInfo == null ||d4hMember.ref != savedMember.d4hInfo.d4hRef) fields.d4hRef = d4hMember.ref
                if(savedMember.d4hInfo == null || d4hStatus != savedMember.d4hInfo.d4hStatus) fields.d4hStatus = d4hStatus

                if(Object.keys(fields).length > 0) {
                    diffs.push({ type: 'Update', d4hMemberId: d4hMember.id, name: savedMember.person.name, membershipId: savedMember.id, personId: savedMember.person.id, fields })
                }
            } else {
                // New member
                diffs.push({ type: 'Create', d4hMemberId: d4hMember.id, name: d4hMember.name, fields: {
                    name: d4hMember.name,
                    email: d4hMember.email.value,
                    position: d4hMember.position,
                    d4hRef: d4hMember.ref,
                    d4hStatus: d4hStatus,
                } })
            }
        }

        // TODO Support Members removed from D4H

        setState({ status: 'Review', team: accessKey.team,  diffs })
    }

    function handleCancel() {
        setState({ status: 'Init' })
    }

    async function handleApply() {
        if(state.status == 'Review') {
            const result = await importPersonnelAction(teamId, state.diffs)
            setState({ status: 'Done', result })
        }
    }

    return <>
        <Stepper 
            activeStep={['Init', 'Review', 'Done'].indexOf(state.status)}
            steps={[
                { name: "Select Team" },
                { name: "Review Changes" },
                { name: "Execute" }
            ]}
        />

        <div className="my-4 space-y-4">
            {state.status == 'Init' && 
                accessKeysQuery.isSuccess ? <Show  
                    when={accessKeysQuery.data.length > 0}
                    fallback={<Alert severity="info" title="No personal access keys defined."/>}
                >
                    <Select value={teamId} onValueChange={setTeamId}>
                        <SelectTrigger className="max-w-md">
                            <SelectValue placeholder="Select a team to import..."/>
                        </SelectTrigger>
                        <SelectContent>
                            {accessKeysQuery.data.map(accessKey =>
                                <SelectItem key={accessKey.id} value={accessKey.team.id}>{accessKey.team.name}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <AsyncButton
                        onClick={handleFetch}
                        label="Fetch"
                        pending="Fetching"
                        done="Fetched"
                        disabled={!teamId}
                    />
                </Show> 
                : <>    
                    <div>Loading...</div>
                </>}

            {state.status == 'Review' && <>
                <div className="text-sm">{`The following changes to team '${state.team.name}' will be applied:`}</div>
                <Table border>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell className="text-center">Change Type</TableHeadCell>
                            <TableHeadCell className="text-center">D4H Member ID</TableHeadCell>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Fields</TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {state.diffs.map((diff, index) => 
                            <TableRow key={index}>
                                <TableCell className="text-center">{diff.type}</TableCell>
                                <TableCell className="text-center">{diff.d4hMemberId}</TableCell>
                                <TableCell>{diff.name}</TableCell>
                                <TableCell>
                                    <div className="grid grid-cols-[60px_auto] gap-x-2">
                                        {Object.entries(diff.fields).map(([key, value]) => 
                                            <React.Fragment key={key}>
                                                <div className="justify-self-end">{key}:</div>
                                                <div>{value}</div>
                                            </React.Fragment>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex gap-2">
                    <AsyncButton
                        onClick={handleApply}
                        label="Apply Changes"
                        pending="Applying"
                        done="Complete"
                    />
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
            </>}
            
            { state.status == 'Done' && <div className="my-2">
                <div>Import completed in {state.result.elapsedTime}ms:</div>
                <div>Personnel: {changeCountsToString(state.result.changeCounts.personnel)}</div>
                <div>Memberships: {changeCountsToString(state.result.changeCounts.memberships)}</div>
            </div>}
            {state.status == 'Error' && <>
                <Alert severity="error" title={state.message}/>
            </>}
        </div>
    </>
}

