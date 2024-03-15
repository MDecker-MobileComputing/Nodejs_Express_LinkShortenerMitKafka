import logging         from "logging";
import expressNunjucks from "express-nunjucks";
import moment          from "moment";

import { getZusammenfassungFuerTagUndLink } from "./service.js";
import { checkKuerzel }                     from "./service.js";
import { mwRequestLogger }                  from "./middleware.js";
import { mwCheckPfadParamDatum }            from "./middleware.js";

const logger = logging.default("controller");


/**
 * Template-Engine "Nunujs" konfigurieren.
 *
 * @param {*} app Express.js-Objekt
 */
export async function templateEngineKonfigurieren(app) {

    app.set("views", "nunjucks-templates/");

    // Im Modus "Entwicklung" werden Änderungen an den Template-Dateien ohne Neustart der Anwendung wirksam.
    const istDevModus = app.get("env") === "development";

    const nj = expressNunjucks(app, { watch: istDevModus, noCache: istDevModus });

    nj.env.addFilter("datum", function(date) { return moment(date).format("DD. MMMM YYYY (ddd)"); });

    logger.info(`Nunjucks konfiguriert (Modus: ${istDevModus ? "Entwicklung" : "Produktion"}).`);
}


/**
 * Routen und Middleware-Funktionen registrieren.
 *
 * @param app App-Objekt von Express.js
 */
export function routenRegistrieren(app) {

    app.use( mwRequestLogger );

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
            titel   : "Pfadparameter 'kuerzel' enthält ungültige Zeichen",
            pfadparameter : "kuerzel",
            wert          :  kuerzel
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
