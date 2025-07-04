/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system
 */

import { redirect } from 'next/navigation'

import * as Paths from '@/paths'

export default function RedirectToSystemBase() {
    return redirect(Paths.system.index)
}