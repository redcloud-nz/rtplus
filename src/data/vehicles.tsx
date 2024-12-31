/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

export interface VehicleInfo {
    plate: string
    owner?: string
    name: string
    make?: string
    model?: string
    subModel?: string 
    bodyStyle?: string
    year?: string
    colour?: string
    seats?: number
    fuel?: string
    dimensions?: {
        length: number
        width: number
        height: number
        wheelbase: number
        turningCircle?: number
    },
    gvm?: number
    tare?: number
    towing?: {
        unbraked: number
        braked: number
    }
    extra?: Record<string, string>
}

export const VehicleList: VehicleInfo[] = [
    {
        plate: 'NGT775',
        owner: "Christchurch City Council",
        name: "CCC Command Unit",
        make: "Mercedes-Benz",
        model: "Sprinter",
        subModel: "519 ELWB Minibus",
        bodyStyle: "Heavy Van",
        year: "2021",
        colour: "White",
        seats: 2,
        fuel: 'Diesel',
        dimensions: {
            length: 5932,
            width: 2020,
            height: 2351,
            wheelbase: 3924,
            turningCircle: 14400
        },
        gvm: 5000,
        tare: 3520,
        towing: {
            unbraked: 750,
            braked: 3000
        }
    },
    {
        plate: 'NBG737',
        owner: "Christchurch City Council",
        name: "CCC Support Unit",
        make: "Mercedes-Benz",
        model: "Sprinter",
        subModel: "519 ELWB Minibus",
        bodyStyle: "Heavy Bus/Service Coach",
        year: "2020",
        colour: "Grey",
        seats: 12,
        fuel: 'Diesel',
        dimensions: {
            length: 5932,
            width: 2020,
            height: 2351,
            wheelbase: 3924,
            turningCircle: 14400
        },
        gvm: 5000,
        tare: 3350,
        towing: {
            unbraked: 750,
            braked: 2000
        }
    }
]