/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useState } from 'react'

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'

interface TeamPickerProps {
    defaultValue?: string
    exclude?: string[]
    onValueChange?: (personId: string) => void
    placeholder?: string
    value?: string
}


export function TeamPicker({ defaultValue = "", exclude = [], onValueChange, placeholder, value }: TeamPickerProps) {
    const trpc = useTRPC()
    const query = useQuery(trpc.teams.all.queryOptions({}))

    const [open, setOpen] = useState(false)
    const [internalValue, setInternalValue] = useState<string>(value ?? defaultValue)

    const handleSelect = (teamId: string) => {
        if (teamId !== internalValue) {
            setInternalValue(teamId)
            onValueChange?.(teamId)
            setOpen(false)
        }
    }
    
    return <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
            >
                {query.data
                    ? value
                        ? query.data.find((team) => team.id === value)?.name
                        : placeholder ?? "Select team..."
                    : "Loading..."
                }
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" portal={false}>
            <Command>
                <CommandInput placeholder='Search teams...'/>
                <CommandList>
                    <CommandEmpty>No teams found.</CommandEmpty>
                    <CommandGroup>
                        {query.data?.map((team) => (
                            <CommandItem
                                key={team.id}
                                value={team.id}
                                disabled={exclude.includes(team.id)}
                                onSelect={() => handleSelect(team.id)}
                                className={cn("cursor-pointer", value === team.id && "bg-accent")}
                            >
                                <CheckIcon className={cn("mr-2 h-4 w-4", value === team.id ? "opacity-100" : "opacity-0")} />
                                {team.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
            </PopoverContent>
    </Popover>
}