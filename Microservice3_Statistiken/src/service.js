import logging from "logging";

import { insert } from "./datenbank.js";

const logger = logging.default("service");


/**
 * Statistik-Datensatz verbuchen.
 *
 * @param {*} statistikObjekt  Statistik-Datensatz, das verbucht werden soll.
 */
export async function statistikDatensatzVerbuchen(statistikObjekt) {

    statistikObjekt.datum = statistikObjekt.zeitpunkt.substring(0, 10); // nur erste 10 Zeichen von z.B. 2024-03-15T09:50:36.765Z

    delete statistikObjekt.zeitpunkt;

    await insert(statistikObjekt);

    logger.info(`Statistik-Datensatz verbucht: ${JSON.stringify(statistikObjekt)}`);
}
