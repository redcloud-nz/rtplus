/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */


export interface ContrastTextColorConfig {
    threshold: number
    darkColor: string
    lightColor: string
}

export const defaultContrastTextColorConfig: ContrastTextColorConfig = { 
    threshold: 128, 
    darkColor: '#030712', // gray-950
    lightColor: '#f9fafb' // gray-50
}

/**
 * Get the contrast text color for a given background color.
 * @param bgColor The background color.
 * @returns The contrast text color (black or white).
 */
export function getContrastTextColor(bgColor: string, config: Partial<ContrastTextColorConfig> = {}): string {
    const { threshold, darkColor, lightColor } = { ...defaultContrastTextColorConfig, ...config }

    // Remove the leading hash if it's there
    if(bgColor.startsWith('#')) {
        bgColor = bgColor.substring(1)
    }

    // If a three-character hex code, make it six-character
    if((bgColor.length === 3)) {
        bgColor = bgColor.split('').map(c => c + c).join('')
    }
    
    // Extract the RGB values
    const r = parseInt(bgColor.substring(0, 2), 16)
    const g = parseInt(bgColor.substring(2, 4), 16)
    const b = parseInt(bgColor.substring(4, 6), 16)

    // Calculate the YIQ ratio
    const yiqRatio = ((r * 299) + (g * 587) + (b * 114)) / 1000

    // Return black for bright background and white for dark backgrounds
    return yiqRatio >= threshold ? darkColor : lightColor
}