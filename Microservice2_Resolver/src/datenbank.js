import { JSONFilePreset } from "lowdb/node";
import logging            from "logging";

const logger = logging.default("datenbank");


// Anfangsdaten, wenn die Datenbank-Datei noch nicht existiert
const anfangsDaten =  {

    "testlink_aktiv": {
        "url": "https://nodejs.org/en/about/previous-releases#release-schedule",
        "beschreibung": "Node.js Release Schedule",
        "ist_aktiv": true,
        "erstellt_am": "2024-03-09T16:03:00Z",
        "geaendert_am": "2023-03-09T17:30:20Z"
    }, 
    "testlink_inaktiv": {
        "url": "https://kafka.js.org/docs/admin#a-name-create-topics-a-create-topics",
        "beschreibung": "kafka.js - Admin API - createTopics()",
        "ist_aktiv": false,
        "erstellt_am": "2021-01-01T00:00:00Z",
        "geaendert_am": "2023-01-01T03:12:00Z"
    }
};


/* Objekt für Zugriff auf Datenbank. */
let datenbank = null;


/**
 * Datenbank initialisieren.
 * 
 * @param {*} dateiname Dateiname für Datenbankdatei (jede Microservice-Instanz 
 *                      muss eine eigene Datenbankdatei haben)
 */
export async function datenbankInitialisieren(dateiname) {
    
    datenbank = await JSONFilePreset( dateiname, anfangsDaten );
    await datenbank.write();

    const anzahlSchluessel = Object.keys( datenbank.data ).length;
    logger.info(`Datenbank "${dateiname}", Anzahl Shortlinks: ${anzahlSchluessel}`);
}


/**
 * Datensatz für Shortlink mit `kuerzel` suchen.
 * 
 * @param {*} kuerzel Kürzel des Short-Links
 * 
 * @returns Datensatz für `kuerzel` oder `undefined`, wenn nicht vorhanden
 */
export function getByKuerzel(kuerzel) {

    return datenbank.data[ kuerzel ];
}
