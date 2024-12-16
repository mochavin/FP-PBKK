# Use the official Go 1.22 base image as a build stage
FROM golang:1.22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files (go.mod, go.sum) for efficient caching
COPY go.mod go.sum ./

# Download dependencies 
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the application, statically linking if desired.
# Consider setting GOOS and GOARCH if cross-compiling.
RUN CGO_ENABLED=0 GOOS=linux go build -o backend

# Start a new stage from a smaller base image
FROM alpine:latest

# Set working directory for the final image
WORKDIR /root/

# Copy the compiled binary from the build stage
COPY --from=build /app/backend .

# Expose the port your application listens on (if needed)
EXPOSE 8080

# Define the command to run when the container starts
CMD ["./backend"]