/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /imports/skill-package
 */
'use client'

import React from 'react'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { AsyncButton, Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Stepper } from '@/components/ui/stepper'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { PackageList, SkillGroupDef, SkillPackageDef } from '@/data/skills'

import { changeCountsToString } from '@/lib/change-counts'
import { resolveAfter } from '@/lib/utils'
import * as Paths from '@/paths'

import { importPackagesAction, type ImportPackageActionResult } from './import-packages-action'


type ImportState = { status: 'Init' } | { status: 'Review', packageToImport: SkillPackageDef } | { status: 'Done', result: ImportPackageActionResult } | { status: 'Error', message: string }

export default function ImportSkillPackagePage() {

    const [state, setState] = React.useState<ImportState>({ status: 'Init' })
    const [packageId, setPackageId] = React.useState<string>('')

    async function handleFetch() {
        const pkg = PackageList.find(pkg => pkg.id == packageId)
        await resolveAfter(null, 1000)

        if(pkg) {
            setState({ status: 'Review', packageToImport: pkg })

            console.log('Package to import:', pkg)
        }
        else setState({ status: 'Error', message: `No such SkillPackage with id = ${packageId}` })
        
    }

    async function handleImport() {
        const result = await importPackagesAction([packageId])
        setState({ status: 'Done', result })
    }

    async function handleCancel() {
        setState({ status: 'Init' })
        setPackageId('')
    }


    function renderGroup(skillGroup: SkillGroupDef): React.ReactNode {
        return <React.Fragment key={skillGroup.id}>
            <TableRow>
                <TableCell className="pl-6">Group</TableCell>
                <TableCell>
                    <div>{skillGroup.name}</div>
                    <div><span className="text-muted-foreground">ref:</span> {skillGroup.slug}</div>
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
                    <TableCell className="text-center">{skill.frequency}</TableCell>
                    <TableCell className="text-center">{skill.optional ? 'Yes' : ''}</TableCell>
                </TableRow>
            )}
        </React.Fragment>
    }

    return <AppPage 
        label="Import Skill Package"
        breadcrumbs={[
            { label: 'Manage', href: Paths.manage },
            { label: 'Imports', href: Paths.imports.list }
        ]}
        >
        <PageHeader>
            <PageTitle>Import Skill Package</PageTitle>
            <PageDescription>Import a skill package defined in the source code.</PageDescription>
        </PageHeader>
        <Stepper 
            activeStep={['Init', 'Review', 'Done'].indexOf(state.status)}
            steps={[
                { name: "Select Package" },
                { name: "Review Package" },
                { name: "Execute" }
            ]}
        />
        <div className="my-4 space-y-4">
            { state.status == 'Init' && <>
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
            </>}
            
            { state.status == 'Review' && <>
                <Table border>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell>Object</TableHeadCell>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Description</TableHeadCell>
                            <TableHeadCell className="text-center">Frequency</TableHeadCell>
                            <TableHeadCell className="text-center">Optional</TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Package</TableCell>
                            <TableCell>
                                <div>{state.packageToImport.name}</div>
                                <div><span className="text-muted-foreground">ref:</span> {state.packageToImport.slug}</div>
                            </TableCell>
                            <TableCell><span className="text-muted-foreground">ID:</span> {state.packageToImport.id}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        {state.packageToImport.skillGroups.map(renderGroup)}
                    </TableBody>
                </Table>
                <div className="flex gap-2">
                    <AsyncButton
                        onClick={handleImport}
                        label="Import"
                        pending="Importing"
                        done="Imported"
                    />
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
               
            </>}

            
            { state.status == 'Done' && <div className="my-2">
                <div>Import completed in {state.result.elapsedTime}ms:</div>
                <div>Packages: {changeCountsToString(state.result.changeCounts.packages)}</div>
                <div>Skill Groups: {changeCountsToString(state.result.changeCounts.skillGroups)}</div>
                <div>Skills: {changeCountsToString(state.result.changeCounts.skills)}</div>
            </div>}
        </div>
        
    </AppPage>
}