// src/types/express.d.ts
declare namespace Express {
  export interface Request {
    user?: {
      id: string; // Assuming userId is a string
      username: string; // Add other user properties from JWT if needed
    };
  }
}
