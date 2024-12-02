package models

type CardResponse struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Position    int    `json:"position"`
}

type ListResponse struct {
	ID       string         `json:"id"`
	Name     string         `json:"name"`
	Position int            `json:"position"`
	Cards    []CardResponse `json:"cards"`
}

type BoardFullResponse struct {
	ID    string         `json:"id"`
	Name  string         `json:"name"`
	Lists []ListResponse `json:"lists"`
}
