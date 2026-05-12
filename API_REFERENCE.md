# API Reference - Brand Mentions Dashboard

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Currently no authentication. Will be added in production.

## Health Check
```
GET /health
```
Response:
```json
{"status": "ok"}
```

---

## Mentions Endpoints

### Get Paginated Mentions
```
POST /mentions
```

**Request Body:**
```json
{
  "page": 1,
  "per_page": 20,
  "sort_by": "mention_date",
  "sort_order": "desc",
  "filters": {
    "model": "ChatGPT",
    "sentiment": "Positive",
    "mentioned": true,
    "search": "your brand",
    "date_from": "2024-01-01T00:00:00",
    "date_to": "2024-12-31T23:59:59"
  }
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "query_text": "What is...",
      "source_url": "https://example.com",
      "ai_model": "ChatGPT",
      "sentiment": "Positive",
      "mentioned": true,
      "rank_position": 1,
      "mention_date": "2024-01-15T10:30:00",
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:30:00"
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 20
}
```

**Query Parameters:**
- `page` (int, default=1): Page number
- `per_page` (int, default=20, max=100): Items per page
- `sort_by` (string): Field to sort by (mention_date, query_text, sentiment, rank_position)
- `sort_order` (string): "asc" or "desc"

**Filter Options:**
- `model` (string): AI model name (ChatGPT, Claude, Gemini, Perplexity)
- `sentiment` (string): Positive, Negative, Neutral
- `mentioned` (boolean): Whether brand was mentioned
- `search` (string): Search in query_text or source_url
- `date_from` (datetime): ISO format
- `date_to` (datetime): ISO format

---

### Get Summary Stats
```
GET /mentions/summary
```

**Response:**
```json
{
  "total_mentions": 500,
  "total_queries": 450,
  "mention_percentage": 88.5,
  "avg_rank": 3.2,
  "sentiment_breakdown": [
    {"sentiment": "Positive", "count": 250},
    {"sentiment": "Neutral", "count": 150},
    {"sentiment": "Negative", "count": 100}
  ]
}
```

---

## Planned Endpoints (TODO)

### Get Trends
```
POST /mentions/trends
```

Request:
```json
{
  "date_from": "2024-01-01",
  "date_to": "2024-12-31",
  "group_by": "daily"  // daily, weekly, monthly
}
```

Response:
```json
{
  "data": [
    {"date": "2024-01-01", "total": 10, "mentioned": 8},
    {"date": "2024-01-02", "total": 12, "mentioned": 9}
  ]
}
```

### Model Distribution
```
GET /mentions/models-distribution
```

### Sentiment Breakdown Chart
```
GET /mentions/sentiment-breakdown
```

### Top Keywords
```
GET /mentions/top-keywords
```

### Top Sources
```
GET /mentions/top-sources
```

---

## Error Handling

All endpoints follow this error response format:

```json
{
  "detail": "Error message here"
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found
- `422`: Validation Error
- `500`: Server Error

---

## Rate Limiting
Currently disabled. Will be added for production.

---

## Webhooks
Currently not implemented. Can be added for real-time data sync.

---

## Data Models

### Mention
```
id: UUID
query_text: string
source_url: string | null
ai_model: string
sentiment: string | null
mentioned: boolean
rank_position: integer | null
mention_date: datetime
created_at: datetime
updated_at: datetime
```

### AI Model
```
id: UUID
name: string
provider: string
active: boolean
```

### Sentiment Type
```
id: UUID
label: string
color_code: string (hex color)
```

---

## Testing Endpoints

### Using cURL
```bash
# Health check
curl http://localhost:8000/health

# Get mentions (first 10)
curl -X POST http://localhost:8000/api/v1/mentions \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "per_page": 10}'

# Get summary
curl http://localhost:8000/api/v1/mentions/summary
```

### Using Swagger UI
Visit: `http://localhost:8000/docs`

---

## Future Enhancements
- [ ] Pagination cursors
- [ ] GraphQL endpoint
- [ ] WebSocket for real-time updates
- [ ] Bulk import API
- [ ] Export to CSV/PDF
- [ ] Advanced analytics endpoints
- [ ] User-specific filters/views
