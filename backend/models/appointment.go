package models

type Appointment struct {
    ID     int    `json:"id"`
    UserID int    `json:"user_id"`
    Date   string `json:"date"`
    Notes  string `json:"notes"`
}
