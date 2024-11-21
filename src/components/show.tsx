
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