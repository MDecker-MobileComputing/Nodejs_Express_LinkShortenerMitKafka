import logging from "logging";

import { shortlinkNeu                       } from "./service.js";
import { mwWerteTrimmen                     } from "./middleware-individuell.js";
import { mwCheckPflichtfelderNeuerShortlink } from "./middleware-individuell.js";
import { mwCheckUrl                         } from "./middleware-individuell.js";

const logger = logging.default("controller");


/**
 * Routen registrieren.
 *
 * @param app App-Objekt von Express.js
 */
export function routenRegistrieren(app) {

    const postPfad = "/api/v1/shortlink/";
    const postMiddlewares = [ mwWerteTrimmen, mwCheckPflichtfelderNeuerShortlink, mwCheckUrl ];
    app.post(postPfad, postMiddlewares, postShortlink);
    logger.info(`Route registriert: POST ${postPfad}`);
    
    const putPfad = "/api/v1/shortlink/";
    const putMiddlewares = [ mwWerteTrimmen ];
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

    const erfolg = await shortlinkNeu(objNeu);
    if (erfolg === true) {
            
            response.status(201)
                    .send(objNeu); // objNeu enthält wegen "Call by Reference" das generierte Passwort

    } else {

        response.status(409)
                .send({ "nachricht: ": `Shortlink existiert bereits: ${kuerzel}`});
    }
}


/**
 * Funktion für HTTP-PUT-Request um Shortlink zu ändern.
 * 
 * @param request  HTTP-Request, muss folgende Fehler enthalten:
 *                 `kuerzel`, `url`, `beschreibung`, `passwort`.
 */
async function putShortLink(request, response) {

    const kuerzel      = req.body.kuerzel;
    const url          = req.body.url;
    const beschreibung = req.body.beschreibung;
    const passwort     = req.body.passwort;

}
