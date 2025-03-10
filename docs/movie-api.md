# Movie API Documentation

## Endpoints

### Get Popular Movies
```http
GET /api/movies/getPopularMovies
```

Query Parameters:
- `page` (optional): Page number for pagination (default: 1)

Response:
```json
{
  "page": 1,
  "results": [
    {
      "id": number,
      "title": string,
      "overview": string,
      "poster_path": string,
      "release_date": string,
      "vote_average": number
    }
  ]
}
```

### Search Movies
```http
GET /api/movies/searchMovies
```

Query Parameters:
- `q`: Search query string (required)
- `page` (optional): Page number for pagination (default: 1)

Response:
```json
{
  "page": 1,
  "results": [
    {
      "id": number,
      "title": string,
      "overview": string,
      "poster_path": string,
      "release_date": string,
      "vote_average": number
    }
  ]
}
```

### Get Movie Details
```http
GET /api/movies/getMovieDetails/:id
```

Parameters:
- `id`: TMDB movie ID

Response:
```json
{
  "id": number,
  "title": string,
  "overview": string,
  "poster_path": string,
  "backdrop_path": string,
  "release_date": string,
  "vote_average": number
}
```

### Add to Favorites
```http
POST /api/movies/addToFavorites
```

Authentication: Required (Bearer Token)

Request Body:
```json
{
  "tmdbId": number,
  "title": string,
  "posterPath": string
}
```

Response:
```json
{
  "id": number,
  "userId": number,
  "movieId": number,
  "createdAt": string,
  "movie": {
    "id": number,
    "tmdbId": number,
    "title": string,
    "overview": string,
    "posterPath": string,
    "backdropPath": string,
    "releaseDate": string,
    "voteAverage": number
  }
}
```

### Get Favorites
```http
GET /api/movies/favorites
```

Authentication: Required (Bearer Token)

Response:
```json
[
  {
    "id": number,
    "userId": number,
    "movieId": number,
    "createdAt": string,
    "movie": {
      "id": number,
      "tmdbId": number,
      "title": string,
      "overview": string,
      "posterPath": string,
      "backdropPath": string,
      "releaseDate": string,
      "voteAverage": number
    }
  }
]
```

### Remove from Favorites
```http
DELETE /api/movies/favorites/:movieId
```

Authentication: Required (Bearer Token)

Parameters:
- `movieId`: Database movie ID

Response:
```json
{
  "message": "Movie removed from favorites"
}
```

### Check Favorite Status
```http
GET /api/movies/checkFavorite/:tmdbId
```

Authentication: Required (Bearer Token)

Parameters:
- `tmdbId`: TMDB movie ID

Response:
```json
{
  "isFavorited": boolean
}
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "message": "Not authenticated"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message description"
}
```

## Notes

- All authenticated endpoints require a valid JWT token in the Authorization header
- The token should be included in the format: `Bearer <token>`
- All date fields are in ISO 8601 format
- Image paths (poster_path, backdrop_path) are relative paths that need to be prefixed with the TMDB image base URL
