// routes/routes.go
package routes

import (
	"trello-backend/config"
	"trello-backend/controllers"

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

	return router
}
