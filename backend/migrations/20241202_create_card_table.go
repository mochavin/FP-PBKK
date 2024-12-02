package migrations

import (
	"log"
	"trello-backend/config"
	"trello-backend/models"
)

func CreateCardTable() {
	err := config.DB.AutoMigrate(&models.Card{})
	if err != nil {
		log.Fatalf("Failed to migrate card table: %v", err)
	}
}
