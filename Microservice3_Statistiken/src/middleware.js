import logging from "logging";
import moment  from "moment";

const logger = logging.default("middleware-funktionen");


/**
 * Diese Middleware-Funktion schreibt für jeden HTTP-Request eine Zeile
 * mit HTTP-Verb (z.B. `GET` oder `POST`) und Pfad (z.B. `/api/v1/...`
 * auf den Logger `request`.
 * <br><br>
 *
 * Beispiel-Zeilen:
 * ```
 * 16:53:06.900 [http-anfrage] GET  /api/v1/sg/VWL
 * 16:53:46.390 [http-anfrage] POST /api/v1/sg/
 * ```
 *
 * @param {*} req Request-Objekt, aus dem HTTP-Verb und Pfad gelesen werden
 *
 * @param {*} res Response-Objekt (wird nicht verwendet)
 *
 * @param {*} next Funktion, um nächste Middleware-Funktion aufzurufen
 */
export function mwRequestLogger(req, res, next) {

    logger.info(`${req.method} ${req.originalUrl}`);

    next();
};


/**
 *  Middelware-Funktion checkt, ob Pfadparameter `kuerzel` zulässigen Wert enthält.
 */
export function mwCheckPfadParamKuerzel(req, res, next) {

    const kuerzel = req.params.kuerzel;

    const KUERZEL_REGEXP = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

    if (KUERZEL_REGEXP.test(kuerzel) == false) {

        const fehlerText = `Pfadparameter 'kuerzel' enthält unerlaubte Zeichen: ${kuerzel}`;
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    next();
}


/**
 * Middleware-Funktion checkt, ob Pfadparameter `datum` ein gültiges Datum
 * mit Format "YYYY-MM-DD" ist.
 */
export function mwCheckPfadParamDatum(req, res, next) {

    const datum = req.params.datum;

    if (!moment(datum, 'YYYY-MM-DD', true).isValid()) {

        const fehlerText = `Pfadparameter 'datum' ist kein gültiges Datum: ${datum}`;
        logger.error(fehlerText);
        res.status(400).send({ "nachricht": fehlerText });
        return;
    }

    next();
}
