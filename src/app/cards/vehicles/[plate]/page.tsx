/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /cards/vehicles/[plate]
 */

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'

import { VehicleInfo, VehicleList } from '@/data/vehicles'


export default async function VehicleReferenceCard(props: { params: Promise<{ plate: string}> }) {
    const params = await props.params;

    const vehicle = VehicleList.find(v => v.plate == params.plate)
    if(vehicle == undefined) return <NotFound/>

    return <AppPage
        label={vehicle.plate}
        breadcrumbs={[
            { label: 'Cards', href: "/cards" },
            { label: 'Vehicles', href: "/card/vehicles" },
        ]}
    >
        <PageTitle>{vehicle.plate}</PageTitle>
        <PageDescription>{vehicle.name}</PageDescription>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <DL>
                        <DLTerm>Owner</DLTerm>
                        <DLDetails>{vehicle.owner}</DLDetails>
                    
                        <DLTerm>Make</DLTerm>
                        <DLDetails>{vehicle.make}</DLDetails>
                    
                        <DLTerm>Model</DLTerm>
                        <DLDetails>{vehicle.model} ({vehicle.subModel})</DLDetails>
                    
                        <DLTerm>Body Style</DLTerm>
                        <DLDetails>{vehicle.bodyStyle}</DLDetails>
                    
                        <DLTerm>Colour</DLTerm>
                        <DLDetails>{vehicle.colour}</DLDetails>
                    
                        <DLTerm>Seats</DLTerm>
                        <DLDetails>{vehicle.seats}</DLDetails>
                    
                        <DLTerm>Fuel Type</DLTerm>
                        <DLDetails>{vehicle.fuel}</DLDetails>
                    
                        <DLTerm>Gross Vehicle Mass</DLTerm>
                        <DLDetails>{vehicle.gvm}kg</DLDetails>
                    
                        <DLTerm>Tare Weight</DLTerm>
                        <DLDetails>{vehicle.tare}kg</DLDetails>
                    
                        <DLTerm>Towing Capacity</DLTerm>
                        <DLDetails>
                            <div>{vehicle.towing?.unbraked}kg (unbraked)</div>
                            <div>{vehicle.towing?.braked}kg (braked)</div>
                        </DLDetails>
                    </DL>
                </CardContent>
                
            </Card>
            <DimensionsSection dimensions={vehicle.dimensions}/>
            <Card>
                <CardHeader>
                    <CardTitle>Basic Maintence</CardTitle>
                </CardHeader>
                <CardContent>
                    <DL>
                        <DLTerm>Battery</DLTerm>
                        <DLDetails>Under passenger seat. Jump start from contacts in engine bay (nearside).</DLDetails>
                        <DLTerm>Toolkit</DLTerm>
                        <DLDetails>Passenger footwell</DLDetails>
                        <DLTerm>Jack</DLTerm>
                        <DLDetails>Drivers step</DLDetails>
                        <DLTerm>Spare Wheel</DLTerm>
                        <DLDetails>In cradle underneath rear. Lower using bolts under covers.</DLDetails>
                    </DL>
                </CardContent>
            </Card>
        </div>
        
    </AppPage>
}


interface DimensionsSectionProps {
    dimensions: VehicleInfo['dimensions']
}

function DimensionsSection({ dimensions }: DimensionsSectionProps) {
    if(!dimensions) return null
    const { length: l, width: w, height: h, wheelbase: wb } = dimensions

    const ml = 1250 // margin left
    const mr = 500 // margin right
    const mt = 500 // margin top
    const mb = 500 // margin bottom
    const gap = 500 // gap

    const ws = (l - wb) / 2
    const wr = 300 // wheel radius
    const wwr = 350 // wheel well radius
    const mw = 200 // mirror width
    const mx = ws+wr // mirror x

    const a1 = { x: ws, y: h-wr } // Front Axel
    const a2 = { x: ws+wb, y: h-wr } // Front Axel

    return <Card>
        <CardHeader>
            <CardTitle>Dimensions</CardTitle>
        </CardHeader>
       
        <svg className="w-full" viewBox={`0 0 ${ml+l+mr} ${mt+h+gap+w+mb}`}>
            <defs>
                <marker
                    id="triangle"
                    viewBox="0 0 10 10"
                    refX="1"
                    refY="5"
                    markerUnits="strokeWidth"
                    markerWidth="10"
                    markerHeight="10"
                    orient="auto"
                >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#888" />
                </marker>
            </defs>
            <g transform={`translate(${ml+l/2}, ${mt/2})`}>
                <path d={`M 0 0 H ${l/2}`} strokeWidth={10} stroke="#888" markerEnd="url(#triangle)"/>
                <path d={`M 0 0 H -${l/2}`} strokeWidth={10} stroke="#888" markerEnd="url(#triangle)"/>
                <text textAnchor="middle" x="0" y="-50" fontSize={l/30} fill="#666">{l}mm</text>
            </g>
            <g transform={`translate(${ml-ml/5}, ${mt+h/2})`}>
                <path d={`M 0 0 V ${h/2}`} strokeWidth={10} stroke="#888" markerEnd="url(#triangle)"/>
                <path d={`M 0 0 V -${h/2}`} strokeWidth={10} stroke="#888" markerEnd="url(#triangle)"/>
                <text textAnchor="end" x="-50" y="0" fontSize={l/30} fill="#666">{h}mm</text>
            </g>
            <g transform={`translate(${ml+l/2}, ${mt+h+gap/2})`}>
                <path d={`M 0 0 H ${wb/2}`} strokeWidth={10} stroke="#888" markerEnd="url(#triangle)"/>
                <path d={`M 0 0 H -${wb/2}`} strokeWidth={10} stroke="#888" markerEnd="url(#triangle)"/>
                <text textAnchor="middle" x="0" y="-50" fontSize={l/30} fill="#666">{wb}mm</text>
            </g>
            <g transform={`translate(${ml-ml/5}, ${mt+h+gap+w/2})`}>
                <path d={`M 0 0 V ${w/2}`} strokeWidth={10} stroke="#888" markerEnd="url(#triangle)"/>
                <path d={`M 0 0 V -${w/2}`} strokeWidth={10} stroke="#888" markerEnd="url(#triangle)"/>
                <text textAnchor="end" x="-50" y="0" fontSize={l/30} fill="#666">{w}mm</text>
            </g>
            <g transform={`translate(${ml}, ${mt})`}>
                <path 
                    d={
                        `M 0 ${h-wr-100} V ${h/2+150} Q 0 ${h/2+50}, ${a1.x} ${h/2} L ${2*ws} 0 H ${l-100} Q ${l} 0, ${l} 100 V ${h-wr}`+
                        `H ${a2.x+wwr} A ${wwr} ${wwr} 0 0 0 ${a2.x-wwr} ${a2.y} H ${a1.x+wwr} A ${wwr} ${wwr} 0 0 0 ${a1.x-wwr} ${a1.y} H ${ws/2} L ${0} ${h-wr-100}`
                    } 
                    fill="#EEE" strokeWidth={10} stroke="#BBD"
                />
                <circle fill="#222" cx={a1.x} cy={a1.y} r={wr}/>
                <circle fill="#BBB" cx={a1.x} cy={a1.y} r={wr/1.75}/>
                <circle fill="#222" cx={a2.x} cy={a2.y} r={wr}/>
                <circle fill="#BBB" cx={a2.x} cy={a2.y} r={wr/1.75}/>
            </g>
            
            <g transform={`translate(${ml}, ${mt+h+gap})`}>
                <path 
                    d={
                        `M 100 ${mw} H ${mx} L ${mx+25} 0 H ${mx+75} V ${mw} H ${l-100}`+
                        `Q ${l} ${mw}, ${l} ${mw+100} V ${w-mw-100} Q ${l} ${w-mw}, ${l-100} ${w-mw}`+
                        `H ${mx+75} V ${w} H ${mx+25} L ${mx} ${w-mw} H 100`+
                        `Q 0 ${w-mw}, 0 ${w-mw-100} V ${mw+100} Q 0 ${mw}, 100 ${mw}`
                    } 
                    fill="#EEE" strokeWidth={10} stroke="#BBD"
                />
            </g>
        </svg>
    </Card>
}