<?php

namespace models;

use lib\Singleton;
use PDO;

/**
 * Description of DataBase
 *
 * @author gianni
 */
class DataBase extends Singleton {
    const DSN = "sqlite:data/maker.sqlite";  // Percorso del database
    /** @var PDO connessione al db */
    public PDO $conn;
    
    protected function __construct() {
        $this->conn = new PDO(self::DSN);
        $this->createTableIfNotExists();
    }

    /**
     * Crea la tabella 'log' se non esiste
     */
    private function createTableIfNotExists() {
        $sql = "
            CREATE TABLE IF NOT EXISTS log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                ts DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ";
        $this->conn->exec($sql);
    }
}
