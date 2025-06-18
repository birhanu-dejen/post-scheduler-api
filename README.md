# Post Scheduler API

A Node.js/Express backend to schedule, publish, and manage posts at specific times.

## Features

- User registration/login with JWT
- Create, update, delete, and schedule posts
- Automatic publishing (with job scheduler)
- View published posts
- Rate limiting & error handling
- Admin endpoints
- Swagger API docs

## Setup

1. Clone and install dependencies:

   ```bash
   git clone <repo-url>
   cd post-scheduler
   npm install
   ```

2. Create a `.env` file from `.env.example` and fill in your values.

3. Start MongoDB locally or use a cloud provider.

4. Run the app in dev mode:

   ```bash
   npm run dev
   ```

5. Build and run for production:

   ```bash
   npm run build
   npm start
   ```

6. Visit API docs at `/swagger` (when set up).

## API Documentation

See [`swagger.yaml`](./swagger.yaml) for the full OpenAPI spec.

## License

MIT
