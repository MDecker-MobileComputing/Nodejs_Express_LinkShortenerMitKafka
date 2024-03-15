import logging from "logging";
import express from "express";

import { kafkaEmpfaengerStarten } from "./kafka-empfaenger.js";

const logger = logging.default("main");

const app = express();
app.use( express.static("statischerWebContent") );

kafkaEmpfaengerStarten();

const PORTNUMMER = 10000;
// Web-Server starten
app.listen( PORTNUMMER,
    () => { logger.info(`Web-Server auf Port ${PORTNUMMER} gestartet.\n`); }
  );