'use client'

import _ from 'lodash'
import React from 'react'

import { useQueries } from '@tanstack/react-query'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { AsyncButton } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Description, Heading } from '@/components/ui/typography'

import { useD4hAccessKeys } from '@/lib/api/d4h-access-keys'
import { ChangeCounts } from '@/lib/change-counts'
import { getD4hApiQueryClient, getListResponseCombiner } from '@/lib/d4h-api/client'
import { BasicD4hMember, D4hMember } from '@/lib/d4h-api/member'
import * as Paths from '@/paths'

import { type SyncPersonnelActionResult, SyncSkillsActionResult, syncPersonnelAction, syncSkillsAction } from './actions'


export default function SyncPage() {    

    return <AppPage
        label="Synchronise Data"
        breadcrumbs={[{ label: "Manage", href: Paths.manage }]}
    >
        <PageHeader>
            <PageTitle>Synchronise</PageTitle>
            <PageDescription>Synchronise the database with outside or fixed data sources.</PageDescription>
        </PageHeader>

        <SyncPersonnelSection className="my-4 max-w-2xl space-y-4"/>
        <SyncSkillsSection className="my-4 max-w-2xl space-y-4"/>
    </AppPage>
}



function SyncPersonnelSection({ ...props }: React.ComponentPropsWithoutRef<'section'>) {

    const accessKeys = useD4hAccessKeys()

    const membersQuery = useQueries({
        queries: accessKeys.map(accessKey => 
            getD4hApiQueryClient(accessKey).queryOptions('get', '/v3/{context}/{contextId}/members',
                {
                    params: {
                        path: { context: 'team', contextId: accessKey.team.d4hTeamId },
                        query: { status: ['OPERATIONAL', 'NON_OPERATIONAL'] }
                    }
                }
            )
        ),
        combine: getListResponseCombiner<D4hMember>()
    })

    const [selectedTeams, setSelectedTeams] = React.useState<number[]>([])
    const [result, setResult] = React.useState<SyncPersonnelActionResult | null>(null)

    React.useEffect(() => {
        setSelectedTeams(accessKeys.map(accessKey => accessKey.team.d4hTeamId))
    }, [accessKeys])

    function handleSelectTeam(d4hTeamId: number, checked: boolean) {
        if(checked) setSelectedTeams(prev => [...prev, d4hTeamId])
    }

    async function handleSyncPersonnel() {
        const selectedTeamIds = accessKeys.filter(ac => selectedTeams.includes(ac.team.d4hTeamId)).map(ac => ac.team.id)

        const membersToSync: BasicD4hMember[] = membersQuery.data
            .filter(member => selectedTeams.includes(member.owner.id))
            .map(member => _.pick(member, ['id', 'email', 'name', 'owner', 'position', 'ref', 'status']))

        const returned = await syncPersonnelAction(selectedTeamIds, membersToSync)
        setResult(returned)
    }

    return <section {...props}>
        <Heading level={2}>D4H Personnel</Heading>
        <Description>Copy or update personnel from the following teams:</Description>
        
        <Table border>
            <TableHead>
                <TableRow>
                    <TableHeadCell></TableHeadCell>
                    <TableHeadCell>Name</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {accessKeys.map(accessKey => 
                    <TableRow key={accessKey.id}>
                        <TableCell>
                            <Checkbox 
                                checked={selectedTeams.includes(accessKey.team.d4hTeamId)}
                                onCheckedChange={(checked) => handleSelectTeam(accessKey.team.d4hTeamId, checked == true)}/>
                        </TableCell>
                        <TableCell>{accessKey.team.name}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>

        <AsyncButton 
            onClick={handleSyncPersonnel}
            label="Execute"
            pending="Executing"
        />
        { result && <div className="my-2">Sync completed in {result.elapsedTime}ms, {result.insertCount} personnel inserted, {result.updateCount} personnel updated </div>}
    </section>
}

function SyncSkillsSection({ ...props }: React.ComponentPropsWithoutRef<'section'>) {

    const [result, setResult] = React.useState<SyncSkillsActionResult | null>(null)

    async function handleSyncSkills() {
        const returned = await syncSkillsAction()
        setResult(returned)
    }

    function changeCountsToString(changeCounts: ChangeCounts) {
        return `${changeCounts.create} created, ${changeCounts.update} updated, ${changeCounts.delete} deleted.`
    }   
    
    return <section {...props}>
        <Heading level={2}>Skills</Heading>
        <Description>Copy or update skills from source code.</Description>
        <AsyncButton 
            onClick={handleSyncSkills}
            label="Execute"
            pending="Executing"
        />
        { result && <div className="my-2">
            <div>Sync completed in {result.elapsedTime}ms:</div>
            <div>Capabilities: {changeCountsToString(result.changeCounts.capabilities)}</div>
            <div>Skill Groups: {changeCountsToString(result.changeCounts.skillGroups)}</div>
            <div>Skills: {changeCountsToString(result.changeCounts.skills)}</div>
        </div>}
    </section>
}