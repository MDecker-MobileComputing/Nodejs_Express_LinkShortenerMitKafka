import logging   from "logging";

import { getShortlinkByKuerzel } from "./datenbank.js";
import { upsert                } from "./datenbank.js";
import { sendeKafkaNachricht   } from "./kafka.js";

const logger = logging.default("service");


/**
 * Zufälliges Passwort generieren.
 *
 * @returns Passwort, z.B. `n0i6fs` oder `ub5mfk`.
 */
function passwortGenerieren() {

    const passwort = Math.random().toString(36).substring(2, 8);
    return passwort;
}


/**
 * Service-Funktion für neuen Shortlink.
 *
 * @param {} shortlinkObjekt Objekt mit Daten für neuen Shortlink; bei Erfolg
 *                           enthält es die folgenden zusätzlichen Attribute:
 *                           - `passwort` (generiertes Passwort)
 *                           - `erstellt_am` (Datum/Zeitpunkt der Erstellung)
 *                           - `geaendert_am` (selber Wert wie `erstellt_am`)
 *
 * @return {object} Fehlerobjekt; es ist leer, wenn kein Fehler aufgetreten ist.
 *                  Dann kann über `shortlinkObjekt.passwort` das generierte Passwort
 *                  ausgelesen werden, sowie die Datum/Zeitpunkte über `shortlinkObjekt.erstellt_am`
 *                  und `shortlinkObjekt.geaendert_am` (wegen "Call by Reference" sind diese
 *                  Änderungen für den Aufrufer sichtbar).
 *                  Bei Fehlern ist entweder das Attribut `nutzerfehler` oder `kafkafehler`
 *                  gesetzt.
 */
export async function shortlinkNeu(shortlinkObjekt) {

    const dbErgebnis = await getShortlinkByKuerzel( shortlinkObjekt.kuerzel );
    if (dbErgebnis) {

        logger.info(`Shortlink existiert bereits: ${shortlinkObjekt.kuerzel}`);
        return { nutzerfehler: "Shortlink existiert bereits" };
    }

    shortlinkObjekt.passwort = passwortGenerieren();

    const jetztDateIsoString = new Date().toISOString();
    shortlinkObjekt.erstellt_am  = jetztDateIsoString;
    shortlinkObjekt.geaendert_am = jetztDateIsoString;

    await upsert(shortlinkObjekt);

    const kafkaErfolg = await sendeKafkaNachricht(shortlinkObjekt);
    if (kafkaErfolg) {

        return {}; // leeres Fehlerobjekt

    } else {

        return { kafkafehler: "Shortlink konnte nicht über Kafka versendet werden." };
    }
}

/**
 * Methode überprüft, ob `passwort` das Änderungspasswort für den Shortlink
 * mit Kürzel `kuerzel` ist.
 *
 * @param {*} kuerzel Kürzel von Shortlin
 *
 * @param {*} passwort  für den Shortlink mit `kuerzel`.
 *
 * @returns `true` wenn das Passwort korrekt ist, sonst `false`.
 */
export function pruefeAenderungspasswort(kuerzel, passwort) {

    const shortlinkObjekt = getShortlinkByKuerzel(kuerzel);
    if (!shortlinkObjekt) {

        logger.error(`Interner Fehler: Shortlink mit Kürzel ${kuerzel} nicht gefunden.`);
        return false;
    }

    if (shortlinkObjekt.passwort === passwort) {

        return true;
    }

    return false;
}
