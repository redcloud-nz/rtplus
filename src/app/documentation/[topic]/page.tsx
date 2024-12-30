/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /documentation/topic
 */

import { NotImplemented } from '@/components/errors'

export default async function DocumentationPage(props: { params: Promise<{ topic: string}> }) {
    const params = await props.params;
    return <NotImplemented label={`Documentation: ${params.topic}`}/>
}