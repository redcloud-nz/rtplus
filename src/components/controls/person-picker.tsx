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



interface PersonPickerProps {
    defaultValue?: string
    exclude?: string[]
    onValueChange?: (personId: string) => void
    placeholder?: string
    value?: string
    
}


export function PersonPicker({ defaultValue = "", exclude = [], onValueChange, placeholder, value }: PersonPickerProps) {
    const trpc = useTRPC()
    const query = useQuery(trpc.personnel.all.queryOptions({}))

    const [open, setOpen] = useState(false)
    const [internalValue, setInternalValue] = useState<string>(value ?? defaultValue)

    const handleSelect = (personId: string) => {
        if (personId !== internalValue) {
            setInternalValue(personId)
            onValueChange?.(personId)
            setOpen(false)
        }
    }

    const effectiveValue = value ?? internalValue
    const filteredPersonnel = (query.data ?? []).filter(person => person.status == 'Active')
    
    return <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
            >
                {query.data
                    ? effectiveValue
                        ? query.data.find((person) => person.id === value)?.name
                        : placeholder ?? "Select person..."
                    : "Loading..."
                }
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" portal={false}>
            <Command>
                <CommandInput placeholder='Search personnel...'/>
                <CommandList>
                    <CommandEmpty>No available personnel found.</CommandEmpty>
                    <CommandGroup>
                        {filteredPersonnel.map((person) => (
                            <CommandItem
                                key={person.id}
                                value={person.id}
                                disabled={exclude.includes(person.id)}
                                onSelect={() => handleSelect(person.id)}
                                className={cn("cursor-pointer", value === person.id && "bg-accent")}
                            >
                                <CheckIcon className={cn("mr-2 h-4 w-4", value === person.id ? "opacity-100" : "opacity-0")} />
                                {person.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
}