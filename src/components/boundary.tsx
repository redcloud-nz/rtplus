/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { LoaderCircleIcon } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Alert } from './ui/alert'


export function Boundary({ children }: { children: React.ReactNode }) {
    return <ErrorBoundary fallbackRender={({ error}) => <Alert severity="error" title="An error occured">{error.message}</Alert>}>
        <Suspense 
            fallback={<div className="w-full flex items-center justify-center p-4">
                <LoaderCircleIcon className="w-10 h-10 animate-spin"/>
            </div>}
        >
            {children}
        </Suspense>
    </ErrorBoundary>
}