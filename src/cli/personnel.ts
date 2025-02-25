/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { getPersonnelCountAction } from './get-personnel-count-action'


export function count() {
    getPersonnelCountAction().then((count) => {
        console.log("Personel Count: ", count)
    })
    
}