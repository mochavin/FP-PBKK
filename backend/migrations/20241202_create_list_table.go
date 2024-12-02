package migrations

import (
	"log"
	"trello-backend/config"
	"trello-backend/models"
)

func CreateListTable() {
	err := config.DB.AutoMigrate(&models.List{})
	if err != nil {
		log.Fatalf("Failed to migrate list table: %v", err)
	}
}
