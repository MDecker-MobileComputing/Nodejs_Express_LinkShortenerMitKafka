import logging  from "logging";


const logger = logging.default("controller");


/**
 * Routen registrieren.
 *
 * @param app App-Objekt von Express.js
 */
export default function(app) {

    const pfad = "/r/:kuerzel";
    app.get(pfad, getKuerzel);
    logger.info(`Route registriert: GET ${pfad}`);
};


function getKuerzel(request, response) {

    const kuerzel = request.params.kuerzel;

    logger.info(`Anfrage für Kürzel erhalten: ${kuerzel}`);

    response.render("nicht_gefunden", {
        titel: "Fehler",
        kuerzel: kuerzel
    });

}