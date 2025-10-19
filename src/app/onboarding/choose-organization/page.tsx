/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /onboarding/choose-organization
 */

import { TaskChooseOrganization } from  '@clerk/nextjs'

export default function Onboarding_ChooseOrganization_Page() {

    return <TaskChooseOrganization redirectUrlComplete='/dashboard' />
}