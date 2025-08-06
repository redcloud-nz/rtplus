# Project Overview

This project is a web application built using Next.js, TypeScript, and React. It follows a structured style guide to ensure consistency and maintainability across the codebase.

## Folder Structure

- The project is organized into several key directories:
- `src/app/`: Contains the main application routes and pages.
- `src/app/app/`: Contains the pages that require authentication and which together form the application.
- `src/cli/`: Contains the experimental CLI functionality.
- `src/components/`: Houses reusable components, including app-specific layouts and general UI components.
- `src/hooks`: Contains custom React hooks for shared functionality.
- `src/lib/`: Contains utility functions and libraries used across the application.
- `src/lib/d4h-api/`: Contains the D4H API client and related utilities.
- `src/lib/schema/`: Contains schema definitions and validation logic.
- `src/server/`: Contains server-side logic such as server-side utilities.
- `src/trpc/`: Contains the tRPC router and API definitions.

## Specific Files of Interest

  - `src/paths.ts`: Defines route paths used throughout the application.