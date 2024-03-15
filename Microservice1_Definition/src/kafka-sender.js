import { Kafka, logLevel } from "kafkajs";
import logging             from "logging";

import plainNutzernamePasswort from '../../kafka-sasl.js';

const logger = logging.default("kafka-sender");

const clientId = "nodejs-link-definition-sender"


const kafka = new Kafka({ brokers: [ "localhost:9092" ],
                          clientId: clientId,
                          logLevel: logLevel.ERROR
                        });
/*
const kafka = new Kafka({
    clientId: clientId,
    brokers: ["zimolong.eu:9092"],
    sasl: plainNutzernamePasswort,
    ssl: false, // Disabling SSL as you're using SASL_PLAINTEXT
    connectionTimeout: 1000,
    authenticationTimeout: 1000,
    logLevel: logLevel.ERROR,
});
*/


let verbunden = false;

const producer = kafka.producer();


/**
 * Neuen oder geänderten Shortlink via Kafka an die Resolver-Microservices senden.
 *
 * @param {object} shortlinkObjekt  Shortlink-Objekt, das gesendet werden soll; auch
 *                                  bei Änderungen müssen alle Attribute gesetzt sein.
 *
 * @return {boolean} `true` wenn die Nachricht erfolgreich gesendet wurde, sonst `false`.
 */
export async function sendeKafkaNachricht(shortlinkObjekt) {

    try {

        // Neues Objekt für Kafka-Nachricht erstellen, das nur die benötigten
        // Attribute enthält (Passwort darf nicht über Kafka gesendet werden).
        const transportObjekt = {
            kuerzel     : shortlinkObjekt.kuerzel,
            url         : shortlinkObjekt.url,
            beschreibung: shortlinkObjekt.beschreibung,
            ist_aktiv   : shortlinkObjekt.ist_aktiv,
            erstellt_am : shortlinkObjekt.erstellt_am,
            geaendert_am: shortlinkObjekt.geaendert_am
        };

        const shortlinkObjektAlsJsonString = JSON.stringify(transportObjekt);

        // Schlüssel als Key der Nachricht, damit eine Änderung des Shortlinks
        // nicht die Originalnachricht überholt. Nachrichten mit demselben Schlüssel
        // kommen nämlich in dieselbe Partition des Topics, und nur für eine Partition
        // ist gewährleistet, dass eine Nachricht nicht eine andere überholt.
        const nachrichtObjekt = {
            key  : shortlinkObjekt.kuerzel,
            value: shortlinkObjektAlsJsonString
        };

        if (verbunden === false) {

            logger.info("Versuche Verbindung zu Kafka-Server aufzubauen...");
            await producer.connect();
            logger.info("Verbindung zu Kafka-Server aufgebaut.");
            verbunden = true;

        } else {

            logger.info("Kafka-Producer war schon verbunden.")
        }

        await producer.send({ topic: "Dozent.Decker.ShortLinks",
                              messages: [ nachrichtObjekt ]
                            });

        logger.info(`Kafka-Nachricht für Shortlink mit Kürzel "${shortlinkObjekt.kuerzel}" gesendet.`);

        //await producer.disconnect();
        // disconnect erst beim Herunterfahren des Microservices ... aber wie fängt man das ab?

        return true;
    }
    catch (fehler) {

        logger.error(`Fehler beim Senden einer Kafka-Nachricht für Kürzel "${shortlinkObjekt.kuerzel}": ${fehler}`);
        return false;
    }
}
