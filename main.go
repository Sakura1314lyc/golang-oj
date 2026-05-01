package main

import (
	"log"
	"net/http"

	"golang-oj/config"
	"golang-oj/database"
	"golang-oj/routes"
	"golang-oj/seed"
)

func main() {
	cfg := config.Load()

	database.Init(cfg)
	database.Migrate()
	seed.All()

	handler := routes.Setup(cfg)

	log.Printf("GOOJ backend running at %s", cfg.ServerPort)
	log.Fatal(http.ListenAndServe(cfg.ServerPort, handler))
}
