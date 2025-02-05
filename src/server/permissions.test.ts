/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { checkSessionPermissions, CompactPermissions } from './permissions'

const IDs = [
    '7a019dd1-2ffe-42ce-8f3e-76b24ea4ad40',
    '106b16a2-241b-434f-99c2-75aca42dfb29',
    '8a03046d-13df-48ec-99c1-b06a40026e30',
    '4d07d3db-8ebf-41b5-ad14-3f89038348df',
    '10f7de32-a6aa-426a-b8b3-637a8a76f276',
    'ed66b12f-efcc-4338-92b7-569f3f3a94d9',
    '4225f24c-9378-49d6-8b2c-ab6777822306',
    'e7a01c8e-b5c6-42d4-9abd-fd563d86485a',
    '3612863c-9bc5-471d-92ea-00a731960f05',
    'da1555e7-3c16-44ce-83b1-3ebe6fbcacd6'
] as const

const shortIDs = IDs.map(id => id.slice(0, 8));

describe('checkSessionPermissions', () => {
    const sessionClaims: CompactPermissions = {
        rt_ssp: {
            [shortIDs[0]]: 'r',
            [shortIDs[1]]: 'rw'
        },
        rt_sp: 'w',
        rt_tp: {
            [shortIDs[6]]: 'r',
            [shortIDs[7]]: 'ar',
            [shortIDs[8]]: 'rw',
            [shortIDs[9]]: 'arw',
        }
    }

    it('should return true for system:write if the user has the permission', () => {

        const resultA = checkSessionPermissions(sessionClaims, 'system:write');
        expect(resultA).toBe(true);
    })

    it('should return false with null session', () => {
        const result = checkSessionPermissions(null, 'system:write');
        expect(result).toBe(false);
    })

    it('should return false for skill-package:write if the user doesnt has the permission', () => {
        const result = checkSessionPermissions(sessionClaims, 'skill-package:write', IDs[0]);
        expect(result).toBe(false);
    })

    it('should return true for skill-package:write if the user has the permission', () => {
        const result = checkSessionPermissions(sessionClaims, 'skill-package:write', IDs[1]);
        expect(result).toBe(true);
    })

    it('should throw an error for skill package write permission with invalid id', () => {
        expect(() => {
            checkSessionPermissions(sessionClaims, 'skill-package:write', 'invalid-id');
        }).toThrow('Invalid skillPackageId: invalid-id');
    })

    it('should return false for team:write if the user doesnt have the permission', () => {
        const result = checkSessionPermissions(sessionClaims, 'team:write', IDs[6]);
        expect(result).toBe(false);
    })

    it('should return true for team:write if the user has the permission', () => {
        const result = checkSessionPermissions(sessionClaims, 'team:read', IDs[8]);
        expect(result).toBe(true);
    })

    it('should throw an error for team:read permission with invalid id', () => {

        expect(() => {
            checkSessionPermissions(sessionClaims, 'team:read', 'invalid-id');
        }).toThrow('Invalid teamId: invalid-id');
    })

    it('should return true for any skill package write permission', () => {
        const result = checkSessionPermissions(sessionClaims, 'skill-package:write', '*');
        expect(result).toBe(true);
    })

    it('should return true for any team read permission', () => {
        const result = checkSessionPermissions(sessionClaims, 'team:read', '*');
        expect(result).toBe(true);
    })

    it('should throw an error for unknown permission prefix', () => {
        expect(() => {
            checkSessionPermissions(sessionClaims, 'unknown:permission' as any);
        }).toThrow('Unknown permission prefix: unknown:permission');
    })
});
