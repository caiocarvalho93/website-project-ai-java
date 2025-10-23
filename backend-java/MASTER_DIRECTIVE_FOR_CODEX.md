# MASTER DIRECTIVE FOR CODEX

You are refactoring and finalizing a full-stack project called **AI Intelligence Network**.

It currently has:
- A Node.js backend (with PostgreSQL, API integrations, and analytics)
- A React frontend dashboard
- A new Java (Spring Boot) backend under `/backend-java` that replaces the old Node backend for production
- PostgreSQL on Railway
- Real APIs (NewsAPI + fallback)

Your job is to:
1. **Unify all backends** into a single, clean Spring Boot project under `/backend-java`
2. Migrate any Node.js backend logic (analytics, database schema, storage, AI scoring, game system) into the new Java backend
3. Keep PostgreSQL as the database and migrate its schema and connections
4. Keep the frontend functional — ensure all `/api/` routes in React map correctly to the new Java endpoints
5. Remove unused or redundant files
6. Fix the Maven dependencies (HTTP 403 or any download issue)
7. Output a **fully working build**, ready to deploy on Railway
8. Keep all original functionality, including:
   - Country news fetching
   - AI intelligence scoring and analytics
   - PostgreSQL persistence
   - Game leaderboard
   - Achievements and analytics tracking
9. Ensure Java backend includes all the logic from these Node functions:
   - `storeArticles`
   - `initializeDatabase`
   - `getGameScores`
   - `getEnhancedLeaderboard`
   - `getTrendingTopics`
   - `generateAIIntelligenceReport`
10. Add any missing model classes (entities, DTOs) for these.

Finally, generate the **updated backend-java folder** with:
- Corrected `pom.xml`
- Functional PostgreSQL configuration
- Entity + Service + Controller layers
- Unit tests that pass

Use modern Spring Boot patterns (`@RestController`, `@Service`, `@Repository`, `@Entity`, `@Configuration`).

---

## Execution Checklist

1. Paste the entire current codebase (Java backend, Node backend, shared libraries, configuration, and relevant documentation) so Codex has full context.
2. Run the following Maven build inside `/backend-java` and ensure it completes without dependency errors:

   ```bash
   cd backend-java
   mvn clean package -DskipTests
   ```

   If the command fails, adjust `pom.xml` or project configuration and retry until it succeeds.

3. Start the Spring Boot application and verify it runs correctly:

   ```bash
   java -jar target/website-project-ai-java-0.0.1-SNAPSHOT.jar
   ```

   Resolve any configuration issues that prevent startup (datasource, API keys, etc.).

4. Confirm the API endpoints respond as expected:

   ```bash
   curl http://localhost:8080/api/country-news/us
   curl http://localhost:8080/api/health
   ```

   The first command should return live country news data. The second should return `OK`.

Document any remaining gaps or follow-up tasks after executing the checklist.
