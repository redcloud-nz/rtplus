/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { describe, test, expect, beforeEach } from 'vitest'

import prisma from '@/server/prisma'
import { SamplePersonnel } from '@/test/sample-personnel'

describe('useSkillCheckStore', () => {
    const actor = SamplePersonnel.AyazIovita

    beforeEach(async () => {
        await prisma.person.createMany({ data: [SamplePersonnel.AyazIovita, SamplePersonnel.BeatrixLavinia, SamplePersonnel.CommodusFeliciano, SamplePersonnel.DionysiusVittorio] })
    

    })

})