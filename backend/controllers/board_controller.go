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

	// Automatically add the owner to the board's members
	if err := config.DB.Model(&board).Association("Members").Append(&models.User{ID: userID.(string)}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add owner to members"})
		return
	}

	c.JSON(http.StatusCreated, board)
}

type BoardOwner struct {
	Username string `json:"username"`
	Email    string `json:"email"`
}

type BoardMember struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

type BoardResponse struct {
	ID      string        `json:"id"`
	Name    string        `json:"name"`
	OwnerID string        `json:"ownerId"`
	Owner   BoardOwner    `json:"owner"`
	Members []BoardMember `json:"members"`
}

// GetAllBoards mendapatkan semua boards milik pengguna
func GetAllBoards(c *gin.Context) {
	userID, _ := c.Get("userID")

	var boards []models.Board
	// Preload Owner and Members relationships
	if err := config.DB.Preload("Owner").Preload("Members").
		Joins("JOIN board_members ON boards.id = board_members.board_id").
		Where("board_members.user_id = ?", userID).Find(&boards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get boards"})
		return
	}

	// Map to response struct
	boardResponses := make([]BoardResponse, len(boards))
	for i, board := range boards {
		// Map members to response
		members := make([]BoardMember, len(board.Members))
		for j, member := range board.Members {
			members[j] = BoardMember{
				ID:       member.ID,
				Username: member.Username,
				Email:    member.Email,
			}
		}

		boardResponses[i] = BoardResponse{
			ID:      board.ID,
			Name:    board.Name,
			OwnerID: board.OwnerID,
			Owner: BoardOwner{
				Username: board.Owner.Username,
				Email:    board.Owner.Email,
			},
			Members: members,
		}
	}

	c.JSON(http.StatusOK, boardResponses)
}

// GetBoard mendapatkan board berdasarkan ID
func GetBoard(c *gin.Context) {
	boardID := c.Param("boardId")
	userID, _ := c.Get("userID")

	var board models.Board
	if err := config.DB.Preload("Owner").Preload("Members").
		Where("id = ?", boardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	// Check if user is the owner or a member
	isMember := board.OwnerID == userID.(string)
	for _, member := range board.Members {
		if member.ID == userID.(string) {
			isMember = true
			break
		}
	}

	if !isMember {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, board)
}

// UpdateBoard memperbarui board berdasarkan ID
func UpdateBoard(c *gin.Context) {
	boardID := c.Param("boardId")
	userID, _ := c.Get("userID")

	var input struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var board models.Board
	if err := config.DB.Preload("Members").
		Where("id = ?", boardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	// Check if user is a member or owner
	isMember := board.OwnerID == userID.(string)
	for _, member := range board.Members {
		if member.ID == userID.(string) {
			isMember = true
			break
		}
	}

	if !isMember {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
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
	userID, _ := c.Get("userID")

	var board models.Board
	if err := config.DB.Where("id = ?", boardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	// Only the owner can delete the board
	if board.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := config.DB.Delete(&board).Error; err != nil {
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
				Deadline:    card.Deadline,
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

func GetAllUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

func AddBoardMember(c *gin.Context) {
	boardID := c.Param("boardId")
	var input struct {
		UserID string `json:"userId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Check if board exists
	var board models.Board
	if err := config.DB.Preload("Members").Where("id = ?", boardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	// Check if user exists
	var user models.User
	if err := config.DB.Where("id = ?", input.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Add the user to the board's members
	if err := config.DB.Model(&board).Association("Members").Append(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add member to the board"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member added successfully"})
}

func RemoveBoardMember(c *gin.Context) {
	boardID := c.Param("boardId")
	userID := c.Param("userId")

	// Check if board exists
	var board models.Board
	if err := config.DB.Preload("Members").Where("id = ?", boardID).First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Board not found"})
		return
	}

	// Check if user is a member of the board
	var user models.User
	if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Remove the user from the board's members
	if err := config.DB.Model(&board).Association("Members").Delete(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove member from the board"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed successfully"})
}
