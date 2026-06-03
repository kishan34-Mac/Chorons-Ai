 # ⏳ Chorons-Ai: Advanced Historical Web Analysis & AI Insights

Chorons-Ai is an advanced web application designed for comprehensive historical website analysis, offering AI-driven insights, interactive comparison tools, and intuitive timeline visualizations. Leveraging the power of AI and historical web archives, Chorons-Ai allows users to explore, compare, and understand the evolution of websites over time, making "time travel" through the internet's past both powerful and insightful.

This project combines robust backend services with a modern, interactive frontend to deliver a seamless user experience for anyone interested in web history, competitive analysis, or digital forensics.

## ✨ Features

Chorons-Ai provides a rich set of features, carefully inferred from its public repository structure, designed to give users unparalleled control and insight into the historical web:

*   **AI-Powered Insights**: An `AIInsightPanel` suggests that the application provides intelligent analysis and summaries of historical website changes, possibly identifying trends, key shifts, or anomalies.
*   **Cinematic Timelines**: Visualize website evolution through an interactive and `CinematicTimeline`, allowing users to navigate through various snapshots.
*   **Side-by-Side Comparison**: Utilize the `CompareSlider` and `SnapshotViewer` to visually compare different versions of a website, highlighting changes with precision.
*   **Historical Data Access**: Integration with historical web archives (implied by `src/lib/wayback.ts` and API routes like `api/public/wayback`) to fetch and display past website states.
*   **Intuitive Playback Controls**: Navigate through historical snapshots with ease using dedicated `PlaybackControls` and a `TimeTravelLoader`.
*   **User Management & Authentication**: Secure user accounts, favorites, search history, and personalized settings (`user.model.ts`, `auth.middleware.ts`, `favorite.model.ts`).
*   **Search & Discovery**: Robust search functionality to find websites and their historical data.
*   **Reporting & Analytics**: Generate reports (`report.model.ts`) and view usage analytics (`analytics.model.ts`, `audit.model.ts`) for both users and administrators.
*   **Dynamic UI Components**: A rich set of modern, accessible UI components (buttons, sliders, dialogs, charts, etc.) to ensure a smooth and responsive experience.
*   **Admin Dashboards**: Dedicated API routes for administrative tasks like managing users, auditing logs, and viewing search statistics.

## 🛠️ Tech Stack

Chorons-Ai is built with a modern and efficient technology stack, focusing on performance, scalability, and developer experience:

*   **Runtime**: [Bun](https://bun.sh/) – An incredibly fast JavaScript runtime, bundler, and package manager.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) – Strongly typed JavaScript for enhanced code quality and maintainability.
*   **Framework**: Likely a React-based framework (given `.tsx` files) for the frontend, combined with a custom backend server.
*   **UI Library**: A comprehensive set of UI components, structurally similar to [Shadcn UI](https://ui.shadcn.com/) (inferred from `src/components/ui/` directory with components like `button.tsx`, `dialog.tsx`, `slider.tsx`, `chart.tsx`).
*   **Routing**: [TanStack Router](https://tanstack.com/router) (inferred from `src/router.tsx`, `src/routes/` structure, and `src/routeTree.gen.ts`) for a type-safe and powerful routing experience.
*   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM (inferred from `src/config/mongoose.ts` and various `*.model.ts` files) for flexible data storage.
*   **Bundler/Tooling**: [Vite](https://vitejs.dev/) for a lightning-fast development experience and optimized builds.
*   **Styling**: Standard CSS with utilities.
*   **Linting & Formatting**: [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for consistent code quality.
*   **Deployment Target**: Potentially [Cloudflare Workers/Pages](https://workers.cloudflare.com/) (inferred from `wrangler.jsonc`) for serverless deployment and global scale.

## 📂 Project Structure

The repository is organized into a clear and maintainable structure:

```
.
├── src/
│   ├── components/            # Reusable React components, including specific features and general UI.
│   │   ├── ui/                # General-purpose UI components (e.g., button, dialog, slider).
│   ├── config/                # Application configuration files (e.g., database connection).
│   ├── controllers/           # API request handlers.
│   ├── hooks/                 # Custom React hooks for shared logic.
│   ├── lib/                   # Utility functions, external integrations (e.g., Wayback Machine).
│   ├── middleware/            # Express/server middleware for authentication, error handling, security.
│   ├── models/                # Mongoose schemas and models for database entities.
│   ├── repositories/          # Data access layer for interacting with models.
│   ├── routes/                # API routes and frontend page routes (using TanStack Router).
│   ├── services/              # Business logic and service layer (e.g., AI, auth, analytics).
│   ├── utils/                 # General utility functions.
│   ├── server.ts              # Main server setup and entry point.
│   └── start.ts               # Application startup script.
├── bun.lock                   # Bun's dependency lock file.
├── bunfig.toml                # Bun configuration.
├── eslint.config.js           # ESLint configuration.
├── package.json               # Project dependencies and scripts.
├── prettierrc                 # Prettier configuration.
├── tsconfig.json              # TypeScript compiler configuration.
├── vite.config.ts             # Vite build configuration.
└── wrangler.jsonc             # Cloudflare Workers/Pages configuration.
```

## 🚀 Installation

To get Chorons-Ai up and running on your local machine, follow these steps:

### Prerequisites

*   [Bun](https://bun.sh/docs/installation) (recommended) or [Node.js](https://nodejs.org/) (LTS version)
*   [MongoDB](https://docs.mongodb.com/manual/installation/) instance (local or hosted)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kishan34-Mac/Chorons-Ai.git
    cd Chorons-Ai
    ```

2.  **Install dependencies:**
    Using Bun:
    ```bash
    bun install
    ```
    Or using npm/yarn (if Bun is not preferred):
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project. A `.env.example` might be provided, but based on the structure, you'll likely need:

    ```env
    PORT=3000
    MONGO_URI="mongodb://localhost:27017/choronsai"
    JWT_SECRET="supersecretkey" # Replace with a strong, random key
    # If using external AI services:
    AI_API_KEY="your_ai_service_api_key"
    # If using Wayback Machine API directly:
    WAYBACK_API_KEY="your_wayback_machine_api_key" # If needed for rate limits/auth
    ```
    Adjust the `MONGO_URI` to point to your MongoDB instance.

## 🏃 Usage

Once installed and configured, you can start the development server:

```bash
bun dev
```

This command will typically start both the frontend development server (accessible via your browser, usually `http://localhost:3000`) and the backend API server.

You can then access the application in your web browser and interact with its features for historical web analysis.

## 📝 Notes

*   The project is in its early stages (0 stars, 0 forks), indicating it's an active development or foundational project.
*   Many details regarding specific integrations (like the exact AI service or Wayback Machine API usage) are inferred from the file structure and might require further configuration or API keys not explicitly listed here.
*   Contributions are welcome! Please refer to future `CONTRIBUTING.md` for guidelines.
