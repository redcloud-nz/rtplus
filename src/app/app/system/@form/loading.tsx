/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form
 */
'use client'

import { LoadingSpinner } from '@/components/ui/loading'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

export default function LoadingSheet() {

    return <Sheet open>
        <SheetContent>
            <VisuallyHidden>
                <SheetTitle>Loading</SheetTitle>
            </VisuallyHidden>
            <div className="w-full h-full flex item-center justify-center">
                <LoadingSpinner/>
            </div>
        </SheetContent>
    </Sheet>
}