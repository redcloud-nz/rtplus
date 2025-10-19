/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'

import * as Paths from '@/paths'
import { NotImplemented } from '@/components/nav/errors'

export const metadata = { title: 'Notes' }

export default async function NotesModule_Index_Page() {

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.notesModule
        ]}/>
        <NotImplemented ghIssueNumber={25}/>
    </AppPage>
}

