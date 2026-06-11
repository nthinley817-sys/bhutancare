CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
