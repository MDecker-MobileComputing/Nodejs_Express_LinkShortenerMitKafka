import logging from "logging";
import express from "express";

import { datenbankInitialisieren }     from "./datenbank.js";
import { templateEngineKonfigurieren } from "./controller.js";
import { routenRegistrieren }          from "./controller.js";
import { kafkaEmpfaengerStarten  }     from "./kafka-empfaenger.js";

const logger = logging.default("main");


await datenbankInitialisieren();

// Express.js konfigurieren
const app = express();
app.use( express.static("statischerWebContent") );
routenRegistrieren(app);
templateEngineKonfigurieren(app);
logger.info("Express.js konfiguriert.");

kafkaEmpfaengerStarten();

const PORTNUMMER = 10000;
// Web-Server starten
app.listen( PORTNUMMER,
    () => { logger.info(`Web-Server auf Port ${PORTNUMMER} gestartet.\n`); }
  );