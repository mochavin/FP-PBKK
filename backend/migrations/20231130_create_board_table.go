package migrations

import (
	"log"
	"trello-backend/config"
	"trello-backend/models"
)

func CreateBoardTable() {
	err := config.DB.AutoMigrate(&models.Board{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
}
