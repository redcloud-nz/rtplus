/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { Alert } from './ui/alert'


export function InjectFooter({ children }: { children: ReactNode }) {

    const footer = document.getElementById('app-page-footer')
    if(!footer) return <Alert title="Footer Not Available">The expected injection site (footer#app-page-footer) was not found.</Alert>

    return createPortal(children, footer)
}


export function FloatingFooter({ children, open = true }: { children: ReactNode, open?: boolean }) {
    return <div className="absolute bottom-1 left-0 w-full flex justify-center">
        <div 
            className="flex items-center gap-2 bg-primary/80 backdrop-blur-sm rounded-lg z-50 px-1 py-1 shadow-lg data-[state=closed]:hidden"
            data-state={open ? 'open' : 'closed'}
        >
            {children}
        </div>
    </div>
}
