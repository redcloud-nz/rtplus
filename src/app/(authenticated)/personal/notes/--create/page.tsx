/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { NotImplemented } from '@/components/nav/errors'

import { notesEnabledFlag } from '@/lib/flags'
import * as Paths from '@/paths'



export const metadata = {
    title: 'Create - Personal Notes',
}

export default async function Personal_NewNote_Page() {

    const notesEnabled = await notesEnabledFlag()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.personal, 
            Paths.personal.notes, 
            Paths.personal.notes.create
        ]}/>
        <NotImplemented ghIssueNumber={24} />
        
    </AppPage>
}

