import logging   from "logging";

import { getShortlinkByKuerzel, upsert } from "./datenbank.js";

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
 * @param {} shortlinkObjekt Objekt mit Daten für neuen Shortlink
 * 
 * @return {string} Passwort für neuen Shortlink, oder leerer String, wenn
 *                  Shortlink bereits existiert.
 */
export async function shortlinkNeu(shortlinkObjekt) {

    const dbErgebnis = await getShortlinkByKuerzel( shortlinkObjekt.kuerzel );
    if (dbErgebnis) {

        logger.info(`Shortlink existiert bereits: ${shortlinkObjekt.kuerzel}`);
        return false;
    }

    shortlinkObjekt.passwort = passwortGenerieren();

    await upsert(shortlinkObjekt);

    return true;
}
