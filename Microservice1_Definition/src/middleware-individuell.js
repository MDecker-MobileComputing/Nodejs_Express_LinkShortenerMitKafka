import logging from "logging";

const logger = logging.default("mw-individuell");


/**
 * Middleware-Funktion zum Trimmen von Werten in einem Request-Objekt.
 */
export function mwWerteTrimmen(req, res, next) {

    if (req.body.kuerzel     ) { req.body.kuerzel = req.body.kuerzel.trim(); }

    if (req.body.url         ) { req.body.url = req.body.url.trim(); }
            
    if (req.body.beschreibung) { req.body.beschreibung = req.body.beschreibung.trim(); }

    next();
}


/**
 * Middleware-Funktion zum überprüfen, ob die drei Pflichtfelder für einen
 * neuen Shortlink gesetzt sind.
 */
export function mwCheckPflichtfelderNeuerShortlink(req, res, next) {

    const kuerzel      = req.body.kuerzel;
    const url          = req.body.url;
    const beschreibung = req.body.beschreibung;

    if (!kuerzel || kuerzel.length === 0) {

        const fehlerText = "Fehler: Pflichtfeld 'kuerzel' fehlt oder ist leer.";
        logger.error(fehlerText);
        res.status(400).send(fehlerText);
        return;
    }
    if (!url || url.length === 0) {

        const fehlerText = "Fehler: Pflichtfeld 'url' fehlt oder ist leer.";
        logger.error(fehlerText);
        res.status(400).send(fehlerText);
        return;
    }
    if (!beschreibung || beschreibung.length === 0) {

        const fehlerText = "Fehler: Pflichtfeld 'beschreibung' fehlt oder ist leer.";
        logger.error(fehlerText);
        res.status(400).send(fehlerText);
        return;
    }

    next();
}


/**
 * Middleware-Funktion zum überprüfen, ob die übergebene URL korrekt ist. 
 */
export function mwCheckUrl(req, res, next) {

    const url = req.body.url;

    if (url.startsWith("http://") || url.startsWith("https://")) {

        next();

    } else {

        logger.error("URL fängt nicht mit 'http://' oder 'https://' an: " + url);
        res.status(400).send("URL muss mit 'http://' oder 'https://' beginnen.");
    }
}
