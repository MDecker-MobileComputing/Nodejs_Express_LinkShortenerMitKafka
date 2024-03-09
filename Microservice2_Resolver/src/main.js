import express            from "express";
import logging            from "logging";
import expressNunjucks    from "express-nunjucks";
import routenRegistrieren from "./controller.js";


const logger = logging.default("main");

// Portnummer aus Umgebungsvariablen auslesen (Fallback-Wert: 9000)
const PORTNUMMER = process.env.PORTNUMMER || 9000;
if (isNaN(PORTNUMMER)) {

  logger.error(`Portnummer "${PORTNUMMER}" ist keine Zahl, Abbruch!`);
  console.log();
  process.exit(1);
}
logger.info(`Portnummer für HTTP-Server laut Konfiguration: ${PORTNUMMER}`);


// Express.js konfigurieren

const app = express();
routenRegistrieren(app);
logger.info("Express.js initialisiert.");


// Template-Engine "Nunjucks" konfigurieren
app.set("views", "templates/");
const istDevModus = app.get("env") === "development";
logger.info(`Nunjucks konfiguriert, Modus=${istDevModus ? "Entwicklung" : "Produktion"}.`);
expressNunjucks(app, {
    watch  : istDevModus,
    noCache: istDevModus
});


// Web-Server starten
app.listen( PORTNUMMER,
    () => { logger.info(`Web-Server auf Port ${PORTNUMMER} gestartet.\n`); }
  );