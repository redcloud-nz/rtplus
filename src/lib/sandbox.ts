/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


export function sandboxEmailOf(personName: string) {
    if(personName.trim().length == 0) return ''

    return `${personName.replace(/\s+/g, '.').toLowerCase()}@example.com`
}