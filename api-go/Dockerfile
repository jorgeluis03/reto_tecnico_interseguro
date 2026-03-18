FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -mod=mod -o api-go .

FROM alpine:3.18 AS runner

WORKDIR /app

COPY --from=builder /app/api-go .

EXPOSE 8080

CMD ["./api-go"]
