/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { Personal_NotesList } from './personal-notes-list'

export const metadata = { title: 'Personal Notes' }

export default function Personal_NotesList_Page() {
    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.personal, 
            Paths.personal.notes
        ]}/>
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Personal Notes</PageTitle>
            </PageHeader>
            <Boundary>
                <Personal_NotesList />
            </Boundary>
        </AppPageContent>
    </AppPage>
}

