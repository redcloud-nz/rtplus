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