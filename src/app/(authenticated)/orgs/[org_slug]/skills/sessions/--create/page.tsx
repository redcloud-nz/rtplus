/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skills/sessions/--create
 */

import { Lexington } from '@/components/blocks/lexington'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { BackToListIcon } from '@/components/icons'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { S2_Button } from '@/components/ui/s2-button'
import { Link } from '@/components/ui/link'

import { SkillsModule_NewSession_Form } from './new-session'



export const metadata = { title: `New Session` }

export default async function SkillsModule_NewSession_Page(props: PageProps<'/orgs/[org_slug]/skills/sessions/--create'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    const skillsPath = Paths.org(organization.slug).skills

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                skillsPath,
                skillsPath.sessions,
                skillsPath.sessions.create,
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="lg">
                <Lexington.ColumnControls>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <S2_Button variant="outline" asChild>
                                <Link to={skillsPath.sessions}>
                                    <BackToListIcon/> List
                                </Link>
                            </S2_Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            back to sessions list
                        </TooltipContent>
                    </Tooltip>
                </Lexington.ColumnControls>
                <S2_Card>
                    <S2_CardHeader>
                        <S2_CardTitle>
                            New Skill Check Session
                        </S2_CardTitle>
                    </S2_CardHeader>
                    <S2_CardContent>
                        <SkillsModule_NewSession_Form organization={organization} />
                    </S2_CardContent>
                </S2_Card>
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}