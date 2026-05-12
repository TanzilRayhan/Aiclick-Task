# Brand Mentions Dashboard Architecture

## Why PostgreSQL over SQLite?
SQLite is excellent for MVPs but lacks production features like concurrency control (it uses file-level locking for writes), advanced indexing, JSONB support for unstructured analytics, and fine-grained roles. PostgreSQL handles high-throughput analytics, concurrent writes from background workers, and scales seamlessly both vertically and horizontally. 

## Clean Architecture & Repository/Service Pattern
The application avoids "fat routes" by separating concerns:
- **Routers** (api/v1/endpoints): Handle HTTP requests, responses, and dependency injection.
- **Services** (services): Contain core business logic (e.g., trend calculation, metric aggregation).
- **Repositories** (repositories): Abstract the database operations, making it easy to swap implementations or mock for tests.
- **Schemas** (schemas): Pydantic models for explicit I/O validation and API documentation.
- **Models** (models): SQLAlchemy declarative base for database mapping.

This makes the system highly testable and decoupled. 

## Scalability Choices
- **Asynchronous I/O**: The API utilizes FastAPI and AsyncPG to support high-throughput network requests.
- **Database Indexing**: Crucial columns (`ai_model`, `sentiment`, `mention_date`, `mentioned`) have indexes to optimize analytical aggregation.
- **Server-Side Pagination & Filtering**: Offloads memory demands from the client, ensuring snappy UI even with 1M+ rows.
- **Modular Frontend**: Components are strictly typed, encapsulated, and rely on standard scalable practices (custom hooks for data fetching). 

## Performance Considerations
- **Query Aggregation**: Trends and summaries are pushed to the database via SQL `GROUP BY` rather than computing in-memory in Python.
- **Lazy Loading & Skeletons**: Frontend UX relies on React Suspense and skeletons to keep TTI (Time to Interactive) low.

## Future Improvements
- **Caching Layer**: Redis can be introduced to cache `/summary` and `/trends` endpoints which update less frequently.
- **Queue System**: Process incoming mentions ingestion using Celery or RabbitMQ instead of synchronous endpoints.
- **Authentication**: JWT or an external provider (Auth0/Supabase Auth) for protected endpoints.
- **Multi-Tenant Structure**: If scaling to B2B SaaS, implement row-level security or schema isolation.
