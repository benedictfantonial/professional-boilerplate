1. What is the difference between authentication and authorization? Give a real-world example of each.

Authentication is the process of verifying a user's identity, while authorization determines what the user is allowed to access or do.

Example:
- Authentication: Logging into a bank account using your username and password.
- Authorization: Being allowed to view your account balance but not access another person's bank account.
2. Why is JWT considered "stateless" and how does that benefit scalability?

JWT is considered stateless because the server does not need to store session information for every logged-in user. The token contains the necessary information, and the server verifies it using a secret key.

This benefits scalability because multiple servers can verify tokens independently without sharing session storage, making it easier to handle many users.

3. What are the three parts of a JWT token and what does each part do?

A JWT token has three parts:
1. Header – Contains information about the token type and signing algorithm.
2. Payload – Contains information or claims about the user, such as user ID and email.
3. Signature – Verifies that the token has not been modified and was signed using the correct secret.
4. Why should you never put sensitive data (like passwords) in the JWT payload?

JWT payloads are encoded, not encrypted by default. Anyone who obtains the token can decode and read its payload. Putting passwords or other sensitive information inside it could expose private user data.

5. How does bcrypt protect user passwords? What is the purpose of the "salt" and "rounds"?

Bcrypt protects passwords by hashing them instead of storing them as plain text.
- Salt: A random value added during hashing to make identical passwords produce different hashes.
- Rounds: Controls the computational cost of hashing. More rounds make password guessing slower and more difficult.
This helps protect passwords even if the database is compromised.

6. What happens if someone steals a JWT token? How can you mitigate this risk?

If someone steals a JWT token, they can use it to access protected routes and impersonate the legitimate user until the token expires or is otherwise invalidated.

To reduce this risk:
- Use HTTPS.
- Set short token expiration times.
- Store tokens securely.
- Never share tokens with others.
- Use refresh token rotation and revoke compromised refresh tokens.
7. Why is it important to use HTTPS when transmitting JWT tokens?

HTTPS encrypts communication between the client and server. It prevents attackers from easily intercepting JWT tokens while they are being transmitted. Without HTTPS, an attacker on the network could steal a token and use it to access protected resources.

8. What is the difference between a short-lived access token and a long-lived refresh token? When would you use each?

An access token is a short-lived token used to access protected API endpoints. A refresh token is longer-lived and is used to obtain a new access token without requiring the user to log in again.

Example:
- Access token: Expires after 15 minutes.
- Refresh token: Expires after 7 days.
You use access tokens for normal API requests and refresh tokens when the access token expires.

9. How does the auth middleware know which user is making the request?

The authentication middleware reads the JWT from the Authorization header using the Bearer token format. It verifies the token using the JWT secret and extracts the user's information from the payload.

In our project, the middleware assigns the decoded information to req.user, allowing other parts of the application to identify the authenticated user.

10. If you had to implement role-based authorization (e.g., admin vs. regular user), how would you modify your current setup?

I would add a role field to the User entity, such as admin or user. After authentication, I would create an authorization middleware that checks the user's role before allowing access to specific routes.

For example:
- Admin users can manage all users.
- Regular users can only access their own information.