/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { create } from 'zustand'

import { PackageList, SkillPackageDef } from '@/data/skills'
import { ChangeCountsByType } from '@/lib/change-counts'
import { resolveAfter } from '@/lib/utils'


export interface SkillPackageImportStore {
    // Data
    status: 'Init' | 'Review' | 'Done' | 'Error'
    loading: boolean
    packageToImport: SkillPackageDef | null
    message: string
    availablePackages: Pick<SkillPackageDef, 'id' | 'name'>[]
    result: { elapsedTime: number, changeCounts: ChangeCountsByType<"skillGroups" | "skills" | "skillPackages"> } | null

    // Actions
    importPackage(mutation: () => Promise<SkillPackageImportStore['result']>): Promise<void>
    loadPackage(packageId: string): Promise<void>
    reset(): void

}

export const useSkillPackageImportStore = create<SkillPackageImportStore>() (
    (set) => {
        return {
            status: 'Init',
            loading: false,
            packageToImport: null,
            message: "",
            availablePackages: PackageList,
            result: null,

            async importPackage(mutation: () => Promise<SkillPackageImportStore['result']>) {
                set({ loading: true })
                const result = await mutation()

                set({ status: 'Done', loading: false, result })
            },

            async loadPackage(packageId: string) {
                set({ loading: true })

                const pkg = PackageList.find(pkg => pkg.skillPackageId == packageId)
                await resolveAfter(null, 1000)
                if(pkg) {
                    set({ status: 'Review', loading: false, packageToImport: pkg })
                } else {
                    set({ status: 'Error', loading: false, message: `No such SkillPackage with id = ${packageId}` })
                }
            },
            reset() {
                set({ status: 'Init', loading: false, packageToImport: null, message: undefined })
            }
        }
    }
)