package main

import (
	"trello-backend/middlewares"
	"trello-backend/routes"
)

func main() {
	middlewares.InitJWTSecret()
	router := routes.SetupRouter()

	router.Run(":8080")
}
