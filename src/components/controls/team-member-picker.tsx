/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'



interface TeamMemberPickerProps {

    className?: string

    defaultValue?: string

    exclude?: string[]

    onValueChange?: (memberId: string) => void

    placeholder?: string

    size?: 'default' | 'sm'

    status?: ('Active' | 'Inactive')[]

    value?: string

}

export function TeamMemberPicker({ className, defaultValue = "", exclude = [], onValueChange, placeholder, size, status = ['Active'], value }: TeamMemberPickerProps) {
    const trpc = useTRPC()
    
    const teamMembersQuery = useQuery(trpc.activeTeam.members.getTeamMembers.queryOptions({ status }))

    const teamMembers = teamMembersQuery.data || []

    return <Select
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        
        value={value}
    >
        <SelectTrigger className={className} size={size}>
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {teamMembers.map(member => (
                <SelectItem key={member.personId} value={member.personId} disabled={exclude.includes(member.personId)}>
                    {member.person.name}
                </SelectItem>
            ))}
        </SelectContent>
        
    </Select>
}