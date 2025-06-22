import { IUser } from "../models/user.model"; // adjust the relative path!

declare global {
  namespace Express {
    interface Request {
      /** Populated by your auth middleware */
      user?: IUser;
    }
  }
}

// Make this file a module so it doesn't pollute the global scope unintentionally
export {};
