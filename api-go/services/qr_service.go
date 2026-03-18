package services

import (
	"errors"
	"fmt"

	"gonum.org/v1/gonum/mat"
)

type QRResult struct {
	Q [][]float64
	R [][]float64
}

func denseToSlice(m *mat.Dense) [][]float64 {
	rows, cols := m.Dims()
	result := make([][]float64, rows)
	for i := 0; i < rows; i++ {
		result[i] = make([]float64, cols)
		for j := 0; j < cols; j++ {
			result[i][j] = m.At(i, j)
		}
	}
	return result
}

func QRFactorize(matrix [][]float64) (*QRResult, error) {
	if len(matrix) == 0 {
		return nil, errors.New("matrix must have at least one row")
	}

	m := len(matrix)
	n := len(matrix[0])

	if n == 0 {
		return nil, errors.New("matrix must have at least one column")
	}

	for i, row := range matrix {
		if len(row) != n {
			return nil, fmt.Errorf("row %d has %d columns, expected %d", i, len(row), n)
		}
	}

	if m < n {
		return nil, fmt.Errorf("matrix must have at least as many rows as columns (m=%d, n=%d); QR factorization requires m >= n", m, n)
	}

	flat := make([]float64, m*n)
	for i, row := range matrix {
		for j, v := range row {
			flat[i*n+j] = v
		}
	}

	A := mat.NewDense(m, n, flat)

	var qr mat.QR
	qr.Factorize(A)

	var Q mat.Dense
	qr.QTo(&Q)

	var R mat.Dense
	qr.RTo(&R)

	return &QRResult{
		Q: denseToSlice(&Q),
		R: denseToSlice(&R),
	}, nil
}
