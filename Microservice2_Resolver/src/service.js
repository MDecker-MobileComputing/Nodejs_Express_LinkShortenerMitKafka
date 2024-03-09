import logging from "logging";

import { getByKuerzel, upsert } from "./datenbank.js";


const logger = logging.default("service");


/**
 * Service-Funktion für Auflösen von Shortlink.
 * 
 * @param {*} kuerzel Kürzel von Shortlink, der aufgelöst werden soll
 * 
 * @returns Objekt mit URL und Beschreibung des Shortlinks oder leeres Objekt, 
 *          wenn nicht gefunden oder gefundener Shortlink deaktiviert ist.
 */
export function shortlinkAufloesen(kuerzel) {

    const dbErgebnisObjekt = getByKuerzel(kuerzel);
    if (dbErgebnisObjekt === undefined) {

        logger.info(`Kürzel nicht gefunden: ${kuerzel}`);
        return {};

    } else {

        if (dbErgebnisObjekt.ist_aktiv === false) {

            logger.info(`Kürzel gefunden, ist aber deaktiviert: ${kuerzel}`);
            return {};

        } else {

            logger.info(`Kürzel gefunden, ist aktiv: ${kuerzel}`);

            return dbErgebnisObjekt;
        }        
    }
}


/**
 * Shortlink-Datensatz (via Kafka empfangen) neu anlegen oder aktualisieren.
 * 
 * @param {*} shortlinkObjekt 
 */
export async function neuOderAktualisieren(shortlinkObjekt) {

    const dbErgebnisObjekt = getByKuerzel(kuerzel);
    if (dbErgebnisObjekt === undefined) {

        logger.info(`Versuche neuen Shortlink in DB zu speichern: ${shortlinkObjekt.kuerzel}`);
        
    } else {

        logger.info(`Versuche Shortlink in DB zu aktualisieren: ${shortlinkObjekt.kuerzel}`);
    }

    await upsert(shortlinkObjekt);    
}
