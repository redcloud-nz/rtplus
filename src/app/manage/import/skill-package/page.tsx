'use client'

import React from 'react'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { AsyncButton } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { PackageList, SkillGroupDef, SkillPackageDef } from '@/data/skills'

import { ChangeCounts } from '@/lib/change-counts'
import { resolveAfter } from '@/lib/utils'

import { importPackageAction, ImportPackageActionResult } from './actions'

type ImportState = { status: 'Init' } | { status: 'Review', packageToImport: SkillPackageDef } | { status: 'Done', result: ImportPackageActionResult } | { status: 'Error', message: string }

export default function ImportSkillPackagePage() {


    const [state, setState] = React.useState<ImportState>({ status: 'Init' })
    const [packageId, setPackageId] = React.useState<string>('')

    async function handleFetch() {
        const pkg = PackageList.find(pkg => pkg.id == packageId)
        await resolveAfter(null, 1000)

        if(pkg) {
            setState({ status: 'Review', packageToImport: pkg })
        }
        else setState({ status: 'Error', message: `No such SkillPackage with id = ${packageId}` })
        
    }

    async function handleImport() {
        const result = await importPackageAction([packageId])
        setState({ status: 'Done', result })
    }

    function changeCountsToString(changeCounts: ChangeCounts) {
        return `${changeCounts.create} created, ${changeCounts.update} updated, ${changeCounts.delete} deleted.`
    }

    function renderGroup(skillGroup: SkillGroupDef): React.ReactNode {
        return <React.Fragment key={skillGroup.id}>
            <TableRow>
                <TableCell className="pl-6">Group</TableCell>
                <TableCell>
                    <div>{skillGroup.name}</div>
                    <div><span className="text-muted-foreground">ref:</span> {skillGroup.ref}</div>
                </TableCell>
                <TableCell><span className="text-muted-foreground">ID:</span> {skillGroup.id}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
            </TableRow>
            {skillGroup.subGroups.map(renderGroup)}
            {skillGroup.skills.map(skill => 
                <TableRow key={skill.id}>
                    <TableCell className="pl-10">Skill</TableCell>
                    <TableCell>{skill.name}</TableCell>
                    <TableCell>{skill.description}</TableCell>
                    <TableCell>{skill.frequency}</TableCell>
                    <TableCell>{skill.optional ? 'Yes' : ''}</TableCell>
                </TableRow>
            )}
        </React.Fragment>
    }

    return <AppPage label="Import Skill Package">
        <PageHeader>
            <PageTitle>Import Skill Package</PageTitle>
            <PageDescription>Import a skill package defined in the source code.</PageDescription>
        </PageHeader>
        <div>
            <div className="flex gap-2 mb-4">
                <Select value={packageId} onValueChange={setPackageId} disabled={state.status != 'Init'}>
                    <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="select a package to import..."/>
                    </SelectTrigger>
                    <SelectContent>
                        {PackageList.map(pkg => 
                            <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                        )}
                    </SelectContent>
                </Select>
                <AsyncButton 
                    onClick={handleFetch}
                    label="Fetch"
                    pending="Fetching"
                    done="Fetched"
                    disabled={!packageId}
                />
                { (state.status == 'Review' || state.status == 'Done') && <AsyncButton 
                    onClick={handleImport}
                    label="Import"
                    pending="Importing"
                    done="Imported"
                    disabled={!packageId}
                />}
            </div>
            
            { state.status == 'Review' && <div>
                <Table border>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell>Object</TableHeadCell>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Description</TableHeadCell>
                            <TableHeadCell>Frequency</TableHeadCell>
                            <TableHeadCell>Optional</TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Package</TableCell>
                            <TableCell>
                                <div>{state.packageToImport.name}</div>
                                <div><span className="text-muted-foreground">ref:</span> {state.packageToImport.ref}</div>
                            </TableCell>
                            <TableCell><span className="text-muted-foreground">ID:</span> {state.packageToImport.id}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        {state.packageToImport.skillGroups.map(renderGroup)}
                    </TableBody>
                </Table>
            </div>}

            
            
            { state.status == 'Done' && <div className="my-2">
                <div>Import completed in {state.result.elapsedTime}ms:</div>
                <div>Packages: {changeCountsToString(state.result.changeCounts.packages)}</div>
                <div>Skill Groups: {changeCountsToString(state.result.changeCounts.skillGroups)}</div>
                <div>Skills: {changeCountsToString(state.result.changeCounts.skills)}</div>
            </div>}
        </div>
        
    </AppPage>
}