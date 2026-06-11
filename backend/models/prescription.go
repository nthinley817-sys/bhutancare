package models

type Prescription struct {
    ID       int    `json:"id"`
    UserID   int    `json:"user_id"`
    Medicine string `json:"medicine"`
    Dose     string `json:"dose"`
}
