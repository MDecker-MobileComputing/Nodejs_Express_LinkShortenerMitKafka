import express            from "express";
import expressNunjucks    from "express-nunjucks";
import logging            from "logging";
import moment             from "moment";

import { routenRegistrieren      } from "./controller.js";
import { datenbankInitialisieren } from "./datenbank.js";
import { kafkaEmpfaengerStarten  } from "./kafka-empfaenger.js";


const logger = logging.default("main");

// Portnummer aus Umgebungsvariablen auslesen (Fallback-Wert: 9000)
const PORTNUMMER = process.env.PORTNUMMER || 9000;
if (isNaN(PORTNUMMER)) {

  logger.error(`FEHLER: Portnummer "${PORTNUMMER}" ist keine Zahl, Abbruch!`);
  console.log();
  process.exit(1);
}
logger.info(`Portnummer für HTTP-Server laut Konfiguration: ${PORTNUMMER}`);


// Datenbank initialisieren
datenbankInitialisieren(`datenbank-${PORTNUMMER}.json`);


// Express.js konfigurieren
const app = express();
app.use( express.static("statischerWebContent") );
routenRegistrieren(app);
logger.info("Express.js initialisiert.");


// Template-Engine "Nunjucks" konfigurieren
app.set("views", "templates/");
const istDevModus = app.get("env") === "development";
logger.info(`Nunjucks konfiguriert, Modus=${istDevModus ? "Entwicklung" : "Produktion"}.`);
const nj = expressNunjucks(app, { watch: istDevModus, noCache: istDevModus }); // Im Modus "Entwicklung" werden Änderungen an Templates ohne Neustart der Anwendung wirksam.
nj.env.addFilter("datum", function(date, format) { return moment(date).format(format); });


// Web-Server starten
app.listen( PORTNUMMER,
    () => { logger.info(`Web-Server auf Port ${PORTNUMMER} gestartet.\n`); }
  );


// Kafka-Konsument starten
kafkaEmpfaengerStarten(PORTNUMMER);
