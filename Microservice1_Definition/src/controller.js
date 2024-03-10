import logging from "logging";

import { shortlinkNeu                       } from "./service.js";
import { mwWerteTrimmen                     } from "./middleware-individuell.js";
import { mwCheckPflichtfelderNeuerShortlink } from "./middleware-individuell.js";
import { mwCheckUrl                         } from "./middleware-individuell.js";
import { mwCheckKuerzel                     } from "./middleware-individuell.js";

const logger = logging.default("controller");


/**
 * Routen registrieren.
 *
 * @param app App-Objekt von Express.js
 */
export function routenRegistrieren(app) {

    const postPfad = "/api/v1/shortlink/";
    const postMiddlewares = [ mwWerteTrimmen,
                              mwCheckKuerzel,
                              mwCheckPflichtfelderNeuerShortlink,
                              mwCheckUrl ];
    app.post(postPfad, postMiddlewares, postShortlink);
    logger.info(`Route registriert: POST ${postPfad}`);

    const putPfad = "/api/v1/shortlink/";
    const putMiddlewares = [ mwWerteTrimmen,
                             mwCheckKuerzel ];
    app.put(putPfad, putMiddlewares, putShortLink);
    logger.info(`Route registriert: PUT  ${putPfad}`);
};


/**
 * Funktion für HTTP-POST-Request um neuen Shortlink zu definieren.
 *
 * @param request  HTTP-Request, muss folgende Fehler enthalten:
 *                 `kuerzel`, `url`, `beschreibung`.
 */
async function postShortlink(request, response) {

    const kuerzel      = request.body.kuerzel;
    const url          = request.body.url;
    const beschreibung = request.body.beschreibung;

    const objNeu = {
        kuerzel: kuerzel,
        url: url,
        beschreibung: beschreibung
    };

    const fehlerObjekt = await shortlinkNeu(objNeu);
    if (fehlerObjekt.nutzerfehler) {

        response.status(409) // Conflict
                 .send({ "nachricht: ": `Shortlink existiert bereits: ${kuerzel}`});
        return;
    }
    if (fehlerObjekt.kafkafehler) {

        response.status(500) // Internal Server Error
                 .send({ "nachricht: ": `Shortlink konnte nicht über Kafka versendet werden.`});
        return;
    }

    response.status(201) // Created
            .send(objNeu);
}


/**
 * Funktion für HTTP-PUT-Request um Shortlink zu ändern.
 *
 * @param request  HTTP-Request, muss folgende Pflichtfelder enthalten:
 *                 - `kuerzel`: Definiert Kürzel, das geändert werden soll
 *                 - `passwort`: Nachweis, dass man der "Besitzer" des Shortlinks ist
 *                 - Mindestens eines der folgender Felder: `beschreibung`, `ist_aktiv`
 *                   (die URL kann kann aus Sicherheitsgründen nicht geändert werden)
 */
async function putShortLink(request, response) {

    const kuerzel      = req.body.kuerzel;
    const url          = req.body.url;
    const beschreibung = req.body.beschreibung;
    const passwort     = req.body.passwort;

}
