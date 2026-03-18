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

// denseToSlice converts a gonum Dense matrix to a row-major [][]float64 slice.
func denseToSlice(d *mat.Dense) [][]float64 {
	rows, cols := d.Dims()
	result := make([][]float64, rows)
	for i := 0; i < rows; i++ {
		result[i] = make([]float64, cols)
		for j := 0; j < cols; j++ {
			result[i][j] = d.At(i, j)
		}
	}
	return result
}

func QRFactorize(matrix [][]float64) (*QRResult, error) {
	if len(matrix) == 0 {
		return nil, errors.New("matrix must have at least one row")
	}

	rows := len(matrix)
	cols := len(matrix[0])

	if cols == 0 {
		return nil, errors.New("matrix must have at least one column")
	}

	for i, row := range matrix {
		if len(row) != cols {
			return nil, fmt.Errorf("row %d has %d columns, expected %d", i, len(row), cols)
		}
	}

	if rows < cols {
		return nil, fmt.Errorf("matrix must have at least as many rows as columns (rows=%d, cols=%d); QR factorization requires m >= n", rows, cols)
	}

	flat := make([]float64, rows*cols)
	for i, row := range matrix {
		for j, v := range row {
			flat[i*cols+j] = v
		}
	}

	A := mat.NewDense(rows, cols, flat)

	// gonum stores Householder reflectors compactly inside qr; Q and R are
	// materialized on demand via QTo/RTo, avoiding unnecessary allocations.
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
