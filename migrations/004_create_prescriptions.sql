CREATE TABLE prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    medicine TEXT NOT NULL,
    dose TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
