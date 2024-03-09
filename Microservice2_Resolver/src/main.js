const express = require("express");
const expressNunjucks = require("express-nunjucks");
const logging = require("logging");

const logger = logging.default("main");

const app = express();

// Portnummer aus Umgebungsvariablen auslesen (Fallback-Wert: 9000)
const PORTNUMMER = process.env.PORTNUMMER || 9000;
if (isNaN(PORTNUMMER)) {

  logger.error(`\nPortnummer "${PORTNUMMER}" ist keine Zahl, Abbruch!\n`);
  process.exit(1);
}


app.listen( PORTNUMMER,
    () => { logger.info(`Web-Server lauscht auf Port ${PORTNUMMER}.\n`); }
  );