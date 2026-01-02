# Planted Admin Dashboard

A modern, beautiful admin dashboard for managing the Planted children's Bible app. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🌟 Features

- **Modern UI**: Dark mode, glassmorphism, smooth animations
- **Authentication**: Admin-only access with JWT authentication
- **Dashboard**: Overview with stats, charts, and recent activity
- **Content Management**: 
  - Users management
  - Children profiles
  - Devotionals
  - Memory Verses
  - Quizzes
  - Stories
  - Challenges

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- The Planted backend running on `http://localhost:5000`

### Installation

1. Navigate to the admin dashboard directory:
   ```bash
   cd planted_admin_dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   # Create .env.local file with:
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Access

To access the admin dashboard, you'll need an account with `role: "ADMIN"`. You can:

1. Create an admin user in the database directly, or
2. Update an existing user's role to `ADMIN` in MongoDB

Example MongoDB query to make a user an admin:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

## 📁 Project Structure

```
planted_admin_dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── users/          # User management
│   │   │   ├── devotionals/    # Devotional management
│   │   │   ├── children/       # Children profiles
│   │   │   ├── memory-verses/  # Memory verses
│   │   │   ├── quizzes/        # Quiz management
│   │   │   ├── stories/        # Story management
│   │   │   ├── challenges/     # Challenge management
│   │   │   └── settings/       # App settings
│   │   ├── login/              # Login page
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── layout/             # Sidebar, Header
│   │   └── ui/                 # Reusable UI components
│   └── lib/
│       ├── api.ts              # API client
│       ├── auth-context.tsx    # Authentication context
│       └── utils.ts            # Utility functions
├── tailwind.config.ts          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── package.json
```

## 🎨 Design System

The dashboard uses a custom design system with:

- **Colors**: Nature-inspired palette (greens for primary, amber for accents)
- **Typography**: Inter font family
- **Components**: Cards, buttons, inputs, badges, alerts
- **Dark Mode**: Enabled by default

## 🔗 Backend Integration

The admin dashboard connects to the existing Planted backend API. Make sure:

1. The backend is running
2. CORS is configured to allow requests from `localhost:3000`
3. Admin routes are available (the backend already has `requireAdmin` middleware)

### API Endpoints Used

| Endpoint | Description |
|----------|-------------|
| `POST /auth/login` | Admin login |
| `GET /auth/users` | List all users |
| `GET /devotionals` | List devotionals |
| `POST /devotionals` | Create devotional |
| `GET /memory-verses` | List memory verses |
| `GET /quizzes` | List quizzes |
| `GET /stories` | List stories |
| `GET /challenges` | List challenges |

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new page in `src/app/dashboard/[feature]/page.tsx`
2. Add navigation link in `src/components/layout/Sidebar.tsx`
3. Add API methods in `src/lib/api.ts`
4. Create any needed UI components in `src/components/ui/`

## 📝 Todo

- [ ] Complete CRUD operations for all content types
- [ ] Add forms for creating/editing content
- [ ] Implement file upload for images/audio
- [ ] Add real-time notifications
- [ ] Implement search functionality
- [ ] Add data export features
- [ ] Add more detailed analytics

## 🤝 Contributing

This is part of the Planted project. Follow the existing code style and conventions.

## 📄 License

Private - Planted Project
