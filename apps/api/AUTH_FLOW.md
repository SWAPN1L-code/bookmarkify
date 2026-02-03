# Authentication Flow Explained

Based on the implementation in `AuthService` and `AuthController`, here is the step-by-step process of what happens when a user logs in.

## 1. Login Methods

### A. Email/Password
The user sends a `POST` request to `/auth/login` with their `email` and `password`.

### B. OAuth (Google/GitHub)
1.  Frontend redirects user to `/auth/google` or `/auth/github`.
2.  User approves access on the provider's page.
3.  Provider redirects back to `/auth/google/callback` or `/auth/github/callback`.
4.  Strategy normalizes the profile (email, name, photo).
5.  `AuthService.validateOAuthLogin` finds or creates the user.
6.  API redirects browser to frontend with tokens in URL:
    `http://localhost:5173/oauth/callback?accessToken=...&refreshToken=...`

## 2. User Verification (Email/Password)
The `login()` function in `AuthService` performs these checks:
1.  **Find User**: Looks for a user with the provided email.
2.  **Check Status**: Verifies `user.isActive`.
3.  **Check Password Existence**: Ensures user has a password (OAuth users don't).
4.  **Validate Password**: Uses `bcrypt` to compare hash.

## 3. Token Generation (All Methods)
Two JWTs (JSON Web Tokens) are generated:

### Access Token (The "Key")
*   **Lifespan**: 15 minutes
*   **Payload**: User ID, Email, Role, Organization ID.
*   **Usage**: Sent in the `Authorization` header (`Bearer <token>`) for API requests.

### Refresh Token (The "Renewal Ticket")
*   **Lifespan**: 7 days
*   **Storage**: Hashed and stored in the `refresh_tokens` database table.
*   **Usage**: Used to obtain a new Access Token when the current one expires.

## 4. The Response
*   **Email/Password**: Returns JSON object with User profile and Tokens.
*   **OAuth**: Redirects to Frontend with tokens in query parameters.
