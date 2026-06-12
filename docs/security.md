# Campus Echo — Security Specification

Campus Echo prioritizes data privacy, role authorization, and network security. The codebase aligns with standard OWASP security recommendations.

## 1. Authentication & Session Security

*   **Access Token Rotation**: JWT tokens are issued with a short lifespan (15 minutes). Requests attach this token using the `Authorization: Bearer <token>` header.
*   **Refresh Tokens**: Stored securely. Used to request new access tokens without requiring re-authentication. Valid for 7 days.
*   **Password Hashing**: Done using `bcryptjs` (10 salt rounds) prior to saving in the PostgreSQL database.

## 2. Role-Based Access Control (RBAC)

*   Global guards (`RolesGuard`, `PermissionsGuard`) parse metadata annotations on controllers and specific endpoints.
*   Any endpoint lacking a `@Public()` decorator requires authenticated JWT access.
*   Role hierarchy determines access limits:
    *   `STUDENT`: Write posts, comment, submit tickets.
    *   `FACULTY`: Write posts, comment, pin comments, submit announcements.
    *   `MODERATOR`: Resolve moderation report queues, hide posts.
    *   `DEPT_ADMIN`: Assign department tickets, moderate department posts.
    *   `UNIV_ADMIN` / `SUPER_ADMIN`: Access analytics, configure billing/system roles.

## 3. Data Sanitization & Protection

*   **Validation Pipes**: NestJS `ValidationPipe` whitelist properties to prevent SQL injection and mass assignment vulnerabilities (overriding columns like `roleId` on user registration).
*   **Helmet Headers**: Helmet secures Express/NestJS headers to mitigate XSS (Cross-Site Scripting) and clickjacking.
*   **CORS Policies**: Explicit origin and method rules limit API consumption to trusted sources.

## 4. Anonymity Isolation

*   Anonymous posts and comments decouple real identities from payloads:
    *   The database table retains a private link to the creator's `userId` for moderation/abuse escalations.
    *   API return payloads replace the `author` field with the corresponding `AnonymousProfile` alias and avatar, preventing leaking user info to client browsers.
