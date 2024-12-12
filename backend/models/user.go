package models

type User struct {
	ID       string  `gorm:"primaryKey"`
	Username string  `gorm:"unique;not null"`
	Email    string  `gorm:"unique;not null"`
	Password string  `gorm:"not null"`
	Boards   []Board `gorm:"many2many:board_members;"`
}

type BoardMember struct {
	BoardID string `gorm:"primaryKey"`
	UserID  string `gorm:"primaryKey"`
}

type Board struct {
	ID      string `gorm:"primaryKey"`
	Name    string `gorm:"not null"`
	OwnerID string
	Owner   User   `gorm:"foreignKey:OwnerID"`
	Members []User `gorm:"many2many:board_members;"`
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
	List        List   `gorm:"foreignKey:ListID"`
	Deadline    string `gorm:"default:null"`
}

type Collaborator struct {
	ID      string `gorm:"primaryKey"`
	BoardID string
	UserID  string
	Role    string // "viewer", "editor"
}
