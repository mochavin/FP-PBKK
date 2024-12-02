package controllers

import (
	"net/http"
	"trello-backend/config"
	"trello-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CreateList creates a new list in a board
func CreateList(c *gin.Context) {
	boardID := c.Param("boardId")

	// Validate input
	var input struct {
		Name     string `json:"name" binding:"required"`
		Position int    `json:"position"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Check if board exists and user has access
	var board models.Board
	if err := config.DB.Where("id = ?", boardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	userID, _ := c.Get("userID")
	if board.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Create new list
	list := models.List{
		ID:       uuid.NewString(),
		Name:     input.Name,
		Position: input.Position,
		BoardID:  boardID,
	}

	if err := config.DB.Create(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create list"})
		return
	}

	c.JSON(http.StatusCreated, list)
}

// GetBoardLists retrieves all lists in a board
func GetBoardLists(c *gin.Context) {
	boardID := c.Param("boardId")

	// Check if board exists and user has access
	var board models.Board
	if err := config.DB.Where("id = ?", boardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	userID, _ := c.Get("userID")
	if board.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Get all lists
	var lists []models.List
	if err := config.DB.Where("board_id = ?", boardID).Order("position").Find(&lists).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get lists"})
		return
	}

	c.JSON(http.StatusOK, lists)
}

// GetBoardList retrieves a specific list by ID
func GetBoardList(c *gin.Context) {
	listID := c.Param("listId")

	// Get the list
	var list models.List
	if err := config.DB.Where("id = ?", listID).First(&list).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "List not found"})
		return
	}

	// Check if board exists and user has access
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

	c.JSON(http.StatusOK, list)
}

// UpdateList updates a specific list
func UpdateBoardList(c *gin.Context) {
	listID := c.Param("listId")

	// Validate input
	var input struct {
		Name     string `json:"name" binding:"required"`
		Position int    `json:"position"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Get the list
	var list models.List
	if err := config.DB.Where("id = ?", listID).First(&list).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "List not found"})
		return
	}

	// Check if board exists and user has access
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

	// Update list
	list.Name = input.Name
	list.Position = input.Position

	if err := config.DB.Save(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update list"})
		return
	}

	c.JSON(http.StatusOK, list)
}

// DeleteList deletes a specific list
func DeleteBoardList(c *gin.Context) {
	listID := c.Param("listId")

	// Get the list
	var list models.List
	if err := config.DB.Where("id = ?", listID).First(&list).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "List not found"})
		return
	}

	// Check if board exists and user has access
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

	// Delete list
	if err := config.DB.Delete(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete list"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "List deleted successfully"})
}
