/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { Personal_NewNote_Card } from './personal-new-note'

export const metadata = {
    title: 'Create - Personal Notes',
}

export default function Personal_NewNote_Page() {
    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.personal, 
            Paths.personal.notes, 
            Paths.personal.notes.create
        ]}/>
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Create Personal Note</PageTitle>
            </PageHeader>
            <Boundary>
                <Personal_NewNote_Card />
            </Boundary>
        </AppPageContent>
    </AppPage>
}

