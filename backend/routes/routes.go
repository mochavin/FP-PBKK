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
	}

	return router
}
