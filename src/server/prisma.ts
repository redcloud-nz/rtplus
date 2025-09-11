/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Use Prismock in test environment, regular PrismaClient otherwise
    if (process.env.NODE_ENV === 'test') {
        // Dynamic import only in test environment to avoid bundling Prismock in production
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { PrismockClient } = require('prismock')
        return new PrismockClient() as unknown as PrismaClient
    }
    return new PrismaClient()
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if(process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma