

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'
import { NotFound } from '@/components/errors'

import { VehicleInfo, VehicleList } from '@/data/vehicles'

import { cn } from '@/lib/utils'


export default function VehicleReferenceCard({ params }: { params: { plate: string} }) {
    
    const vehicle = VehicleList.find(v => v.plate == params.plate)
    if(vehicle == undefined) return <NotFound/>

    return <AppPage
        label={vehicle.plate}
        breadcrumbs={[
            { label: 'Cards', href: "/cards" },
            { label: 'Vehicles', href: "/card/vehicles" },
        ]}
        variant="list"
    >
        <PageTitle>{vehicle.plate}</PageTitle>
        <PageDescription>{vehicle.name}</PageDescription>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="border rounded-md p-2">
                <div className="text-lg font-semibold text-center mb-2">Specifications</div>
                <dl className={cn(
                    'grid grid-cols-[auto_1fr]',
                    '[&_dt]:px-2 [&_dt]:py-1 [&_dt]:font-semibold [&_dt]:text-right [&_dt]:min-w-[100px]',
                    '[&_dd]:px-2 [&_dd]:py-1'
                )}>
                    <dt>Owner</dt>
                    <dd>{vehicle.owner}</dd>
                    <dt>Make</dt>
                    <dd>{vehicle.make}</dd>
                    <dt>Model</dt>
                    <dd>{vehicle.model}</dd>
                    <dt>Sub Model</dt>
                    <dd>{vehicle.subModel}</dd>
                    <dt>Body Style</dt>
                    <dd>{vehicle.bodyStyle}</dd>
                    <dt>Colour</dt>
                    <dd>{vehicle.colour}</dd>
                    <dt>Seats</dt>
                    <dd>{vehicle.seats}</dd>
                    <dt>Fuel</dt>
                    <dd>{vehicle.fuel}</dd>
                    <dt>GVM</dt>
                    <dd>{vehicle.gvm}kg</dd>
                    <dt>Tare Weight</dt>
                    <dd>{vehicle.tare}kg</dd>
                    <dt>Towing</dt>
                    <dd>
                        <div>{vehicle.towing?.unbraked}kg (unbraked)</div>
                        <div>{vehicle.towing?.braked}kg (braked)</div>
                    </dd>
                </dl>
            </div>
            <DimensionsSection dimensions={vehicle.dimensions}/>
            <div className="border rounded-md p-2">
                <div className="text-lg font-semibold text-center mb-2">Tips</div>
                <dl className={cn(
                    'grid grid-cols-[auto_1fr]',
                    '[&_dt]:px-2 [&_dt]:py-1 [&_dt]:font-semibold [&_dt]:text-right [&_dt]:min-w-[100px]',
                    '[&_dd]:px-2 [&_dd]:py-1'
                )}>
                    <dt>Battery</dt>
                    <dd>Under passenger seat. Jump start from contacts in engine bay (nearside).</dd>
                    <dt>Toolkit</dt>
                    <dd>Passenger footwell</dd>
                    <dt>Jack</dt>
                    <dd>Drivers step</dd>
                    <dt>Spare Wheel</dt>
                    <dd>In cradle underneath rear. Lower using bolts under covers.</dd>
                </dl>
            </div>
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

    return <div className="border rounded-md p-2">
        <div className="text-lg font-semibold text-center mb-2">Dimensions</div>
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
    </div>
}