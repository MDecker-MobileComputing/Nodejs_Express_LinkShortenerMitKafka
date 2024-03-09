import logging from "logging";
import moment  from "moment";

import { getByKuerzel } from "./datenbank.js";


const logger = logging.default("service");


/**
 * Mit moment.js Datum+Zeit im ISO-Format in deutsches Format umwandeln.
 * 
 * @param {*} isoDatum Datum+Zeit im ISO-Format
 * 
 * @returns Darstellung im deutschen Format; 
 *          Beispiel: `9. März 2024 (Sa.), 19:34:56`
 */
function isoDateToGerman(isoDatum) {

    const germanFormat = moment(isoDatum).locale("de").format("D. MMMM YYYY (ddd), HH:mm:ss");
    return germanFormat;
}


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

            dbErgebnisObjekt.erstellt_am  = isoDateToGerman( dbErgebnisObjekt.erstellt_am  );
            dbErgebnisObjekt.geaendert_am = isoDateToGerman( dbErgebnisObjekt.geaendert_am );

            return dbErgebnisObjekt;
        }        
    }
}
