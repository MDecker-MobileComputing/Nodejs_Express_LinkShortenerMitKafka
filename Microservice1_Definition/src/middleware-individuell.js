import logging   from "logging";
import validator from "validator";

import { pruefeAenderungspasswort } from "./service.js";


// Diese Datei enthält Middleware-Funktionen, die speziell für einzelne REST-Endpunkte
// registriert werden. Sie sind nicht allgemein für alle Endpunkte gültig.

const logger = logging.default("mw-individuell");


/**
 * Middleware-Funktion zum Trimmen von Werten in einem HTTP-POST-Request.
 */
export function mwWerteTrimmen(req, res, next) {

    if (req.body.kuerzel     ) { req.body.kuerzel = req.body.kuerzel.trim(); }

    if (req.body.url         ) { req.body.url = req.body.url.trim(); }

    if (req.body.beschreibung) { req.body.beschreibung = req.body.beschreibung.trim(); }

    next();
}

/**
 * Regulärer Ausdruck mit erlaubten Zeichen für Kürzel.
 */
const KUERZEL_REGEXP = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

/**
 * Funktion für HTTP-POST-Request die Check, ob Kürzel gesetzt ist
 * und einen zulässigen Wert hat.
 */
export function mwCheckKuerzel(req, res, next) {

    const kuerzel = req.body.kuerzel;

    if (!kuerzel || kuerzel.length === 0) {

        const fehlerText = "Pflichtfeld 'kuerzel' fehlt oder ist leer.";
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    if (KUERZEL_REGEXP.test(kuerzel) == false) {

        const fehlerText = `Feld 'kuerzel' enthält unerlaubte Zeichen: ${kuerzel}`;
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    next();
}


/**
 * Middleware-Funktion zum überprüfen, ob die beiden Pflichtfelder für einen
 * neuen Shortlink gesetzt sind
 * (für Check von Kürzel gibt es eigene Middleware-Funktion).
 */
export function mwCheckPflichtfelderNeuerShortlink(req, res, next) {

    const url          = req.body.url;
    const beschreibung = req.body.beschreibung;

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
 * Middleware-Funktion zum Überprüfen, ob die in einem HTTP-POST-Request
 * übergebene URL korrekt ist.
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


/**
 * Middleware-Funktion für HTTP-PUT-Request: überprüft, ob
 * das Änderungs-Passwort korrekt ist.
 */
export function mwCheckAenderungspasswort(req, res, next) {

    const kuerzel  = req.body.kuerzel;
    const passwort = req.body.passwort;

    if (!passwort || passwort.length === 0) {

        logger.warn(`Request ohne Änderungspasswort für Kürzel "${kuerzel}" abgefangen.`);
        res.status(401).send({ "nachricht": "Änderungs-Passwort fehlt." });
        return;
    }

    const istOkay = pruefeAenderungspasswort(kuerzel, passwort);
    if (istOkay) {

        next();

    } else {

        logger.warn(`Request mit ungültigem Änderungspasswort für Kürzel "${kuerzel}" abgefangen.`);
        res.status(401).send({ "nachricht": "Ungültiges Änderungs-Passwort." });
    }
}
