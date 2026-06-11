package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func ConnectDB() {
	var dsn string

	// Use DATABASE_URL if available (Render provides this)
	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		log.Println("✅ Using DATABASE_URL:", dbURL[:20], "...")
		dsn = dbURL
	} else {
		dsn = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_PORT"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_PASSWORD"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_SSLMODE"),
		)
	}

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("❌ Failed to open DB:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("❌ Failed to ping DB:", err)
	}

	log.Println("✅ PostgreSQL connected successfully!")
}

func RunMigrations() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			first_name VARCHAR(100) NOT NULL,
			last_name VARCHAR(100) NOT NULL,
			cid VARCHAR(20) UNIQUE NOT NULL,
			email VARCHAR(150) UNIQUE NOT NULL,
			phone VARCHAR(20),
			password VARCHAR(255) NOT NULL,
			blood_group VARCHAR(5) DEFAULT '',
			dob DATE,
			dzongkhag VARCHAR(100) DEFAULT '',
			village VARCHAR(100) DEFAULT '',
			gender VARCHAR(20) DEFAULT '',
			height_cm INTEGER DEFAULT 0,
			weight_kg DECIMAL(5,2) DEFAULT 0,
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS appointments (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			hospital VARCHAR(200) NOT NULL,
			department VARCHAR(100) NOT NULL,
			doctor VARCHAR(150) DEFAULT '',
			appt_date DATE NOT NULL,
			appt_time VARCHAR(20) NOT NULL,
			status VARCHAR(30) DEFAULT 'upcoming',
			notes TEXT DEFAULT '',
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS tokens (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			hospital VARCHAR(200) NOT NULL,
			department VARCHAR(100) NOT NULL,
			token_num VARCHAR(20) NOT NULL,
			status VARCHAR(30) DEFAULT 'active',
			issued_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS prescriptions (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			rx_number VARCHAR(50) DEFAULT '',
			doctor VARCHAR(150) DEFAULT '',
			hospital VARCHAR(200) DEFAULT '',
			issued_date DATE,
			valid_until DATE,
			status VARCHAR(30) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS lab_results (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			test_name VARCHAR(200) NOT NULL,
			ordered_by VARCHAR(150) DEFAULT '',
			hospital VARCHAR(200) DEFAULT '',
			test_date DATE,
			status VARCHAR(30) DEFAULT 'pending',
			result_data JSONB DEFAULT '{}',
			created_at TIMESTAMP DEFAULT NOW()
		)`,
	}

	for _, q := range queries {
		if _, err := DB.Exec(q); err != nil {
			log.Fatal("❌ Migration failed:", err)
		}
	}
	log.Println("✅ All database migrations complete!")
}
