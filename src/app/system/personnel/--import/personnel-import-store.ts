/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'



export interface PersonnelImportStore {
    // Data
    status: 'Init' | 'Review' | 'Done' | 'Error'
    loading: boolean
    message: string


    // Actions
    importTeam(): Promise<void>
    
}