import Artie from "@/components/art/artie"
import { SpeechBubble2 } from "@/components/art/speech-bubble"



export function ArtieTest() {

    return <div className="relative">
        <Artie pose="Empty" />
        <SpeechBubble2
            text="No Teams!" 
            direction="left"
            position={{ top: '50px', right: '-50px' }}
        />
    </div>
}