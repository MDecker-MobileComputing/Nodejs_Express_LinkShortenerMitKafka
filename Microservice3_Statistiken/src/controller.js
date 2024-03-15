import express         from "express";
import expressNunjucks from "express-nunjucks";
import logging         from "logging";
import moment          from "moment";

import { getZusammenfassungFuerTagUndLink } from "./service.js";
import { checkKuerzel, checkDatum }         from "./service.js";
import { mwRequestLogger }                  from "./middleware.js";


const logger = logging.default("controller");


/**
 * Express.js konfigurieren:
 * * Allgemeine Middleware-Funktionen registrieren
 * * Template-Engine "Nunjucks" konfigurieren
 * * Routen registrieren
 * * Verzeichnis mit statischen Dateien festlegen
 *
 * @param {*} app Express.js-Objekt
 */
export function expressKonfigurieren(app) {

    app.use( mwRequestLogger );
    app.use( express.static("statischerWebContent") );

    templateEngineKonfigurieren(app);
    routenRegistrieren(app);
}


/**
 * Template-Engine "Nunujs" konfigurieren.
 *
 * @param {*} app Express.js-Objekt
 */
function templateEngineKonfigurieren(app) {

    app.set("views", "nunjucks-templates/");

    // Im Modus "Entwicklung" werden Änderungen an den Template-Dateien ohne Neustart der Anwendung wirksam.
    const istDevModus = app.get("env") === "development";

    const nj = expressNunjucks(app, { watch: istDevModus, noCache: istDevModus });

    nj.env.addFilter("datum", function(date) { return moment(date).format("DD. MMMM YYYY (ddd)"); });

    logger.info(`Nunjucks konfiguriert (Modus: ${istDevModus ? "Entwicklung" : "Produktion"}).`);
}


/**
 * Routen registrieren.
 *
 * @param app App-Objekt von Express.js
 */
function routenRegistrieren(app) {

    const pfad = "/s/:kuerzel/:datum";
    app.get(pfad, getStatistikFuerKuerzelUndTag);
    logger.info(`Route registriert: GET ${pfad}`);
};


/**
 * Funktion für HTTP-GET-Pfad `/s/:kuerzel/:datum`.
 *
 * @param {*} request Request-Objekt, aus dem die beiden Pfad-Parameter
 *                    `kuerzel` und `datum` ausgelesen werden.
 *
 * @param {*} response Response-Objekt mit Seite von Template-Engine gerendert
 */
function getStatistikFuerKuerzelUndTag(request, response) {

    const kuerzel = request.params.kuerzel;
    const datum   = request.params.datum;

    if (checkKuerzel(kuerzel) === false) {

        response.status(400); // Bad Request
        response.render("fehler_pfadparameter", {
            titel   : "Pfadparameter \"kuerzel\" enthält ungültige Zeichen",
            pfadparameter : "kuerzel",
            wert          :  kuerzel
        });
        return;
    }
    if (checkDatum(datum) === false) {

        response.status(400); // Bad Request
        response.render("fehler_pfadparameter", {
            titel   : "Pfadparameter \"datum\" ist ungültig",
            pfadparameter : "datum",
            wert          :  datum
        });
        return;
    }

    // *** Service-Funktion aufrufen ***
    const ergebnisObjekt = getZusammenfassungFuerTagUndLink(kuerzel, datum);


    response.status(200); // OK

    response.render("statistik-kuerzel-tag", {

        titel            : `Zugriffs-Statisik für Shortlink mit Kürzel "${kuerzel}"`,
        kuerzel          : kuerzel,
        datum            : datum,
        anzahl_erfolg    : ergebnisObjekt.anzahl_erfolg,
        anzahl_erfolglos : ergebnisObjekt.anzahl_erfolglos
    });
}
