/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { Fragment, useState } from 'react'
import * as R from 'remeda'
import { useShallow } from 'zustand/react/shallow'

import { useMutation } from '@tanstack/react-query'

import { AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import { Alert } from '@/components/ui/alert'
import { AsyncButton, Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Stepper } from '@/components/ui/stepper'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { SkillGroupDef } from '@/data/skills'
import { assertNonNull } from '@/lib/utils'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

import { useSkillPackageImportStore } from './skill-package-import-store'
import { OrganizationData } from '@/lib/schemas/organization'

export default function ImportSkillPackage_Content({ organization }: { organization: OrganizationData }) {

    const { message, status } = useSkillPackageImportStore(useShallow(R.pick(['message', 'status'])))
    
    return <AppPageContent>
        <PageHeader>
            <PageTitle>Import Skill Package</PageTitle>
            <PageDescription>Import a skill package.</PageDescription>
        </PageHeader>
        <Stepper 
            activeStep={['Init', 'Review', 'Done'].indexOf(status)}
            steps={[
                { name: "Select Package" },
                { name: "Review Package" },
                { name: "Complete" }
            ]}
        />
        <div className="my-4 space-y-4">
            { status == 'Init' && <SelectPackageStep/> }
            { status == 'Review' && <ReviewPackageStep organization={organization} /> }
            { status == 'Done' && <ResultsStep/> }
            {status == 'Error' && <>
                <Alert severity="error" title={message}/>
            </>}
        </div>
    </AppPageContent>
}

function SelectPackageStep() {
    const { availablePackages, loadPackage, status } = useSkillPackageImportStore(useShallow(R.pick(['availablePackages', 'loadPackage', 'status'])))

    const [packageId, setPackageId] = useState<string>('')

    return <>
        <Select value={packageId} onValueChange={setPackageId} disabled={status != 'Init'}>
            <SelectTrigger className="max-w-md">
                <SelectValue placeholder="select a package to import..."/>
            </SelectTrigger>
            <SelectContent>
                {availablePackages.map(pkg => 
                    <SelectItem key={pkg.skillPackageId} value={pkg.skillPackageId}>{pkg.name}</SelectItem>
                )}
            </SelectContent>
        </Select>
        <AsyncButton 
            onClick={() => loadPackage(packageId)}
            label="Fetch"
            pending="Fetching"
            done="Fetched"
            disabled={!packageId}
        />
    </>
}


function ReviewPackageStep({ organization }: { organization: OrganizationData }) {
    const { importPackage, packageToImport, reset } = useSkillPackageImportStore(useShallow(R.pick(['importPackage', 'packageToImport', 'reset'])))
    assertNonNull(packageToImport)

    

    const mutation = useMutation(trpc.skills.importPackage.mutationOptions())
    
    async function handleImport() {
        await importPackage(() => mutation.mutateAsync({ orgId: organization.orgId, skillPackageId: packageToImport!.skillPackageId }))
    }

    function renderGroup(skillGroup: SkillGroupDef): React.ReactNode {
            return <Fragment key={skillGroup.skillGroupId}>
                <TableRow>
                    <TableCell className="pl-6">Group</TableCell>
                    <TableCell>
                        <div>{skillGroup.name}</div>
                    </TableCell>
                    <TableCell><span className="text-muted-foreground">ID:</span> {skillGroup.skillGroupId}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                </TableRow>
                {skillGroup.subGroups.map(renderGroup)}
                {skillGroup.skills.map(skill => 
                    <TableRow key={skill.skillId}>
                        <TableCell className="pl-10">Skill</TableCell>
                        <TableCell>{skill.name}</TableCell>
                        <TableCell>{skill.description}</TableCell>
                        <TableCell className="text-center">{skill.frequency}</TableCell>
                        <TableCell className="text-center">{skill.optional ? 'Yes' : ''}</TableCell>
                    </TableRow>
                )}
            </Fragment>
    }

    return <>
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
                        <div>{packageToImport.name}</div>
                    </TableCell>
                    <TableCell><span className="text-muted-foreground">ID:</span> {packageToImport.skillPackageId}</TableCell>
                    <TableCell className="text-center"></TableCell>
                    <TableCell className="text-center"></TableCell>
                </TableRow>
                {packageToImport.skillGroups.map(renderGroup)}
            </TableBody>
        </Table>
        <div className="flex gap-2">
            <AsyncButton
                onClick={handleImport}
                label="Import"
                pending="Importing..."
                done="Imported"
            />
            <Button variant="outline" onClick={reset}>Cancel</Button>
        </div>
    </>
}


function ResultsStep() {
    const { result } = useSkillPackageImportStore(useShallow(R.pick(['result'])))
    assertNonNull(result)

    return <div>
        <div>Import completed in {result.elapsedTime}ms:</div>
        <Table border>
            <TableHead>
                <TableRow>
                    <TableHeadCell></TableHeadCell>
                    <TableHeadCell className="text-center">Created</TableHeadCell>
                    <TableHeadCell className="text-center">Updated</TableHeadCell>
                    <TableHeadCell className="text-center">Deleted</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Skill Packages</TableCell>
                    <TableCell className="text-center">{result.changeCounts.skillPackages.create}</TableCell>
                    <TableCell className="text-center">{result.changeCounts.skillPackages.update}</TableCell>
                    <TableCell className="text-center">{result.changeCounts.skillPackages.delete}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Skill Groups</TableCell>
                    <TableCell className="text-center">{result.changeCounts.skillGroups.create}</TableCell>
                    <TableCell className="text-center">{result.changeCounts.skillGroups.update}</TableCell>
                    <TableCell className="text-center">{result.changeCounts.skillGroups.delete}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Skills</TableCell>
                    <TableCell className="text-center">{result.changeCounts.skills.create}</TableCell>
                    <TableCell className="text-center">{result.changeCounts.skills.update}</TableCell>
                    <TableCell className="text-center">{result.changeCounts.skills.delete}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
}