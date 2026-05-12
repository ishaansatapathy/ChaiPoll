# Quick Start - New Features

## 🚀 Getting Started with Improvements

### 1. **Code Quality (2 min setup)**

```bash
# Install dependencies (already done, skip if installed)
npm install
npm --prefix server install

# Run linting & formatting
npm run lint:fix
npm run format
```

**What it does:**

- Finds and fixes code style issues
- Formats all code consistently
- Catches common errors early

---

### 2. **Run E2E Tests (5-10 min)**

```bash
# Ensure everything is running
npm install
npm run playwright:install  # One time only

# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/poll-creation.spec.js

# Run in headed mode (see browser)
npx playwright test e2e/smoke.spec.js --headed
```

**Test files:**

- `e2e/smoke.spec.js` - Basic navigation
- `e2e/poll-creation.spec.js` - Create polls
- `e2e/poll-voting.spec.js` - Submit responses
- `e2e/analytics.spec.js` - Dashboard updates
- `e2e/results-publishing.spec.js` - Publish & view results

---

### 3. **Error Boundaries (Already Active ✅)**

No setup needed! Global error boundary is active in `src/main.jsx`.

Try it:

```jsx
// In any component, cause an error to see the error boundary
throw new Error("Test error");
// You'll see a beautiful error UI with recovery options
```

Use toast notifications:

```jsx
import { useToast } from "@/components/ui/Toast";

function MyComponent() {
  const { showError, showSuccess, ToastsComponent } = useToast();

  return (
    <>
      <button onClick={() => showSuccess("Done!")}>Success</button>
      <button onClick={() => showError("Oops!")}>Error</button>
      {ToastsComponent}
    </>
  );
}
```

---

### 4. **View API Documentation**

1. Start the server:

```bash
cd server && npm run dev
```

2. Open in browser:

```
http://localhost:5000/api-docs
```

**You'll see:**

- All API endpoints
- Request/response examples
- Try-it-out functionality
- Auth documentation

---

### 5. **Check Structured Logs**

**In development:**

```bash
# Colored logs in console (automatic)
npm --prefix server run dev
```

**In production:**

```bash
# Logs written to files
ls -la logs/
# View logs
tail -f logs/combined-*.log
```

---

### 6. **TypeScript Setup (Optional)**

**Start migrating incrementally:**

```bash
# Check for type errors
npm run type-check

# Watch for changes
npm run type-check:watch
```

**First file to migrate:**

- Rename `src/components/ui/Button.jsx` → `src/components/ui/Button.tsx`
- TypeScript will guide you through fixes

**Read the guide:**

```bash
cat TYPESCRIPT_MIGRATION_GUIDE.md
```

---

## 🎯 Common Tasks

### Before committing code:

```bash
npm run lint:fix
npm run format
npm run type-check
```

### Run all tests:

```bash
npm run test:all
```

### Check code quality:

```bash
npm run lint
npm run format:check
```

### Start development:

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm --prefix server run dev

# Terminal 3 (Optional) - Watch TypeScript
npm run type-check:watch
```

---

## 📚 Documentation

- **Improvements Overview**: `IMPROVEMENTS.md`
- **TypeScript Migration**: `TYPESCRIPT_MIGRATION_GUIDE.md`
- **API Documentation**: `http://localhost:5000/api-docs` (when server running)

---

## 💡 Pro Tips

1. **Auto-format on save in VS Code:**
   Add to `.vscode/settings.json`:

   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode"
   }
   ```

2. **Run lint fix automatically:**

   ```bash
   npm run lint:fix && npm run format
   ```

3. **Check everything before push:**
   ```bash
   npm run lint && npm run format:check && npm run type-check && npm run test:all
   ```

---

## ✅ Verification Checklist

- [ ] Ran `npm run lint:fix && npm run format`
- [ ] Ran `npm run test:all` (passed)
- [ ] Viewed API docs at `http://localhost:5000/api-docs`
- [ ] Tested error boundary (navigate in app)
- [ ] Checked E2E tests ran successfully

---

**Everything is ready to go! Start with the checklists above. 🎉**
