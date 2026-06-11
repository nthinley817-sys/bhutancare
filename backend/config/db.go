package config

import "database/sql"

var DB *sql.DB

func Init() error {
    // TODO: implement real database initialization
    return nil
}
