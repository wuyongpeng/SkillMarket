FROM golang:1.23-alpine AS builder
WORKDIR /app

# Install git (needed by go mod tidy to fetch deps)
RUN apk add --no-cache git

COPY go.mod ./
COPY . .
RUN go mod tidy && go build -o server ./cmd/server

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
