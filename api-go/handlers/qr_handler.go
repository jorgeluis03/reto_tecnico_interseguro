package handlers

import (
	"reto_tecnico/api-go/clients"
	"reto_tecnico/api-go/services"

	"github.com/gofiber/fiber/v2"
)

type MatrixInput struct {
	Matrix [][]float64 `json:"matrix"`
}

func QRFactorizationHandler(c *fiber.Ctx) error {
	var input MatrixInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body: " + err.Error(),
		})
	}

	if len(input.Matrix) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "matrix field is required and must not be empty",
		})
	}

	qrResult, err := services.QRFactorize(input.Matrix)
	if err != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	statistics, err := clients.FetchStatistics(qrResult.Q, qrResult.R)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": "failed to fetch statistics from Node.js API: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"Q":          qrResult.Q,
		"R":          qrResult.R,
		"statistics": statistics,
	})
}
