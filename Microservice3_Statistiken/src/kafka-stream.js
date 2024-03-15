import logging from "logging";

import { KafkaStreams } from "kafka-streams";
import { kafkaStreamsConfigObjekt } from "../kafka-streams-config.js";


const logger = logging.default("kafka-stream");


/**
 * Kafka-Stream starten.
 */
export function kafkaStreamStarten() {

    const kafkaStreamsFactory = new KafkaStreams(kafkaStreamsConfigObjekt);

    const streamEingabe = kafkaStreamsFactory.getKStream("Dozent.Decker.ResolverStats");

    const transformMessage = (inputNachricht) => {

        const inputObjekt = JSON.parse(inputNachricht);

        const userAgent = inputObjekt.userAgent;

        logger.info(`User-Agent in Output-Topic geschrieben: ${userAgent}`);

        return userAgent;
    };

    streamEingabe.map(transformMessage).to("Dozent.Decker.BrowserStrings");

    streamEingabe.start();

    logger.info("Kafka-Stream gestartet.");
};

