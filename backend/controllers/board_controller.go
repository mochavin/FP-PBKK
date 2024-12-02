package controllers

import (
	"net/http"
	"trello-backend/config"
	"trello-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CreateBoard membuat board baru
func CreateBoard(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	userID, _ := c.Get("userID")

	board := models.Board{
		ID:      uuid.NewString(),
		Name:    input.Name,
		OwnerID: userID.(string),
	}

	if err := config.DB.Create(&board).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create board"})
		return
	}

	c.JSON(http.StatusCreated, board)
}

// GetAllBoards mendapatkan semua boards milik pengguna
func GetAllBoards(c *gin.Context) {
	userID, _ := c.Get("userID")

	var boards []models.Board
	if err := config.DB.Where("owner_id = ?", userID).Find(&boards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get boards"})
		return
	}

	c.JSON(http.StatusOK, boards)
}

// GetBoard mendapatkan board berdasarkan ID
func GetBoard(c *gin.Context) {
	boardID := c.Param("boardId")

	var board models.Board
	if err := config.DB.Where("id = ?", boardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	c.JSON(http.StatusOK, board)
}

// UpdateBoard memperbarui board berdasarkan ID
func UpdateBoard(c *gin.Context) {
	boardID := c.Param("boardId")

	var input struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var board models.Board
	if err := config.DB.Where("id = ?", boardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	board.Name = input.Name
	if err := config.DB.Save(&board).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update board"})
		return
	}

	c.JSON(http.StatusOK, board)
}

// DeleteBoard menghapus board berdasarkan ID
func DeleteBoard(c *gin.Context) {
	boardID := c.Param("boardId")

	if err := config.DB.Where("id = ?", boardID).Delete(&models.Board{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete board"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Board deleted successfully"})
}
