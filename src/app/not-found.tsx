/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /
 */

import Image from 'next/image'

import { NotFound } from '@/components/nav/errors'

export default function Root_NotFound() {
    return <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
        <Image
            className="dark:invert"
            src="/logo.svg"
            alt="RT+ logo"
            width={200}
            height={100}
            priority
        />
        <NotFound/>
    </div>
}