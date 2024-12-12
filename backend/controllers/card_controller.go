package controllers

import (
	"net/http"
	"trello-backend/config"
	"trello-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CreateCard creates a new card in a list
func CreateCard(c *gin.Context) {
	listID := c.Param("listId")

	// Validate input
	var input struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		Position    int    `json:"position"`
		Deadline    string `json:"deadline"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Get the list and validate access
	var list models.List
	if err := config.DB.Where("id = ?", listID).First(&list).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "List not found"})
		return
	}

	// Validate board access
	var board models.Board
	if err := config.DB.Where("id = ?", list.BoardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	userID, _ := c.Get("userID")
	if board.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Create card
	card := models.Card{
		ID:          uuid.NewString(),
		Title:       input.Title,
		Description: input.Description,
		Position:    input.Position,
		ListID:      listID,
		Deadline:    input.Deadline,
	}

	if err := config.DB.Create(&card).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create card"})
		return
	}

	c.JSON(http.StatusCreated, card)
}

// GetListCards retrieves all cards in a list
func GetListCards(c *gin.Context) {
	listID := c.Param("listId")

	// Validate access
	var list models.List
	if err := config.DB.Where("id = ?", listID).First(&list).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "List not found"})
		return
	}

	var board models.Board
	if err := config.DB.Where("id = ?", list.BoardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	userID, _ := c.Get("userID")
	if board.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Get cards
	var cards []models.Card
	if err := config.DB.Where("list_id = ?", listID).Order("position").Find(&cards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cards"})
		return
	}

	c.JSON(http.StatusOK, cards)
}

type CardResponse struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Position    int    `json:"position"`
	ListID      string `json:"listId"`
	Deadline    string `json:"deadline"`
}

// UpdateCard updates a specific card
func UpdateCard(c *gin.Context) {
	cardID := c.Param("cardId")

	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Position    int    `json:"position"`
		NewListID   string `json:"newListId"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get current card
	var card models.Card
	if err := tx.Where("id = ?", cardID).First(&card).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Card not found"})
		return
	}

	originalListID := card.ListID
	newPosition := input.Position

	if input.NewListID != "" && input.NewListID != originalListID {
		// Moving to different list
		// Validate new list exists
		var newList models.List
		if err := tx.Where("id = ?", input.NewListID).First(&newList).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "New list not found"})
			return
		}

		// Get cards in original list
		var sourceCards []models.Card
		if err := tx.Where("list_id = ?", originalListID).Order("position").Find(&sourceCards).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get source cards"})
			return
		}

		// Get cards in destination list
		var destCards []models.Card
		if err := tx.Where("list_id = ?", input.NewListID).Order("position").Find(&destCards).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get destination cards"})
			return
		}

		// Remove from source list
		for i := card.Position + 1; i < len(sourceCards); i++ {
			sourceCards[i].Position--
			if err := tx.Save(&sourceCards[i]).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update source positions"})
				return
			}
		}

		// Validate new position
		if newPosition < 0 {
			newPosition = 0
		}
		if newPosition > len(destCards) {
			newPosition = len(destCards)
		}

		// Make space in destination list
		for i := len(destCards) - 1; i >= newPosition; i-- {
			destCards[i].Position++
			if err := tx.Save(&destCards[i]).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update destination positions"})
				return
			}
		}

		// Update card
		card.ListID = input.NewListID
		card.Position = newPosition
	} else {
		// Same list, just update position
		var cards []models.Card
		if err := tx.Where("list_id = ?", card.ListID).Order("position").Find(&cards).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cards"})
			return
		}

		oldPosition := card.Position
		newPosition := input.Position

		// Validate new position
		if newPosition < 0 || newPosition >= len(cards) {
			newPosition = len(cards) - 1
		}

		// Update positions if changed
		if oldPosition != newPosition {
			// Remove card from old position
			cards = append(cards[:oldPosition], cards[oldPosition+1:]...)

			// Insert at new position
			cards = append(cards[:newPosition], append([]models.Card{card}, cards[newPosition:]...)...)

			// Update all positions
			for i, card := range cards {
				card.Position = i
				if err := tx.Save(&card).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update positions"})
					return
				}
			}

			// Update card position
			card.Position = newPosition
			if err := tx.Save(&card).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update card position"})
				return
			}
		}
	}

	// Update other fields
	if input.Title != "" {
		card.Title = input.Title
	}
	if input.Description != "" {
		card.Description = input.Description
	}

	if err := tx.Save(&card).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update card"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, card)
}

// DeleteCard deletes a specific card
func DeleteCard(c *gin.Context) {
	cardID := c.Param("cardId")

	// Get card and validate access
	var card models.Card
	if err := config.DB.Where("id = ?", cardID).First(&card).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Card not found"})
		return
	}

	// Validate list and board access
	var list models.List
	if err := config.DB.Where("id = ?", card.ListID).First(&list).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "List not found"})
		return
	}

	var board models.Board
	if err := config.DB.Where("id = ?", list.BoardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	userID, _ := c.Get("userID")
	if board.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Delete card
	if err := config.DB.Delete(&card).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete card"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Card deleted successfully"})
}

// GetCardByID retrieves a specific card by ID
func GetCardByID(c *gin.Context) {
	cardID := c.Param("cardId")

	// Get card and validate it exists
	var card models.Card
	if err := config.DB.Where("id = ?", cardID).First(&card).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Card not found"})
		return
	}

	// Validate list access
	var list models.List
	if err := config.DB.Where("id = ?", card.ListID).First(&list).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "List not found"})
		return
	}

	// Validate board access
	var board models.Board
	if err := config.DB.Where("id = ?", list.BoardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	// Check user permission
	userID, _ := c.Get("userID")
	if board.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, card)
}
