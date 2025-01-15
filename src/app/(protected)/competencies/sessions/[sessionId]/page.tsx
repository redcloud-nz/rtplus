/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/sessions/[sessionId]
 */

import { NotImplemented } from '@/components/errors'

import * as Paths from '@/paths'

export default async function SessionInfoPage(props: { params: Promise<{ sessionId: string }>}) {
    const params = await props.params;

    return <NotImplemented
        label={params.sessionId}
        breadcrumbs={[
            { label: "Competencies", href: Paths.competencies.dashboard }, 
            { label: "Sessions", href: Paths.competencies.sessionList },
        ]}
    />
}