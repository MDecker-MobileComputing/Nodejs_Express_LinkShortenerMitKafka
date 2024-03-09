import logging             from "logging";
import { Kafka, logLevel } from "kafkajs";

const logger = logging.default("kafka");


/*
const kafka = new Kafka({ brokers: [ "localhost:9092" ],
                          clientId: "nodejs-kafka-sender",
                          logLevel: logLevel.ERROR
                        });
*/                        

/**
 * Kafka-Empfänger für Shortlink-Definitionen/Updates starten.
 * <br><br
 * Diese Funktion darf erst aufgerufen werden, wenn das Topic existiert!
 * 
 * @param {number} portNummber Port-Nummber für HTTP-Server, wird für Client+GroupID verwendet
 */
export async function kafkaEmpfaengerStarten(portNummber) {

    const clientUndGroupId = `shortlink-resolver-${portNummber}`;

    const kafka = new Kafka({
        clientId: clientUndGroupId,
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
   
    // GroupID hängt von Port-Nummer ab, damit jede Instanz des Microservices eine eigene GroupID hat
    // und somit alle Microservice-Instanzen alle Nachrichten empfangen.
    const consumer = kafka.consumer({ groupId: clientUndGroupId });

    await consumer.connect();

    await consumer.subscribe({ topic: "Dozent.Decker.ShortLinks" });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {

            logger.info(`Shortlink für Kürzel "${message.key}" empfangen: ${message.value}`);
        },
    });

    logger.info(`Kafka-Consumer Client+GroupID "${clientUndGroupId}" gestartet.`);
}

