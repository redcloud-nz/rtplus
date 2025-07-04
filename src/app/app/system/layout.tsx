/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system
 */

import { ReactNode } from 'react'



export default function SystemLayout({ children, form}: { children: ReactNode, form?: ReactNode }) {
    return <>
        {children}
        {form}
    </>
}