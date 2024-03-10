import logging   from "logging";
import validator from 'validator';

// Diese Datei enthält Middleware-Funktionen, die speziell für einzelne REST-Endpunkte
// registriert werden. Sie sind nicht allgemein für alle Endpunkte gültig.

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

        const fehlerText = "Pflichtfeld 'kuerzel' fehlt oder ist leer.";
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }
    if (!url || url.length === 0) {

        const fehlerText = "Pflichtfeld 'url' fehlt oder ist leer.";
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }
    if (!beschreibung || beschreibung.length === 0) {

        const fehlerText = "Pflichtfeld 'beschreibung' fehlt oder ist leer.";
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    next();
}


/**
 * Regulärer Ausdruck mit erlaubten Zeichen für Kürzel.
 */
const KUERZEL_REGEXP = /^[a-zA-Z][a-zA-Z0-9_-]*$/;


/**
 * Middleware-Funktion zum Überprüfen, ob der gewählte Bezeichner
 * zulässig ist, insbesondere keine Leerzeichen enthält.
 */
export function mvCheckKuerzel(req, res, next) {

    const kuerzel = req.body.kuerzel;

    if (KUERZEL_REGEXP.test(kuerzel) == false) {

        const fehlerText = `Feld 'kuerzel' enthält unerlaubte Zeichen: ${kuerzel}`;
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    next();
}


/**
 * Middleware-Funktion zum Überprüfen, ob die übergebene URL korrekt ist.
 */
export function mwCheckUrl(req, res, next) {

    const url = req.body.url;

    if ( validator.isURL(url) ) {

        logger.debug("URL ist korrekt: " + url);
        next();

    } else {

        logger.error("Ungültige URL: " + url);
        res.status(400).send({ "nachricht": "Ungültige URL für neuen Shortlink." });
    }
}
