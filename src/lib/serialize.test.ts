/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { withSerializedDates } from './serialize'

describe('withSerializedDates', () => {
    it('should serialize Date objects to ISO strings', () => {
        const input = new Date('2024-01-01T00:00:00Z');
        const result = withSerializedDates(input);
        expect(result).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should serialize nested Date objects to ISO strings', () => {
        const input = { date: new Date('2024-01-01T00:00:00Z') };
        const result = withSerializedDates(input);
        expect(result).toEqual({ date: '2024-01-01T00:00:00.000Z' });
    });

    it('should serialize arrays of Date objects to ISO strings', () => {
        const input = [new Date('2024-01-01T00:00:00Z')];
        const result = withSerializedDates(input);
        expect(result).toEqual(['2024-01-01T00:00:00.000Z']);
    });

    it('should handle mixed objects with dates and other types', () => {
        const input = {
            date: new Date('2024-01-01T00:00:00Z'),
            name: 'Test',
            nested: {
                date: new Date('2024-01-01T00:00:00Z'),
                value: 42
            }
        };
        const result = withSerializedDates(input);
        expect(result).toEqual({
            date: '2024-01-01T00:00:00.000Z',
            name: 'Test',
            nested: {
                date: '2024-01-01T00:00:00.000Z',
                value: 42
            }
        });
    });

    it('should return non-date values unchanged', () => {
        const input = 42;
        const result = withSerializedDates(input);
        expect(result).toBe(42);
    });
});
