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

type BoardOwner struct {
	Username string `json:"username"`
	Email    string `json:"email"`
}

type BoardResponse struct {
	ID      string     `json:"id"`
	Name    string     `json:"name"`
	OwnerID string     `json:"ownerId"`
	Owner   BoardOwner `json:"owner"`
}

// GetAllBoards mendapatkan semua boards milik pengguna
func GetAllBoards(c *gin.Context) {
	userID, _ := c.Get("userID")

	var boards []models.Board
	if err := config.DB.Preload("Owner").Where("owner_id = ?", userID).Find(&boards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get boards"})
		return
	}

	// Map to response struct
	boardResponses := make([]BoardResponse, len(boards))
	for i, board := range boards {
		boardResponses[i] = BoardResponse{
			ID:      board.ID,
			Name:    board.Name,
			OwnerID: board.OwnerID,
			Owner: BoardOwner{
				Username: board.Owner.Username,
				Email:    board.Owner.Email,
			},
		}
	}

	c.JSON(http.StatusOK, boardResponses)
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

// GetBoardWithLists gets a board with all its lists and cards
func GetBoardWithLists(c *gin.Context) {
	boardID := c.Param("boardId")

	// Get board and check ownership
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

	// Get all lists with cards
	var lists []models.List
	if err := config.DB.Where("board_id = ?", boardID).Order("position").Find(&lists).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get lists"})
		return
	}

	// Build response
	response := models.BoardFullResponse{
		ID:    board.ID,
		Name:  board.Name,
		Lists: make([]models.ListResponse, 0),
	}

	for _, list := range lists {
		// Get cards for this list
		var cards []models.Card
		if err := config.DB.Where("list_id = ?", list.ID).Order("position").Find(&cards).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cards"})
			return
		}

		// Build cards response
		cardResponses := make([]models.CardResponse, len(cards))
		for i, card := range cards {
			cardResponses[i] = models.CardResponse{
				ID:          card.ID,
				Title:       card.Title,
				Description: card.Description,
				Position:    card.Position,
			}
		}

		// Add list with its cards to response
		response.Lists = append(response.Lists, models.ListResponse{
			ID:       list.ID,
			Name:     list.Name,
			Position: list.Position,
			Cards:    cardResponses,
		})
	}

	c.JSON(http.StatusOK, response)
}
