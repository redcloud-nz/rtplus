/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /policies/[policy-key]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import * as Paths from '@/paths'
import { Alert } from '@/components/ui/alert'




export default async function PolicyNotFoundPage() {

    return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[
                    { label: 'Policies', href: Paths.policies.index },
                ]}
                label="Not Found"
            />
            <AppPageContent>
                <div className="flex flex-col gap-4 max-w-xl">
                    <Alert severity="error" title="The policy you are looking for could not be found."/>
                </div>
            </AppPageContent>
    </AppPage>
}