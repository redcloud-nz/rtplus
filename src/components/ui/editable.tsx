/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { type ComponentProps, createContext, useContext, useMemo, useState } from 'react'


import { Card } from '@/components/ui/card'


interface EdiableCardState {
    targetId: string | null
    mode: 'View' | 'Edit' | 'Create'
}

type EditableCardContext = {
    mode: EdiableCardState['mode']
    targetId: EdiableCardState['targetId']
    setMode: (mode: EdiableCardState['mode'], targetId?: string | null) => void
}
const EditableCardContext = createContext<EditableCardContext | null>(null)

function useEditableCardContext() {
    return useContext(EditableCardContext)
}

interface EditableCardProps extends ComponentProps<'div'> {
    defaultState?: Partial<EdiableCardState>
}

export function EditableCard({ children, defaultState = {}, ...props }: EditableCardProps) {

    const [state, setState] = useState<EdiableCardState>({ mode: 'View', targetId: null, ...defaultState})

    const context = useMemo(() => ({
        mode: state.mode,
        targetId: state.targetId,
        setMode: (mode: EdiableCardState['mode'], targetId = null) => setState((prev) => ({ ...prev, mode, targetId }))
    } satisfies EditableCardContext), [state.mode])
  
    return <EditableCardContext.Provider value={context}>
        <Card {...props}/>
    </EditableCardContext.Provider>
}