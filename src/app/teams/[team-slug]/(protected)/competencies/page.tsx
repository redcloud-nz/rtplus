/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team-slug]/competencies
 */

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import prisma from '@/server/prisma'

export default async function CompetenciesDashboard() {

    const skillCount = await prisma.skill.count()
    const personnelCount = await prisma.person.count()

    return <AppPage
        label="Competencies Dashboard"
    >
        <PageHeader>
            <PageTitle>Competencies Dashboard</PageTitle>
        </PageHeader>
        <Stats 
            personnelCount={personnelCount}
            skillCount={skillCount}/>
    </AppPage>
}


interface StatProps {
    title: string
    value: string
    description: string
}

function Stat({ title, value, description }: StatProps) {
    return <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
        </CardContent>
    </Card>
}

interface StatsProps {
    personnelCount: number
    skillCount: number
}

function Stats({ personnelCount, skillCount }: StatsProps) {
    return <div className="grid gap-4 md:grid-cols2 lg:grid-cols-4">
        <Stat title="Skills" value={''+skillCount} description="Total skills that can be checked" />
        <Stat title="Personnel" value={''+personnelCount} description="Total personnel that can be assessed." />
    </div>
}