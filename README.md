# Brand Mentions Dashboard

A production-ready SaaS dashboard for tracking brand mentions across AI models like ChatGPT, Claude, Gemini, and Perplexity.

## Key Features
- **Comprehensive Analytics:** Track search ranks, positive sentiment trends, and AI model mention rates.
- **Advanced Filtering:** Filter deeply by date ranges, models, sentiments, and query strings.
- **Premium UI/UX:** Built with a design-system driven architecture, featuring high-contrast theming and dark mode.
- **Robust Architecture:** Clean repository-service pattern backend powered by FastAPI, PostgreSQL, and Next.js.

## Architecture & Choices
Please read [ARCHITECTURE.md](ARCHITECTURE.md) for detailed engineering decisions regarding the tech stack, scaling, and database optimizations.

## Setup Requirements
- [Docker](https://www.docker.com/) (for PostgreSQL)
- Python 3.10+
- Node.js 18+

## Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. Activate the virtual environment
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt psycopg2-binary asyncpg sqlalchemy alembic python-dotenv pydantic-settings`
5. Start the PostgreSQL instance: `docker-compose up -d`
6. Create an `.env` file referencing `.env.example`.
7. Run Alembic migrations: `alembic upgrade head`
8. Start the FastAPI server: `uvicorn app.main:app --reload`

## Frontend Setup
1. `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Deployment Notes
- **Backend**: Can be containerized via the included Dockerfile. Best deployed to Railway, Render, or ECS.
- **Frontend**: Fully optimized for Vercel deployment with Serverless endpoints. Ensure CORS paths define the production domain.
