# Kairos - Turn Brainfog into Action

Kairos is an intelligent task planning application that helps users break down their daily goals into manageable tasks and subtasks. Leveraging AI (via GPT-4o-mini) alongside real-time timers and voice input, Kairos provides a modern, responsive productivity experience.

## Overview

Kairos uses a FastAPI backend to receive user prompts, generate actionable tasks using GPT-4o, and store data in Supabase. The frontend is built with Next.js, TypeScript, and Tailwind CSS, and includes authentication via Supabase. With features like voice input, animated transitions, and integrated timers, Kairos is designed to transform cluttered ideas into clear, actionable plans.

## Features

- **Automated Task Planning:** Use GPT-4o to generate tasks and subtasks based on natural language input.
- **Subtask Generation:** Break tasks into granular subtasks with support from AI.
- **Voice Input:** Leverage speech recognition for hands-free task entry.
- **Real-Time Task Timers:** Track your progress with a built-in timer for each task.
- **User Authentication:** Secure user sign-in/sign-out and session management with Supabase.
- **Responsive UI:** Enjoy smooth animations and responsive layouts powered by Next.js, Tailwind CSS, and Framer Motion.

## Tech Stack

### Backend

- **Python & FastAPI:** A modern, high-performance web framework for building APIs.
- **Uvicorn:** An ASGI server for running the FastAPI application.
- **Supabase Client:** Manages database interactions and user-related operations.
- **GPT-4o Service:** Integrates AI-powered task generation via a dedicated service module.
- **Environment Management:** Uses dotenv for managing environment variables.

### Frontend

- **Next.js & React:** A React-based framework for building modern web applications.
- **TypeScript:** Ensures type safety and easier maintainability.
- **Tailwind CSS:** A utility-first CSS framework for designing custom UI components.
- **Framer Motion:** Adds smooth animations for enhanced user experience.
- **Supabase Auth Helpers:** Simplifies authentication and real-time data handling.

## Installation

### Prerequisites

- Node.js and npm/yarn
- Python 3.8+
- Git

### Backend Setup

1. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```

2. **Create & Activate a Virtual Environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. **Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**

   Create a `.env` file in the `backend` directory and add:
   ```
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_KEY=your_supabase_key_here
   ```

5. **Run the Backend:**
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

6. **Navigate to the Frontend Directory:**
   ```bash
   cd frontend
   ```

7. **Install Node Dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

8. **Environment Configuration:**

   The frontend automatically determines the API base URL based on your hostname (see `frontend/app/config.ts`). If needed, additional environment variables can be set via a `.env` file.

9. **Run the Frontend:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

10. **Open Your Browser:**

   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Plan Your Day:** Enter your daily goals in the "Plan Your Day" interface.
2. **Task Generation:** Click the "Plan my day" button (or use Cmd/Ctrl + Enter) to generate tailored tasks.
3. **Manage Tasks:** Edit tasks, mark them as complete, or generate subtasks powered by AI.
4. **Timing Your Tasks:** Use the integrated timers to track task durations and progress.
5. **Voice Input:** Press the voice input button to use speech recognition for a hands-free experience.

## Deployment

- **Backend:** Deploy on platforms that support Python (e.g., Heroku, DigitalOcean, AWS). Ensure environment variables are set on your hosting platform.
- **Frontend:** Deploy the Next.js application on Vercel or your preferred hosting service.

## Contributing

Contributions are always welcome! To contribute:

6. Fork the repository.
7. Create a new branch for your feature or bug fix.
8. Submit a pull request with a clear description of your changes.