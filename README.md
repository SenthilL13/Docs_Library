# SenaDocs — Academic PDF & Study Material Library

> A modern, responsive academic PDF library for discovering, previewing and reading curated study materials, textbooks, and lecture notes.

🌐 **Live Demo:** [https://senadocs-library.netlify.app](https://senadocs-library.netlify.app)

---

## ✨ Features

- 📚 **Public Library** — Browse and search curated academic PDFs
- 📖 **Built-in PDF Reader** — Page navigation, zoom, fullscreen, touch swipe
- 🔐 **Admin Dashboard** — Upload, edit, publish, and manage documents
- 🗂️ **Category System** — Organize by IT disciplines and technology domains
- 🔍 **Real-time Search** — Filter by title, subject, exam, or description
- 🖼️ **Preview Thumbnails** — Auto-generated first-page previews
- 🌙 **Dark Mode** — Full light/dark theme support
- 📱 **Fully Responsive** — Mobile, tablet, and desktop optimized

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL + Storage + Auth) |
| PDF Engine | PDF.js |
| Deployment | Netlify |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** — [Download](https://nodejs.org)
- **Supabase** account — [Sign up free](https://supabase.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/SenthilL13/Docs_Library.git
cd Docs_Library
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> 💡 Find these in your Supabase project → **Settings → API**

---

### 4. Set Up the Database

Open your **Supabase SQL Editor** and run:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'child' CHECK (role IN ('admin', 'child')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  preview_path TEXT,
  description TEXT,
  subject TEXT,
  exam TEXT,
  tags TEXT[],
  category_id UUID REFERENCES categories(id),
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  page_count INTEGER,
  file_size BIGINT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_published ON documents(published_at DESC);
```

Also create a **Storage bucket** named `pdfs` in Supabase → **Storage** (set to public).

---

## 🚀 Run Locally

```bash
npm run dev
```

Open → [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Preview the production build locally:

```bash
npm run preview
```

---

## ☁️ Deploy to Netlify

### Option A — Netlify Drop (Easiest, no account needed)

1. Run `npm run build`
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag and drop the `dist/` folder onto the page
4. ✅ Live in seconds!

---

### Option B — Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build and deploy to production
npm run build
netlify deploy --prod --dir=dist
```

---

### Option C — Connect GitHub (Auto Deploy on every push)

1. Push your code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
3. Select your `Docs_Library` repository
4. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add environment variables under **Site settings → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy** — every push to `main` will auto-deploy 🎉

---

## 🔑 Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123` |
| User | `researcher_alex` | `User@123` |

> ⚠️ Change these credentials before going to production.

---

## 📁 Project Structure

```
Docs_Library/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/           # Admin dashboard components
│   │   │   ├── AdminOverview.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── BulkImportModal.tsx
│   │   │   ├── CategoryManagement.tsx
│   │   │   ├── DocumentTable.tsx
│   │   │   ├── EditDocumentModal.tsx
│   │   │   ├── UploadDocumentModal.tsx
│   │   │   └── UserManagementModal.tsx
│   │   ├── layout/          # Navbar, Footer
│   │   ├── library/         # Document cards, grid, filters, search
│   │   ├── reader/          # PDF viewer (PDF.js)
│   │   └── ui/              # Shared UI (dialogs, error boundary)
│   ├── pages/               # Route-level pages
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   └── LibraryPage.tsx
│   ├── services/            # Supabase API calls
│   ├── lib/                 # PDF.js + Supabase client setup
│   ├── types/               # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example             # Environment variable template
├── .gitignore
├── netlify.toml             # Netlify build + redirect config
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🌐 Links

| | URL |
|--|-----|
| 🌍 Live Demo | [https://senadocs-library.netlify.app](https://senadocs-library.netlify.app) |
| ⚙️ Netlify Admin | [https://app.netlify.com/projects/senadocs-library](https://app.netlify.com/projects/senadocs-library) |
| 📦 GitHub Repo | [https://github.com/SenthilL13/Docs_Library](https://github.com/SenthilL13/Docs_Library) |

---

## 🤝 Contributing

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
# Open a Pull Request on GitHub
```

---

## 📄 License

MIT License — free to use and modify.

---

Built with ❤️ for the academic community

## Features

- **Public Library**: Browse and search through a curated collection of technical study materials
- **PDF Reader**: Built-in PDF viewer with page navigation, zoom controls, and fullscreen mode
- **Admin Dashboard**: Manage documents, categories, and users with role-based access control
- **Document Management**: Upload, edit, publish, and organize PDF documents
- **Category System**: Organize materials by IT disciplines and technology domains
- **Responsive Design**: Optimized for mobile, tablet, laptop, and desktop devices
- **Real-time Search**: Filter documents by title, subject, exam, or description
- **Preview Thumbnails**: Auto-generated first-page previews for all PDFs

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **PDF Rendering**: PDF.js

## Prerequisites

- Node.js 18+ and npm
- A Supabase project with:
  - PostgreSQL database
  - Storage bucket for PDF files
  - Authentication enabled

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Test Drive
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Setup

Run the SQL setup script in your Supabase SQL editor to create the required tables:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'child' CHECK (role IN ('admin', 'child')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  preview_path TEXT,
  description TEXT,
  subject TEXT,
  exam TEXT,
  tags TEXT[],
  category_id UUID REFERENCES categories(id),
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  page_count INTEGER,
  file_size BIGINT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_published ON documents(published_at DESC);
```

## Running the Project

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── admin/           # Admin dashboard components
│   │   ├── AdminOverview.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── CategoryManagement.tsx
│   │   ├── DocumentTable.tsx
│   │   ├── UploadDocumentModal.tsx
│   │   └── EditDocumentModal.tsx
│   ├── layout/          # Layout components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── library/         # Public library components
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentGrid.tsx
│   │   ├── FilterChips.tsx
│   │   └── SearchBar.tsx
│   ├── reader/          # PDF reader component
│   │   └── PdfReader.tsx
│   └── ui/              # Reusable UI components
│       └── ConfirmDialog.tsx
├── pages/               # Page components
│   ├── AdminDashboardPage.tsx
│   ├── AdminLoginPage.tsx
│   └── LibraryPage.tsx
├── services/            # API services
│   ├── authService.ts
│   ├── categoriesService.ts
│   ├── documentsService.ts
│   └── storageService.ts
├── lib/                 # Utility libraries
│   ├── pdf.ts
│   └── supabaseClient.ts
├── types/               # TypeScript types
│   └── database.ts
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Usage

### Public Library Access

1. Navigate to the home page to browse the public library
2. Use the search bar to find specific materials
3. Filter by category using the filter chips
4. Click on any document card to open the PDF reader
5. Use the PDF reader controls to navigate pages, zoom, or download

### Admin Access

1. Click "Portal Sign In" in the navigation
2. Enter your admin credentials
3. Access the dashboard to:
   - Upload new PDF documents
   - Edit document metadata
   - Manage categories
   - Manage child users (admin only)
   - Publish or unpublish documents

### Default Test Accounts

After setting up the database, create test users:

**Admin Account:**
- Username: `admin`
- Password: `Admin@123`

**Child User Account:**
- Username: `researcher_alex`
- Password: `User@123`

> Note: Passwords should be hashed using bcrypt in production. Use the provided authService for authentication.

## Key Features in Detail

### PDF Reader
- Page navigation with keyboard shortcuts (arrow keys, Page Up/Down)
- Zoom controls with fit-to-width and fit-to-page options
- Fullscreen mode for distraction-free reading
- Touch swipe gestures for mobile devices
- Document sidebar with metadata

### Document Management
- Automatic thumbnail generation on upload
- Page count detection
- File size tracking
- Status management (draft/published)
- Category and subject tagging

### Responsive Design
- Mobile-first approach with breakpoints at 475px, 640px, 768px, 1024px, 1280px
- Touch-friendly interface with minimum 44px tap targets
- Optimized font scaling across devices
- Safe area support for notched devices

## Design System

The application uses a custom design system with:

- **Colors**: Academic blue palette (#0c86eb) with slate neutrals
- **Typography**: Inter for body text, Merriweather for headings
- **Spacing**: Consistent spacing scale following Tailwind defaults
- **Borders**: Intentional border-radius usage (sharp, slight, mild)
- **Shadows**: Minimal shadows for depth without generic soft shadows

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue in the repository.

---

Built with ❤️ for the academic community
