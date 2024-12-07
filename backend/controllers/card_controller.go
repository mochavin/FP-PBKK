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
}

// UpdateCard updates a specific card
func UpdateCard(c *gin.Context) {
	cardID := c.Param("cardId")

	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Position    int    `json:"position"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Start transaction
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get card and validate access
	var card models.Card
	if err := tx.Where("id = ?", cardID).First(&card).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Card not found"})
		return
	}

	// Validate list and board access
	var list models.List
	if err := tx.Where("id = ?", card.ListID).First(&list).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "List not found"})
		return
	}

	var board models.Board
	if err := tx.Where("id = ?", list.BoardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	userID, _ := c.Get("userID")
	if board.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Get all cards in the list
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
	}

	// Update other card fields
	if input.Title != "" {
		card.Title = input.Title
	}
	if input.Description != "" {
		card.Description = input.Description
	}
	card.Position = newPosition

	if err := tx.Save(&card).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update card"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	response := CardResponse{
		ID:          card.ID,
		Title:       card.Title,
		Description: card.Description,
		Position:    card.Position,
		ListID:      card.ListID,
	}

	c.JSON(http.StatusOK, response)
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
