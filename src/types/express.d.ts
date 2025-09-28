// src/types/express.d.ts
// This file extends the Express Request interface to include our custom 'user' property.
// This is necessary for TypeScript to recognize `request.user`.

declare namespace Express {
    // Define the structure of your JWT payload
    interface JwtPayload {
        sub: string;      // The user's ID (from user._id.toString())
        username: string; // The user's username
        email: string;    // The user's email (if included in payload)
        iat: number;      // Issued at timestamp
        exp: number;      // Expiration timestamp

    }

    interface Request {
        user: JwtPayload; // Now request.user is strongly typed as JwtPayload
    }
}