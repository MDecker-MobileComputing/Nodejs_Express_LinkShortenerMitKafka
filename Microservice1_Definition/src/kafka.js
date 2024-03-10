import { Kafka, logLevel } from "kafkajs";
import logging             from "logging";

import plainNutzernamePasswort from '../../kafka-sasl.js';

const logger = logging.default("kafka-sender");

/*
const kafka = new Kafka({ brokers: [ "localhost:9092" ],
                          clientId: "nodejs-kafka-sender",
                          logLevel: logLevel.ERROR
                        });
*/

const kafka = new Kafka({
    clientId: "nodejs-kafka-sender",
    brokers: ["zimolong.eu:9092"],
    sasl: plainNutzernamePasswort,
    ssl: false, // Disabling SSL as you're using SASL_PLAINTEXT
    connectionTimeout: 1000,
    authenticationTimeout: 1000,
    logLevel: logLevel.ERROR,
});



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

        const transportObjekt = {
            kuerzel: shortlinkObjekt.kuerzel,
            url: shortlinkObjekt.url,
            beschreibung: shortlinkObjekt.beschreibung
            // Passwort darf NICHT enthalten sein, weil das nur Microservice 1 kennen muss
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

        await producer.connect();
        logger.info("Kafka-Producer verbunden.")

        const kafkaResult = await producer.send({
                                    topic: "Dozent.Decker.ShortLinks",
                                    messages: [ nachrichtObjekt ]
                            });

        logger.info(`Kafka-Nachricht für Shortlink mit Kürzel "${shortlinkObjekt.kuerzel}" gesendet.`);

        await producer.disconnect();

        return true;
    }
    catch (fehler) {

        logger.error(`Fehler beim Senden einer Kafka-Nachricht für Kürzel "${shortlinkObjekt.kuerzel}": ${fehler}`);
        return false;
    }
}
