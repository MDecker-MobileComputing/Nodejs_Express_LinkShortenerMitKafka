import { Kafka, logLevel } from "kafkajs";
import logging             from "logging";

const logger = logging.default("kafka-sender");


const kafka = new Kafka({ brokers: [ "localhost:9092" ],
                          clientId: "nodejs-kafka-sender",
                          logLevel: logLevel.ERROR
                        });

/*
const kafka = new Kafka({
    clientId: "nodejs-kafka-sender",
    brokers: ["zimolong.eu:9092"],
    sasl: {
        mechanism: "plain",
        username: "alice",
        password: "g3h3im"
    },
    ssl: false, // Disabling SSL as you're using SASL_PLAINTEXT
    connectionTimeout: 1000,
    authenticationTimeout: 1000,
    logLevel: logLevel.ERROR,
});
*/


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
            // passwort darf NICHT enthalten sein!
        };
    
        const shortlinkObjektAlsJsonString = JSON.stringify(transportObjekt);

        const nachrichtObjekt = {
            key: shortlinkObjekt.kuerzel,
            value: shortlinkObjektAlsJsonString
        };

        await producer.connect();
        logger.info("Kafka-Producer verbunden.")

        await producer.send({
                    topic: "Dozent.Decker.ShortLinks",
                    messages: [ nachrichtObjekt ]
        });
        
        await producer.disconnect();

        logger.info(`Kafka-Nachricht für Shortlink mit Kürzel ${shortlinkObjekt.kuerzel} gesendet.`);
        return true;
    }
    catch (fehler) {

        logger.error("Fehler beim Senden der Kafka-Nachricht: " + error);
        return false;
    }
}