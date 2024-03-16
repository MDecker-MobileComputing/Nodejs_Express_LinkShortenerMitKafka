import logging from "logging";
import moment  from "moment";

import { insert }                        from "./datenbank.js";
import { queryRecordsByKuerzelUndDatum } from "./datenbank.js";
import { queryRecordsByKuerzelUndMonat } from "./datenbank.js";


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
 * Kürzel von Shortlink auf Gültigkeit prüfen (nur Buchstaben, Ziffern, Bindestrich und Unterstrich).
 *
 * @param {*} kuerzel Kürzel, das zu überprüfen ist.
 *
 * @returns `true` gdw. Kürzel gültig ist, sonst `false`.
 */
export function checkKuerzel(kuerzel) {

    const KUERZEL_REGEXP = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

    return KUERZEL_REGEXP.test(kuerzel);
}


/**
 * Datum auf Gültigkeit prüfen (Format "YYYY-MM-DD", kein Datum in
 * der Zukunft).
 *
 * @param {string} datum Datum, das zu überprüfen ist.
 *
* @returns `true` gdw. wenn Datum gültig ist
 */
export function checkDatum(datum) {

    const momentDatum = moment(datum, "YYYY-MM-DD", true);

    if (momentDatum.isValid() == false) {

        logger.warn(`Datum ist syntaktisch nicht korrekt: ${datum}`);
        return false;
    }

    const jetzt = moment();
    if (momentDatum.isAfter(jetzt)) {

        logger.warn(`Datum liegt in der Zukunft: ${datum}`);
        return false;
    }

    return true;
}


/**
 * Monatsangabe auf Gültigkeit prüfen (Format "YYYY-MM", kein Monat in
 * der Zukunft).
 * 
 * @param {string} monatUndJahr Monagsangabe im Format "YYYY-MM"
 * 
 * @returns `true` gdw. wenn Monatsangabe gültig ist (syntaktisch korrekt 
 *          und nicht in der Zukunft liegend).
 */
export function checkMonat(monatUndJahr) {

    const momentDatum = moment(monatUndJahr, "YYYY-MM", true);

    if (momentDatum.isValid() == false) {

        logger.warn(`Monatsangabe ist syntaktisch nicht korrekt: ${monatUndJahr}`);
        return false;
    }

    const jetzt = moment();
    if (momentDatum.isAfter(jetzt)) {

        logger.warn(`Montagsangabe liegt in der Zukunft: ${monatUndJahr}`);
        return false;
    }

    return true;
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
export function getStatsFuerTagUndLink(kuerzel, datum) {

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


/**
 * Ermittelt die Anzahl der erfolgreichen und erfolglosen Zugriffe für den Shortlink
 * mit dem angegebenen Kürzel im angegebenen Monat.
 * 
 * @param {*} kuerzel Shortlink
 * 
 * @param {*} monat   Monat im Format "YYYY-MM"
 * 
 * @return {Array} Array mit Objekten, die die Anzahl der erfolgreichen und erfolglosen
 *                 Zugriffe für jeden Tag im Monat enthalten; kann leerer Array sein,
 *                 aber nicht `null`.
 */
export function getStatsFuerMonatUndLink(kuerzel, monat) {

    const datensaetzeArray = queryRecordsByKuerzelUndMonat(kuerzel, monat); // sortiert nach aufsteigendem Tag
    if (datensaetzeArray.length === 0) { 
        
        return []; 
    }

    const ergebnisArray = [];

    let aktuellerTag = datensaetzeArray[0].datum;
    let aktuellesErgebnisObjekt = { "datum" : aktuellerTag, "anzahl_erfolg" : 0, "anzahl_erfolglos" : 0 };
    ergebnisArray.push(aktuellesErgebnisObjekt);

    for (let datensatz of datensaetzeArray) {

        const datumVonDatensatz = datensatz.datum;
        if (aktuellerTag === datumVonDatensatz) {

            if (datensatz.erfolg === true) { aktuellesErgebnisObjekt.anzahl_erfolg++; }                
            else { aktuellesErgebnisObjekt.anzahl_erfolglos++; }

        } else { // neuen Tag anfangen
            
            aktuellerTag = datumVonDatensatz;
            aktuellesErgebnisObjekt = { "datum" : aktuellerTag, "anzahl_erfolg" : 0, "anzahl_erfolglos" : 0 };
            ergebnisArray.push(aktuellesErgebnisObjekt);

            if (datensatz.erfolg === true) { aktuellesErgebnisObjekt.anzahl_erfolg++; }                
            else { aktuellesErgebnisObjekt.anzahl_erfolglos++; }
        }        
    }

    return ergebnisArray;
}
