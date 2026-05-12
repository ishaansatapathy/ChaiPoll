# TypeScript Migration Guide

This guide helps you migrate ChaiPoll to TypeScript incrementally. You don't have to migrate everything at once!

## Setup Complete ✅

TypeScript configurations are already set up for both frontend and backend:

- `tsconfig.json` - Frontend configuration
- `server/tsconfig.json` - Backend configuration
- Path aliases configured for cleaner imports

## Frontend Migration Steps

### Step 1: Create Type Definitions (Already Done ✅)

- Basic types are in `src/types/index.ts`
- Add more types as needed

### Step 2: Rename Components Incrementally

Start with utility components that have fewer dependencies:

```bash
# Rename a component
mv src/components/ui/Button.jsx src/components/ui/Button.tsx
```

### Step 3: Update Imports

In the renamed `.tsx` file, TypeScript will show errors for missing types:

```tsx
// Before
export function Button({ children, to, variant = "primary", className = "", ...props }) {
  // ...
}

// After
import { ComponentPropsWithoutRef } from "react";
import { Link } from "react-router-dom";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  children: React.ReactNode;
  to?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

export function Button({
  children,
  to,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  // TypeScript now provides full intellisense
}
```

### Step 4: Migrate Context (Recommended Next)

The AuthContext is used throughout the app - converting it gives immediate benefits:

```tsx
// src/context/AuthContext.tsx
import { ReactNode, createContext, useContext } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

### Step 5: Migrate Hooks

- `src/hooks/useSpotlight.ts`
- Create custom hooks with proper return types

### Step 6: Migrate Pages

Start with simpler pages like Home, then move to complex ones like CreatePoll

### Step 7: Migrate Services

API service layer - update `src/services/api.ts`:

```tsx
import axios, { AxiosError } from "axios";
import type { Poll, Vote, User } from "@/types";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export const createPoll = (pollData: Omit<Poll, "_id" | "pollCode">): Promise<Poll> =>
  API.post("/polls", pollData);

export const submitVote = (voteData: Vote): Promise<{ message: string; poll: Poll }> =>
  API.post("/votes", voteData);
```

## Backend Migration Steps

### Step 1: Models to TypeScript

Convert Mongoose models to use TypeScript interfaces:

```typescript
// server/types/models.ts
import { Document } from "mongoose";

export interface IPoll extends Document {
  pollCode: string;
  title: string;
  description?: string;
  questions: IQuestion[];
  createdBy: string;
  // ... other fields
}

// server/models/Poll.ts
import mongoose, { Schema } from "mongoose";
import type { IPoll } from "../types/models";

const pollSchema = new Schema<IPoll>({
  // ... schema definition
});

export default mongoose.model<IPoll>("Poll", pollSchema);
```

### Step 2: Controllers to TypeScript

Add types to Express request handlers:

```typescript
// server/controllers/pollController.ts
import { Request, Response, NextFunction } from "express";
import type { IPoll } from "../types/models";

export const createPoll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, questions } = req.body;
    // Implementation
    res.status(201).json(poll);
  } catch (error) {
    next(error);
  }
};
```

### Step 3: Middleware to TypeScript

```typescript
// server/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import type { IUser } from "../types/models";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  // Implementation
};
```

### Step 4: Utils to TypeScript

Convert utility functions with proper types:

```typescript
// server/utils/generateToken.ts
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};
```

## Migration Checklist

### Frontend

- [ ] Create type definitions file
- [ ] Convert UI components (Button, Card, Input, etc.)
- [ ] Convert Context (AuthContext)
- [ ] Convert Hooks
- [ ] Convert Services (api.ts)
- [ ] Convert Pages
- [ ] Convert Layouts
- [ ] Update vite.config.js to recognize .tsx files

### Backend

- [ ] Create type definitions file
- [ ] Convert Models
- [ ] Convert Controllers
- [ ] Convert Middleware
- [ ] Convert Utils
- [ ] Convert Routes
- [ ] Convert Services
- [ ] Update package.json build script

## Commands to Add to package.json

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "build:server": "tsc --project server/tsconfig.json"
  }
}
```

## Best Practices

1. **Migrate incrementally** - One component/file at a time
2. **Use strict mode** - TypeScript config has `strict: true` for better type safety
3. **Leverage path aliases** - Use `@/` instead of relative paths
4. **Define interfaces early** - Create interfaces before converting files
5. **Test after migration** - Run tests to ensure functionality is preserved
6. **Don't use `any`** - Try to avoid `any` type, use `unknown` if necessary

## Common Patterns

### React Components

```tsx
interface Props {
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function MyComponent({ children, className, onClick }: Props) {
  return <button onClick={onClick}>{children}</button>;
}
```

### Async Functions

```typescript
async function fetchPoll(code: string): Promise<Poll> {
  const response = await api.get(`/polls/${code}`);
  return response.data;
}
```

### Error Handling

```typescript
try {
  const data = await fetchPoll(code);
} catch (error) {
  if (error instanceof AxiosError) {
    console.error(error.response?.data);
  }
}
```

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React + TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Express + TypeScript](https://expressjs.com/en/resources/middleware/cors.html)

## Getting Help

If you encounter TypeScript errors during migration:

1. Read the error message carefully - TypeScript is usually very descriptive
2. Check the type definition files in `src/types/` and `server/types/`
3. Use `tsc --noEmit` to see all type errors
4. Ask for help in the team or check TypeScript docs

---

**Happy Migrating! 🚀**
