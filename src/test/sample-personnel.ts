/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { Person as PersonRecord } from '@prisma/client'
import { createSampleObject } from './utils'

type SamplePerson = Pick<PersonRecord, 'personId' | 'name' | 'email'>

const names = [
    'Ayaz Iovita',
    'Beatrix Lavinia',
    'Commodus Feliciano',
    'Dionysius Vittorio',
    'Elara Marcellus',
    'Faustina Octavia',
    'Gaius Tullius',
    'Helena Sabina',
    'Inga Erkki',
    'Julius Severus',
    'Kim Hermanni',
    'Larissa Eligia',
    'Marcus Aelius',
    'Natalia Flavia',
    'Octavius Crispus',
    'Pavel Viktor',
] as const

export const SamplePersonnel = createSampleObject(names, (name, index): SamplePerson => {
    const personId = `PID${(index + 1).toString().padStart(5, '0')}`
    const email = `${name.toLowerCase().replace(/ /g, '.')}@test.rtplus.nz`
    return { personId, name, email }
})

// const AyazIovita: SamplePerson = {
//     personId: 'PID00001',
//     name: 'Ayaz Iovita',
//     email: 'ayaz.iovita@test.rtplus.nz',
// }

// const BeatrixLavinia: SamplePerson = {
//     personId: 'PID00002',
//     name: 'Beatrix Lavinia',
//     email: 'beatrix.lavinia@test.rtplus.nz',
// }

// const CommodusFeliciano: SamplePerson = {
//     personId: 'PID00003',
//     name: 'Commodus Feliciano',
//     email: 'commodus.feliciano@test.rtplus.nz',
// }

// const DionysiusVittorio: SamplePerson = {
//     personId: 'PID00004',
//     name: 'Dionysius Vittorio',
//     email: 'dionysius.vittorio@test.rtplus.nz',
// }

// const ElaraMarcellus: SamplePerson = {
//     personId: 'PID00005',
//     name: 'Elara Marcellus',
//     email: 'elara.marcellus@test.rtplus.nz',
// }

// const FaustinaOctavia: SamplePerson = {
//     personId: 'PID00006',
//     name: 'Faustina Octavia',
//     email: 'faustina.octavia@test.rtplus.nz',
// }

// const GaiusTullius: SamplePerson = {
//     personId: 'PID00007',
//     name: 'Gaius Tullius',
//     email: 'gaius.tullius@test.rtplus.nz',
// }

// const HelenaSabina: SamplePerson = {
//     personId: 'PID00008',
//     name: 'Helena Sabina',
//     email: 'helena.sabina@test.rtplus.nz',
// }

// const IngaErkki: SamplePerson = {
//     personId: 'PID00009',
//     name: 'Inga Erkki',
//     email: 'inga.erkki@test.rtplus.nz',
// }

// const JuliusSeverus: SamplePerson = {
//     personId: 'PID00010',
//     name: 'Julius Severus',
//     email: 'julius.severus@test.rtplus.nz',
// }

// const KimHermanni: SamplePerson = {
//     personId: 'PID00011',
//     name: 'Kim Hermanni',
//     email: 'kim.hermanni@test.rtplus.nz',
// }

// const LarissaEligia: SamplePerson = {
//     personId: 'PID00012',
//     name: 'Larissa Eligia',
//     email: 'larissa.eligia@test.rtplus.nz',
// }

// const MarcusAelius: SamplePerson = {
//     personId: 'PID00013',
//     name: 'Marcus Aelius',
//     email: 'marcus.aelius@test.rtplus.nz',
// }

// const NataliaFlavia: SamplePerson = {
//     personId: 'PID00014',
//     name: 'Natalia Flavia',
//     email: 'natalia.flavia@test.rtplus.nz',
// }

// const OctaviusCrispus: SamplePerson = {
//     personId: 'PID00015',
//     name: 'Octavius Crispus',
//     email: 'octavius.crispus@test.rtplus.nz',
// }

// const PavelViktor: SamplePerson = {
//     personId: 'PID00016',
//     name: 'Pavel Viktor',
//     email: 'pavel.viktor@test.rtplus.nz',
// }

// const QuirinusSilvanus: SamplePerson = {
//     personId: 'PID00017',
//     name: 'Quirinus Silvanus',
//     email: 'quirinus.silvanus@test.rtplus.nz',
// }

// const RufusTiberius: SamplePerson = {
//     personId: 'PID00018',
//     name: 'Rufus Tiberius',
//     email: 'rufus.tiberius@test.rtplus.nz',
// }

// const SilviaLivia: SamplePerson = {
//     personId: 'PID00019',
//     name: 'Silvia Livia',
//     email: 'silvia.livia@test.rtplus.nz',
// }

// const TiberiusAurelius: SamplePerson = {
//     personId: 'PID00020',
//     name: 'Tiberius Aurelius',
//     email: 'tiberius.aurelius@test.rtplus.nz',
// }

// const SamplePersonnel2 = {
//     All: [
//         AyazIovita,
//         BeatrixLavinia,
//         CommodusFeliciano,
//         DionysiusVittorio,
//         ElaraMarcellus,
//         FaustinaOctavia,
//         GaiusTullius,
//         HelenaSabina,
//         IngaErkki,
//         JuliusSeverus,
//         KimHermanni,
//         LarissaEligia,
//         MarcusAelius,
//         NataliaFlavia,
//         OctaviusCrispus,
//         PavelViktor,
//         QuirinusSilvanus,
//         RufusTiberius,
//         SilviaLivia,
//         TiberiusAurelius,
//     ],
//     AyazIovita,
//     BeatrixLavinia,
//     CommodusFeliciano,
//     DionysiusVittorio,
//     ElaraMarcellus,
//     FaustinaOctavia,
//     GaiusTullius,
//     HelenaSabina,
//     IngaErkki,
//     JuliusSeverus,
//     KimHermanni,
//     LarissaEligia,
//     MarcusAelius,
//     NataliaFlavia,
//     OctaviusCrispus,
//     PavelViktor,
//     QuirinusSilvanus,
//     RufusTiberius,
//     SilviaLivia,
//     TiberiusAurelius,
// } as const
