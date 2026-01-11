# SprintSync - Cloud Synchronized Agile Capacity Intelligence

Modern React 19 app for managing sprint capacity, tracking team absences, and analyzing sprint risks using AI.

## 🚀 Latest Tech Stack (2025)

| Technology | Purpose | Version |
|------------|---------|---------|
| **React 19** | UI Framework | `^19.0.0` |
| **TypeScript** | Type Safety | `^5.9.3` |
| **Vite** | Build Tool | `^5.0.8` |
| **TanStack Query** | Server State Management | `^5.0.0` |
| **Zustand** | Client State Management | `^5.0.9` |
| **Firebase** | Backend & Auth | `^10.7.0` |
| **Tailwind CSS** | Styling | `^3.4.1` |
| **Lucide Icons** | Icon Library | `^0.294.0` |
| **Gemini AI** | AI Integration | Latest |
| **ESLint + Prettier** | Code Quality | Latest |

## ✨ Features

✅ **Full TypeScript** - Type-safe codebase
✅ **React Query** - Automatic caching, refetching, and state management
✅ **Zustand Store** - No prop drilling, centralized state
✅ **Modern Architecture** - Separation of concerns, scalable
✅ **Real-time Sync** - Firebase cloud synchronization
✅ **AI-Powered** - Gemini AI integration for insights
✅ **Error Handling** - Comprehensive error management
✅ **Code Quality** - ESLint + Prettier configured

## 📁 Project Structure

```
src/
├── config/              # Configuration
│   └── firebase.ts      # Firebase setup
├── services/            # External services
│   ├── firestoreService.ts
│   ├── aiService.ts
│   └── index.ts
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useFirebaseData.ts (React Query)
│   ├── useLeaveImpacts.ts
│   └── index.ts
├── store/               # Global state (Zustand)
│   └── appStore.ts
├── types/               # TypeScript types
│   └── index.ts
├── components/          # React components
│   ├── AdminView.tsx
│   ├── UserView.tsx
│   ├── CalendarView.tsx
│   ├── ChatBot.tsx
│   ├── AIResponseModal.tsx
│   ├── sections/
│   └── index.ts
├── utils/               # Utility functions
│   └── dateUtils.ts
├── App.tsx              # Main component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project
- Gemini API key

### Installation

```bash
cd /Users/aakashgilotra/Documents/SprintSyncApp
npm install
```

### Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
```

### Run Development Server

```bash
npm run dev
```

App opens at `http://localhost:5173`

## 📝 Available Scripts

```bash
npm run dev          # Start dev server with HMR
npm run build        # Build for production (tsc + vite)
npm run preview      # Preview production build
npm run lint         # ESLint with TypeScript support
npm run format       # Prettier format
npm run type-check   # TypeScript type checking
```

## 🏗️ Architecture Patterns

### Modern State Management

**Zustand** for UI state (no prop drilling):
```typescript
const { activeTab, setActiveTab } = useAppStore();
```

**React Query** for server state:
```typescript
const { people, sprints, addPerson, deleteDoc } = useFirebaseData();
```

### Custom Hooks

- `useAuth()` - Firebase authentication
- `useFirebaseData()` - React Query + Firestore integration
- `useLeaveImpacts()` - Memoized calculations

### Service Layer

Separation of concerns:
- `firestoreService.ts` - Database CRUD
- `aiService.ts` - Gemini AI integration

### Type Safety

Complete TypeScript coverage:
```typescript
interface Sprint {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string;
  devCountAtCreation?: number;
}
```

## 🔄 Data Flow

```
Components
    ↓
Zustand Store (Client State)
    ↓
React Query (Caching Layer)
    ↓
Firestore Service
    ↓
Firebase Cloud
```

## 🎨 UI Components

All components are TypeScript React.FC:
- Full prop typing
- Generic component support
- Proper event handling

## 🚀 Performance Optimizations

- **Query Caching** - 5-minute stale time
- **Automatic Cache Invalidation** - Mutations update cache
- **Memoization** - `useMemo` for expensive calculations
- **Code Splitting** - Vite handles chunking
- **Tree Shaking** - Remove unused code

## 🔐 Type Safety Features

- Strict TypeScript mode enabled
- No implicit `any` types
- Proper error handling
- Type inference where possible

## 📚 Key Improvements Over v1

| Feature | Before | After |
|---------|--------|-------|
| **Language** | JavaScript (.jsx) | TypeScript (.tsx) |
| **State** | Props Drilling | Zustand |
| **Data Fetching** | useEffect | React Query |
| **Caching** | Manual | Automatic |
| **Type Safety** | None | Full |
| **Linting** | Basic | ESLint + TypeScript |
| **Code Format** | None | Prettier |

## 🔄 React Query Features

### Automatic Cache Management
```typescript
queryClient.invalidateQueries({ queryKey: ['people'] });
```

### Built-in Loading & Error States
```typescript
const { isLoading, isError } = useFirebaseData();
```

### Optimistic Updates
```typescript
const addPersonMutation = useMutation({
  mutationFn: addPersonDoc,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['people'] }),
});
```

## 🌟 Next Steps

1. **Convert remaining components** to TypeScript (AdminView, UserView, CalendarView)
2. **Add component tests** with Vitest
3. **Setup Storybook** for component documentation
4. **Add E2E tests** with Playwright
5. **Setup CI/CD** with GitHub Actions

## 📖 Resources

- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Vite Guide](https://vitejs.dev)

## 📄 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

