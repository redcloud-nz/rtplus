/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { SkillPackageData, SkillPackageId } from '@/lib/schemas/skill-package'

type SampleSkillPackage = Omit<SkillPackageData, 'ownerOrgId' | 'published'>

const SkillPackageBlue: SampleSkillPackage = {
    skillPackageId: SkillPackageId.create(),
    name: 'Blue Skills',
    description: 'A sample skill package with blue themed skills.',
    tags: ['blue', 'sample'],
    properties: {
        theme: 'blue'
    },
    status: 'Active',
}

const SkillPackageRed: SampleSkillPackage = {
    skillPackageId: SkillPackageId.create(),
    name: 'Red Skills',
    description: 'A sample skill package with red themed skills.',
    tags: ['red', 'sample'],
    properties: {
        theme: 'red'
    },
    status: 'Active',
}

const SkillPackageGreen: SampleSkillPackage = {
    skillPackageId: SkillPackageId.create(),
    name: 'Green Skills',
    description: 'A sample skill package with green themed skills.',
    tags: ['green', 'sample'],
    properties: {
        theme: 'green'
    },
    status: 'Active',
}

const SkillPackageYellow: SampleSkillPackage = {
    skillPackageId: SkillPackageId.create(),
    name: 'Yellow Skills',
    description: 'A sample skill package with yellow themed skills.',
    tags: ['yellow', 'sample'],
    properties: {
        theme: 'yellow'
    },
    status: 'Active',
}

const SkillPackagePurple: SampleSkillPackage = {
    skillPackageId: SkillPackageId.create(),
    name: 'Purple Skills',
    description: 'A sample skill package with purple themed skills.',
    tags: ['purple', 'sample'],
    properties: {
        theme: 'purple'
    },
    status: 'Active',
}

const SkillPackageOrange: SampleSkillPackage = {
    skillPackageId: SkillPackageId.create(),
    name: 'Orange Skills',
    description: 'A sample skill package with orange themed skills.',
    tags: ['orange', 'sample'],
    properties: {
        theme: 'orange'
    },
    status: 'Active',
}

export const SampleSkillPackages = {
    All: [
        SkillPackageBlue,
        SkillPackageRed,
        SkillPackageGreen,
        SkillPackageYellow,
        SkillPackagePurple,
        SkillPackageOrange,
    ],
    SkillPackageBlue,
    SkillPackageRed,
    SkillPackageGreen,
    SkillPackageYellow,
    SkillPackagePurple,
    SkillPackageOrange,
} as const