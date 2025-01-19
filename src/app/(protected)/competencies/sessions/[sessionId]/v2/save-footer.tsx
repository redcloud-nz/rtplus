/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useShallow } from 'zustand/react/shallow'

import { AsyncButton} from '@/components/ui/button'
import { useSkillCheckStore } from '../skill-check-store'



export function SaveFooter() {

    const [changeCount, save] = useSkillCheckStore(useShallow(state => [state.changeCount, state.save]))

    return <div className="flex items-center gap-2">
        <AsyncButton
            label="Save"
            pending="Saving..."
            done="Saved"
            reset
            onClick={save}
            disabled={changeCount == 0}
        />
        {changeCount > 0 && <div className='text-gray-500'>{changeCount} unsaved changes</div>}
    </div>
}