package models

type User struct {
	ID       string `gorm:"primaryKey"`
	Username string `gorm:"unique;not null"`
	Email    string `gorm:"unique;not null"`
	Password string `gorm:"not null"`
}

type Board struct {
	ID      string `gorm:"primaryKey"`
	Name    string `gorm:"not null"`
	OwnerID string
	Owner   User `gorm:"foreignKey:OwnerID"`
}

type List struct {
	ID       string `gorm:"primaryKey"`
	Name     string `gorm:"not null"`
	Position int
	BoardID  string
	Board    Board `gorm:"foreignKey:BoardID"`
}

type Card struct {
	ID          string `gorm:"primaryKey"`
	Title       string `gorm:"not null"`
	Description string
	Position    int
	ListID      string
	List        List `gorm:"foreignKey:ListID"`
}

type Collaborator struct {
	ID      string `gorm:"primaryKey"`
	BoardID string
	UserID  string
	Role    string // "viewer", "editor"
}
