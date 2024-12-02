// routes/routes.go
package routes

import (
	"trello-backend/config"
	"trello-backend/controllers"
	"trello-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	config.ConnectDB()
	router := gin.Default()

	auth := router.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}

	board := router.Group("/board")
	board.Use(middlewares.AuthMiddleware())
	{
		board.POST("/", controllers.CreateBoard)
		board.GET("/", controllers.GetAllBoards)
		board.GET("/:boardId", controllers.GetBoard)
		board.PUT("/:boardId", controllers.UpdateBoard)
		board.DELETE("/:boardId", controllers.DeleteBoard)

		board.POST("/:boardId/lists", controllers.CreateList)
		board.GET("/:boardId/lists", controllers.GetBoardLists)
		board.GET("/:boardId/lists/:listId", controllers.GetBoardList)
		board.PUT("/:boardId/lists/:listId", controllers.UpdateBoardList)
		board.DELETE("/:boardId/lists/:listId", controllers.DeleteBoardList)

		board.POST("/:boardId/lists/:listId/cards", controllers.CreateCard)
		board.GET("/:boardId/lists/:listId/cards", controllers.GetListCards)
		board.GET("/:boardId/lists/:listId/cards/:cardId", controllers.GetCardByID)
		board.PUT("/:boardId/lists/:listId/cards/:cardId", controllers.UpdateCard)
		board.DELETE("/:boardId/lists/:listId/cards/:cardId", controllers.DeleteCard)

		board.GET("/:boardId/full", controllers.GetBoardWithLists)
	}

	return router
}
