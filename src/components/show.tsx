/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import React from 'react'

export interface ShowProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    when: boolean
   
}

export function Show({ children, fallback, when }: ShowProps) {
    if(when) return children
    else return fallback
}