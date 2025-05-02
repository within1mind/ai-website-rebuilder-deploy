# AI Website Rebuilder

This project is a Next.js application designed to take an outdated website URL, scrape its content, and use an AI model (currently configured for OpenAI) to generate a proposal for a modernized, SEO-optimized version of the site.

Built with Next.js, TypeScript, Tailwind CSS, and OpenAI.

## Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- npm (or pnpm/yarn)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/within1mind/ai-website-rebuilder.git
    cd ai-website-rebuilder
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the project root and add the following variables:

```plaintext
# Required for NextAuth.js - generate a secure secret
NEXTAUTH_SECRET=your_secure_random_string_here 

# Required for AI integration (OpenAI)
AI_PROVIDER_API_KEY=your_openai_api_key_here
# Or use OPENAI_API_KEY=your_openai_api_key_here
```

- You can generate a `NEXTAUTH_SECRET` using `openssl rand -base64 32` in your terminal.
- Obtain an API key from your chosen AI provider (e.g., OpenAI).

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How it Works

1.  Enter a valid URL (including `http://` or `https://`) into the input field.
2.  Click "Rebuild Site".
3.  The application sends the URL to the `/api/rebuild` backend endpoint.
4.  The backend scrapes the HTML content of the provided URL.
5.  The scraped content is sent to the configured AI model (OpenAI GPT-3.5-turbo by default) with a prompt asking for a modernized HTML structure.
6.  The AI's response (the proposed HTML) is displayed on the page.

## API Endpoint

- **`POST /api/rebuild`**
  - **Request Body:** `{ "url": "string" }`
  - **Response (Success):** `{ "message": "string", "rebuiltContent": { "html": "string", "suggestions": ["string"] } }`
  - **Response (Error):** `{ "error": "string" }`

## Deployment on Vercel

This application is ready to be deployed on Vercel.

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  **Configure Environment Variables:** Add `NEXTAUTH_SECRET` and `AI_PROVIDER_API_KEY` (or `OPENAI_API_KEY`) in the Vercel project settings.
4.  Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More about Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

