package main

import (
	"log"

	"reto_tecnico/api-go/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	app := fiber.New()

	app.Use(logger.New())
	app.Use(recover.New())

	app.Post("/qr-factorization", handlers.QRFactorizationHandler)

	log.Fatal(app.Listen(":8080"))
}
