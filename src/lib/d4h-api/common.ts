/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

export interface CustomField {
    id: number,
    name: string,
    customFieldId: number,
    value: string,
    type: string,
    mandatory: boolean,
    searchable: boolean,
    restricted: 'RESTRICTED' | 'UNRESTRICTED'
}

export type DateString = string

export type ResourceId<Type extends string, ID = number> = { id: ID, resourceType: Type }

export interface D4hPoint {
    type: 'Point',
    coordinates: [number, number]
}