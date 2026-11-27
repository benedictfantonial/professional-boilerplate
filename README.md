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

1. Why is email verification important for security? What problems does it prevent?
Email verification confirms that a user actually owns and has access to the email address used to register. It prevents unauthorized sign-ups with someone else's email, reduces fake/bot accounts, ensures password resets and critical alerts reach the real account owner, and helps protect sender reputation by avoiding undeliverable or unwanted emails.

2. Explain the "always return success" pattern in forgot password. Why is it a security best practice?
Returning a generic success message regardless of whether the email exists in the database hides account existence from callers. This prevents attackers from probing /forgot-password to build a list of valid user emails and launch targeted phishing or credential-stuffing attacks.

3. What's the difference between a verification token and a reset token? Why do they have different expiration times?
A verification token proves ownership of an email address to activate an unverified account, whereas a reset token authorizes changing a user's password. Verification tokens typically have a longer window (such as 24 hours in your service) because users may check email later, while reset tokens have a shorter window (such as 1 hour) to limit the time window if a password-reset email is intercepted or requested unexpectedly.

4. Why do we use crypto.randomBytes(32) instead of Math.random() or Date.now() for token generation?
crypto.randomBytes(32) uses a cryptographically secure pseudo-random number generator (CSPRNG) to produce 256 bits of unpredictable entropy, making tokens practically impossible to guess or brute-force. Math.random() is not cryptographically secure and can be predictable, and Date.now() is deterministic/guessable based on timestamps.

5. What happens if a user never verifies their email? How does your system handle this?
In your implementation, an unverified user is created with isVerified: false, verificationToken, and verificationTokenExpiry. Login is blocked for unverified accounts (returning 401 / UNAUTHORIZED), forgotPassword skips unverified accounts while still returning a generic success message, and resendVerification lets them request a fresh token if they still need to verify.

6. Explain why tokens are cleared after use. What security risk does this prevent?
Clearing verificationToken / verificationTokenExpiry (and resetPasswordToken / resetPasswordExpiry) after a token is used makes it single-use. This prevents replay attacks—such as someone reusing an old link found in browser history, logs, or a compromised inbox to re-trigger verification or reset a password again.

7. What is email enumeration and how does your implementation prevent it?
Email enumeration is when an attacker determines whether an email address is registered by observing differences in responses, error messages, or behavior across endpoints. Your VerificationService.forgotPassword implementation prevents this by returning the same generic message whether the email doesn't exist, is unverified, or is verified—and resendVerification similarly avoids revealing whether an account exists.

8. If you had to implement two-factor authentication (2FA) on top of this system, how would you approach it?
I would add 2FA fields on the User entity (such as isTwoFactorEnabled, an encrypted twoFactorSecret, and hashed backup codes), allow users to enroll via an authenticator app (TOTP) or email/SMS OTP, and update /api/auth/login so valid password credentials issue a short-lived pending/challenge token rather than a full session/JWT until the second factor is verified.

9. What are the trade-offs between using Ethereal (test service) vs. SendGrid (production service)?
Ethereal is free, requires zero real recipient setup, and provides instant web previews for local development/testing, but it never delivers emails to real inboxes and isn't meant for production traffic. SendGrid delivers real emails at scale with analytics, templates, and deliverability tooling, but involves paid tiers, account/domain setup (SPF/DKIM/DMARC), and external rate/reputation management.

10. How would you handle a situation where a user's email provider marks your emails as spam?
I would configure proper domain authentication (SPF, DKIM, and DMARC), send from a dedicated verified domain/sender rather than a generic address, keep email copy and links clean and transparent, monitor bounce/spam reports and blocklists, and provide clear guidance (like checking the spam folder or resending verification) while keeping automated resend rate-limited.