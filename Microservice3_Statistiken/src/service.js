import logging from "logging";

import { insert }                        from "./datenbank.js";
import { queryRecordsByKuerzelUndDatum } from "./datenbank.js";

const logger = logging.default("service");


/**
 * Statistik-Datensatz verbuchen.
 *
 * @param {*} statistikObjekt  Statistik-Datensatz, das verbucht werden soll.
 */
export async function statistikDatensatzVerbuchen(statistikObjekt) {

    statistikObjekt.datum = statistikObjekt.zeitpunkt.substring(0, 10); // nur erste 10 Zeichen von z.B. 2024-03-15T09:50:36.765Z

    delete statistikObjekt.zeitpunkt;

    await insert(statistikObjekt);

    logger.info(`Statistik-Datensatz verbucht: ${JSON.stringify(statistikObjekt)}`);
}


/**
 * Ermittelt die Anzahl der erfolgreichen und erfolglosen Zugriffe für den Shortlink
 * mit dem angegebenen Kürzel am angegebenen Datum.
 *
 * @param {string} kuerzel Kürzel des Shortlinks
 *
 * @param {string} datum Datum im Format "YYYY-MM-DD"
 *
 * @returns Objekt mit folgenden Attributen: `kuerzel`, `datum`, `anzahl_erfolg`, `anzahl_erfolglos`.
 *          Wenn keine Datensätze gefunden werden, dann wird ein Objekt mit `anzahl_erfolg=0` und
 *          `anzahl_erfolglos=0` zurückgegeben.
 */
export function getZusammenfassungFuerTagUndLink(kuerzel, datum) {

    const datensaetzeArray = queryRecordsByKuerzelUndDatum(kuerzel, datum);

    const anzahlErfolg    = datensaetzeArray.filter( datensatz => datensatz.erfolg === true  ).length;
    const anzahlErfolglos = datensaetzeArray.filter( datensatz => datensatz.erfolg === false ).length;

    return {
        "kuerzel"          : kuerzel,
        "datum"            : datum,
        "anzahl_erfolg"    : anzahlErfolg,
        "anzahl_erfolglos" : anzahlErfolglos
    };
}
