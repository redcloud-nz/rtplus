/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

import { type ReactNode } from 'react'


import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export function UnderConstruction({ children }: { children: ReactNode }) {
    return <div className="relative">
        {children}
        <Popover>
            <PopoverTrigger className="absolute inset-0 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M 0 0 H 24 V 24 H 0 V 0 L 24 24 M 0 24 L 24 0" className="stroke-orange-400 stroke-2 opacity-50 fill-none"/>
                </svg>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <h3 className="text-lg font-semibold">Under Construction</h3>
                    <p className="text-sm text-muted-foreground">
                        This feature is under construction.
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    </div>
}