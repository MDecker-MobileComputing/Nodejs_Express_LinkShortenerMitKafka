
/**
 * Nutzername und Passwort für Kafka-Server in dieser Datei anpassen.
 * Das in dieser Datei definierte Objekt `plainNutzernamePasswort` wird
 * in den Kafka-Dateien in beiden Microservices als `sasl`-Attribut verwendet.
 */

const plainNutzernamePasswort = {
    mechanism: "plain",
    username: "alice",
    password: "g3h3im"
};

const TOPIC_SHORTLINKS = "Dozent.Decker.ShortLinks";

module.exports = plainNutzernamePasswort;
