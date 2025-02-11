/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /organization-switcher/[...organization-switcher]
 */

import { OrganizationSwitcher } from '@clerk/nextjs'

export default function OrganizationSwitcherPage() {
  return <OrganizationSwitcher 
    hideSlug={false}
    hidePersonal={false}
    afterCreateOrganizationUrl="/teams/:slug"
    afterSelectOrganizationUrl="/teams/:slug"
    afterSelectPersonalUrl="/me"
  />
}