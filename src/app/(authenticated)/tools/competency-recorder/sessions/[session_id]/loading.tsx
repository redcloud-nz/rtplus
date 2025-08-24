/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /
 */

import { AppPageContent } from '@/components/app-page'
import { LoadingSpinner } from '@/components/ui/loading'

export default function CompetencyRecorder_Session_Loading() {
    return <AppPageContent variant="centered">
        <div className="flex flex-col items-center justify-center w-full h-full">
            <LoadingSpinner className="w-32 h-32"/>
            <div className="p-4">Loading Session...</div>
        </div>
    </AppPageContent>
}