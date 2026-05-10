# NOTES

## Trade-offs / Shortcuts

- Used SQLite initially for faster local setup and simpler development workflow. For production deployment, PostgreSQL would be a better long-term choice.
- Focused more on dashboard usability, filtering experience, and frontend polish instead of implementing deeper backend optimizations.
- Kept the backend architecture lightweight and simple to avoid unnecessary complexity for the scope of the task.
- Some analytics and dashboard insights are frontend-calculated instead of being fully optimized through dedicated backend aggregation endpoints.
- Prioritized clean UI/UX and maintainability over adding excessive features or abstractions.
- Used ChatGPT for understanding parts of the task, reading documentation, and brainstorming implementation approaches.
- Used GitHub Copilot AI Agent to speed up development and iteration workflow.

---

## What I Would Improve With More Time

- Migrate fully to PostgreSQL with proper migrations and production-ready database structure.
- Add authentication and user-based dashboards.
- Improve API performance with caching, query optimization, and pagination improvements for large datasets.
- Add more advanced analytics such as:
  - AI visibility scoring
  - competitor comparison
  - sentiment trend forecasting
  - source authority insights
- Improve test coverage for both frontend and backend.
- Add proper loading skeletons, optimistic UI updates, and more refined animations/interactions.
- Improve accessibility and keyboard navigation support.
- Add monitoring/logging and stronger production deployment setup.

---

## Time Spent

Approximately 2-3 hours total including:
- understanding the task
- backend setup
- frontend development
- dashboard UX improvements
- deployment setup
- debugging production issues
- UI refinement and polishing