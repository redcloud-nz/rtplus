/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { OrganizationData } from './schemas/organization'

export type IntegrationID = 'd4h'

export interface Integration {
    integrationId: IntegrationID
    label: string
    settingsKey: keyof OrganizationData['settings']['integrations']
}

export const Integrations: Integration[] = [
    { integrationId: 'd4h', label: 'D4H Integration', settingsKey: 'd4h' },
] as const

/**
 * Check if an integration is enabled for the given organization.
 * @param organization The organization data
 * @param integrationId The ID of the integration to check
 * @returns True if the integration is enabled, false otherwise
 */
export function isIntegrationEnabled(organization: OrganizationData, integrationId: IntegrationID): boolean {
    const integration = Integrations.find(i => i.integrationId === integrationId)
    if (!integration) throw new Error(`Unknown integration ID: ${integrationId}`)

    const integrationsSettings = organization.settings.integrations || {}
    return integrationsSettings[integration.settingsKey]?.enabled === true
}