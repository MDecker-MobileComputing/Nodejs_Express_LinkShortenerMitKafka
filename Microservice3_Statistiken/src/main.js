import logging from "logging";
import express from "express";

import { datenbankInitialisieren } from "./datenbank.js";
import { expressKonfigurieren    } from "./controller.js";
import { kafkaEmpfaengerStarten  } from "./kafka-empfaenger.js";
import { kafkaStreamStarten }      from "./kafka-stream.js";

const logger = logging.default("main");


await datenbankInitialisieren();

// Express.js konfigurieren
const app = express();

expressKonfigurieren(app);
logger.info("Express.js ist konfiguriert.");


// Kafka starten
kafkaEmpfaengerStarten();
kafkaStreamStarten();
logger.info("Kafka konfiguriert und gestartet.");


const PORTNUMMER = 10000;
// Web-Server starten
app.listen( PORTNUMMER,
    () => { logger.info(`Web-Server auf Port ${PORTNUMMER} gestartet.\n`); }
  );