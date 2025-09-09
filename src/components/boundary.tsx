/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Alert } from './ui/alert'
import { LoadingFallback } from './ui/loading'


export function Boundary({ children }: { children: React.ReactNode }) {
    return <ErrorBoundary fallbackRender={({ error}) => <Alert severity="error" title="An error occured">{error.message}</Alert>}>
        <Suspense 
            fallback={<LoadingFallback/>}
        >
            {children}
        </Suspense>
    </ErrorBoundary>
}


