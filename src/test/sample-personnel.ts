/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { Person as PersonRecord } from '@prisma/client'

type SamplePerson = Pick<PersonRecord, 'id' | 'name' | 'email'>

const AyazIovita: SamplePerson = {
    id: 'PID00001',
    name: 'Ayaz Iovita',
    email: 'ayaz.iovita@test.rtplus.nz',
}

const BeatrixLavinia: SamplePerson = {
    id: 'PID00002',
    name: 'Beatrix Lavinia',
    email: 'beatrix.lavinia@test.rtplus.nz',
}

const CommodusFeliciano: SamplePerson = {
    id: 'PID00003',
    name: 'Commodus Feliciano',
    email: 'commodus.feliciano@test.rtplus.nz',
}

const DionysiusVittorio: SamplePerson = {
    id: 'PID00004',
    name: 'Dionysius Vittorio',
    email: 'dionysius.vittorio@test.rtplus.nz',
}

const ElaraMarcellus: SamplePerson = {
    id: 'PID00005',
    name: 'Elara Marcellus',
    email: 'elara.marcellus@test.rtplus.nz',
}

const FaustinaOctavia: SamplePerson = {
    id: 'PID00006',
    name: 'Faustina Octavia',
    email: 'faustina.octavia@test.rtplus.nz',
}

const GaiusTullius: SamplePerson = {
    id: 'PID00007',
    name: 'Gaius Tullius',
    email: 'gaius.tullius@test.rtplus.nz',
}

const HelenaSabina: SamplePerson = {
    id: 'PID00008',
    name: 'Helena Sabina',
    email: 'helena.sabina@test.rtplus.nz',
}

const IngaErkki: SamplePerson = {
    id: 'PID00009',
    name: 'Inga Erkki',
    email: 'inga.erkki@test.rtplus.nz',
}

const JuliusSeverus: SamplePerson = {
    id: 'PID00010',
    name: 'Julius Severus',
    email: 'julius.severus@test.rtplus.nz',
}

const KimHermanni: SamplePerson = {
    id: 'PID00011',
    name: 'Kim Hermanni',
    email: 'kim.hermanni@test.rtplus.nz',
}

const LarissaEligia: SamplePerson = {
    id: 'PID00012',
    name: 'Larissa Eligia',
    email: 'larissa.eligia@test.rtplus.nz',
}

const MarcusAelius: SamplePerson = {
    id: 'PID00013',
    name: 'Marcus Aelius',
    email: 'marcus.aelius@test.rtplus.nz',
}

const NataliaFlavia: SamplePerson = {
    id: 'PID00014',
    name: 'Natalia Flavia',
    email: 'natalia.flavia@test.rtplus.nz',
}

const OctaviusCrispus: SamplePerson = {
    id: 'PID00015',
    name: 'Octavius Crispus',
    email: 'octavius.crispus@test.rtplus.nz',
}

const PavelViktor: SamplePerson = {
    id: 'PID00016',
    name: 'Pavel Viktor',
    email: 'pavel.viktor@test.rtplus.nz',
}

const QuirinusSilvanus: SamplePerson = {
    id: 'PID00017',
    name: 'Quirinus Silvanus',
    email: 'quirinus.silvanus@test.rtplus.nz',
}

const RufusTiberius: SamplePerson = {
    id: 'PID00018',
    name: 'Rufus Tiberius',
    email: 'rufus.tiberius@test.rtplus.nz',
}

const SilviaLivia: SamplePerson = {
    id: 'PID00019',
    name: 'Silvia Livia',
    email: 'silvia.livia@test.rtplus.nz',
}

const TiberiusAurelius: SamplePerson = {
    id: 'PID00020',
    name: 'Tiberius Aurelius',
    email: 'tiberius.aurelius@test.rtplus.nz',
}

export const SamplePersonnel = {
    All: [
        AyazIovita,
        BeatrixLavinia,
        CommodusFeliciano,
        DionysiusVittorio,
        ElaraMarcellus,
        FaustinaOctavia,
        GaiusTullius,
        HelenaSabina,
        IngaErkki,
        JuliusSeverus,
        KimHermanni,
        LarissaEligia,
        MarcusAelius,
        NataliaFlavia,
        OctaviusCrispus,
        PavelViktor,
        QuirinusSilvanus,
        RufusTiberius,
        SilviaLivia,
        TiberiusAurelius,
    ],
    AyazIovita,
    BeatrixLavinia,
    CommodusFeliciano,
    DionysiusVittorio,
    ElaraMarcellus,
    FaustinaOctavia,
    GaiusTullius,
    HelenaSabina,
    IngaErkki,
    JuliusSeverus,
    KimHermanni,
    LarissaEligia,
    MarcusAelius,
    NataliaFlavia,
    OctaviusCrispus,
    PavelViktor,
    QuirinusSilvanus,
    RufusTiberius,
    SilviaLivia,
    TiberiusAurelius,
} as const
