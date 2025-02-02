/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/personnel/[personId]/access
 */

import { SkillPackage, Team } from '@prisma/client'

import { AppPage, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from '@/components/ui/card'

import { validateUUID } from '@/lib/id'
import { assertNonNull } from '@/lib/utils'

import { authenticated } from '@/server/auth'
import { getPersonWithPermissions } from '@/server/data/personnel'
import prisma from '@/server/prisma'

import * as Paths from '@/paths'

import { AddPermissionDialog } from './add-permission'
import { PermissionList } from './permission-list'



type Props = { params: Promise<{ personId: string }> }

export async function generateMetadata({ params }: Props) {
    const { personId } = await params

    const person = validateUUID(personId) ? await getPersonWithPermissions(personId) : null
    return person ? { title: `Access & Permissions | ${person.name}` } : { title: "Person Not Found" }
}


export default async function PersonAccessPage(props: Props) {
    const { personId } = await props.params
    const { userPersonId, hasPermission } = await authenticated()

    const personWithPermissions = validateUUID(personId) ? await getPersonWithPermissions(personId) : null
    if(!personWithPermissions) return <NotFound/>

    const userPermissions = await getPersonWithPermissions(userPersonId)
    assertNonNull(userPermissions)

    let availableTeams: Team[] = []
    let availableSkillPackages: SkillPackage[] = []
    if(hasPermission('system:write')) {
        // Can assign any permission
        [availableTeams, availableSkillPackages] = await Promise.all([
            prisma.team.findMany({ where: { status: 'Active' }}),
            prisma.skillPackage.findMany({ where: { status: 'Active' }})
        ])
    } else {
        // Can only assign permissions for teams and skill-packages that the user has the write permission for
        availableTeams = userPermissions.teamPermissions
            .filter(tp => tp.permissions.includes('team:write'))
            .map(tp => tp.team)

        availableSkillPackages = userPermissions.skillPackagePermissions
            .filter(spp => spp.permissions.includes('skill-profile:write'))
            .map(spp => spp.skillPackage)
    }

    return <AppPage
        label="Access & Permissions"
        breadcrumbs={[
            { label: "Manage", href: Paths.manage }, 
            { label: "Personnel", href: Paths.personnel },
            { label: personWithPermissions.name, href: Paths.person(personWithPermissions.id) }
        ]}
    >
        <PageHeader>
            <PageTitle>RT+ Permissions</PageTitle>
            <PageDescription>Manage the access and permissions for {personWithPermissions.name}.</PageDescription>
        </PageHeader>

        <CardGrid>
            <Card>
                <CardHeader>
                    <CardTitle>Access</CardTitle>
                </CardHeader>
                <CardContent>
                    
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                    <AddPermissionDialog
                        availableSkillPackages={availableSkillPackages}
                        availableTeams={availableTeams}
                        hasSystemWritePermission={hasPermission('system:write')}
                        personPermissions={personWithPermissions}
                    />
                </CardHeader>
                <CardContent>
                    <PermissionList
                        personId={personId}
                        personPermissions={personWithPermissions}
                    />
                </CardContent>
            </Card>
        </CardGrid>
    </AppPage>
}