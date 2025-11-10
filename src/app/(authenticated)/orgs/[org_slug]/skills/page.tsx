/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skills
 */

import { ChevronRightIcon } from 'lucide-react'

import { RTPlusLogo } from '@/components/art/rtplus-logo'
import { Lexington } from '@/components/blocks/lexington'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/items'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { SessionsCount_Card, SkillChecksCount_Card, SkillsCount_Card, PersonnelCount_Card } from './skill-stats'


export const metadata = { title: 'Skills Dashboard' }


export default async function SkillsModule_Index_Page(props: PageProps<'/orgs/[org_slug]/skills'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header breadcrumbs={[
            Paths.org(orgSlug).skills
        ]}/>

        <Lexington.Page>
            <Lexington.Column width="sm" className="gap-4">
                <div className="flex flex-col items-center gap-4 mt-4">
                    <RTPlusLogo className="w-50 h-25"/>
                    <div className="font-semibold mt-4">Skills Module</div>
                </div>
                
                <ItemGroup className="w-lg">
                    <Item asChild>
                        <Link to={Paths.org(orgSlug).skills.catalogue}>
                            <ItemContent>
                                <ItemTitle>Catalogue</ItemTitle>
                                <ItemDescription>See the skills available to be assessed.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ChevronRightIcon className="size-4" />
                            </ItemActions>
                        </Link>
                    </Item>
                    <Item asChild>
                        <Link to={Paths.org(orgSlug).skills.checks}>
                            <ItemContent>
                                <ItemTitle>Checks</ItemTitle>
                                <ItemDescription>See the recent skill checks that have been performed.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ChevronRightIcon className="size-4" />
                            </ItemActions>
                        </Link>
                    </Item>
                    <Item asChild>
                        <Link to={Paths.org(orgSlug).skills.sessions}>
                            <ItemContent>
                                <ItemTitle>Sessions</ItemTitle>
                                <ItemDescription>Use skill check sessions for bulk recording.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ChevronRightIcon className="size-4" />
                            </ItemActions>
                        </Link>
                    </Item>
                    <Item asChild>
                        <Link to={Paths.org(orgSlug).skills.reports}>
                            <ItemContent>
                                <ItemTitle>Reports</ItemTitle>
                                <ItemDescription>See the reports generated from skill checks.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ChevronRightIcon className="size-4" />
                            </ItemActions>
                        </Link>
                    </Item>
                </ItemGroup>

                <div className="grid grid-cols-2 gap-4 justify-center self-center mt-4">
                    <SkillsCount_Card organization={organization} />
                    <PersonnelCount_Card organization={organization} />
                    <SessionsCount_Card organization={organization} />
                    <SkillChecksCount_Card organization={organization} />
                </div>
            </Lexington.Column>
            
        </Lexington.Page>
    </Lexington.Root>
}


