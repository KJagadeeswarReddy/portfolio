# Architecture & Tech Stack

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Storage**: Local JSON files (in `data/` directory) for MVP simplicity.
- **Authentication**: NextAuth.js (Credentials Provider)
- **AI/LLM**: LangChain.js with Google Gemini (`gemini-2.5-flash-lite`)
- **State/UI**: React, Lucide React (Icons), Framer Motion (Animations)

## Routing Strategy

The application uses Middleware to handle subdomain-based routing.

- **Main Domain (`jagadeeswar.com` / `localhost`)**:
  - Routes to `/home`.
  - Displays the personal portfolio.
  - Contains the AI Chatbot.

- **Blog Subdomain (`daily.jagadeeswar.com`)**:
  - Routes to `/blog`.
  - Displays daily blog posts.
  - Optimized for SEO and prerendering.

- **Admin Subdomain (`admin.jagadeeswar.com`)**:
  - Routes to `/admin`.
  - Protected by NextAuth.js.
  - Allows management of blog posts.
  - Allows uploading/management of "Knowledge Base" files for the AI agent.

## Data Schema (JSON)

- **posts.json**: Stores blog posts.
- **documents.json**: Stores metadata for AI knowledge base files.
- **documents/**: Directory storing the actual text files for the AI agent.
