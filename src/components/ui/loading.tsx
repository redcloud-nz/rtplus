/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ComponentProps } from 'react'


export function LoadingSpinner({ className, ...props }: ComponentProps<'div'>) {
    return <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" {...props}/>
}