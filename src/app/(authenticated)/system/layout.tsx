/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /system
 */

import { Metadata } from 'next'
import { ReactNode } from 'react'


export const metadata: Metadata = {
    applicationName: "RT+",
    title: {
        template: `%s - System | RT+`,
        default: "System",
    },
    description: "RT+ App",

}

export default async function System_Layout(props: { children: ReactNode }) {

    return props.children
}