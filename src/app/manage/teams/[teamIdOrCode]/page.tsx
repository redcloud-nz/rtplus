
import prisma from '@/lib/prisma'

import { AppPage, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'


export default async function TeamPage({ params }: { params: { teamIdOrCode: string }}) {

    const team = await prisma.team.findFirst({
        where: {
            OR: [
                { id: params.teamIdOrCode },
                { code: params.teamIdOrCode }
            ]
        }
    })

    if(team) {
        return <AppPage
            label={team.code || team.name}
            breadcrumbs={[{ label: "Teams", href: "/teams" }]}
        >
            <PageTitle>{team.name}</PageTitle>
        </AppPage>
    } else return <NotFound />
}