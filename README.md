# Lera AI

Enterprise-grade legal directory automation platform that bridges internal legal work (iManage) with external directory submissions (Dun's 100, Chambers).

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + ShadcnUI
- **Backend**: Node.js + NestJS
- **Database**: MongoDB Atlas (with Field-Level Encryption)
- **AI**: Anthropic Claude API
- **Package Manager**: npm workspaces (monorepo)
- **Containerization**: Docker + Docker Compose

## Project Structure

```
/lera-ai
├── apps/
│   ├── web/          # React/Vite frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── ai-engine/    # Claude API wrapper
│   ├── imanage-sdk/  # iManage REST API wrapper
│   └── templates/    # Document generation
└── docker/           # Docker configuration
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose (optional)
- MongoDB Atlas account or local MongoDB

### Installation

1. Clone the repository and install dependencies:

```bash
cd lera-ai
npm install
```

2. Copy the environment template and configure:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development servers:

```bash
# Start both API and Web
npm run dev

# Or start individually
npm run dev:api
npm run dev:web
```

### Using Docker

For local development with Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

For production:

```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - Logout

### Matters
- `GET /api/matters` - List matters
- `POST /api/matters` - Create matter
- `GET /api/matters/:id` - Get matter
- `PUT /api/matters/:id` - Update matter
- `POST /api/matters/:id/approve` - Approve matter

### iManage Integration
- `POST /api/imanage/connect` - Initiate OAuth
- `GET /api/imanage/workspaces` - List workspaces
- `GET /api/imanage/documents` - Search documents

### AI Synthesis
- `POST /api/synthesis/extract` - Extract data from document
- `POST /api/synthesis/generate` - Generate description
- `GET /api/synthesis/score/:matterId` - Get submission score

### Templates
- `GET /api/templates` - List templates
- `POST /api/templates/:id/generate` - Generate export
- `GET /api/exports/:id/download` - Download export

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `ANTHROPIC_API_KEY` - Claude API key
- `IMANAGE_*` - iManage OAuth credentials

## Development

```bash
# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Build all packages
npm run build
```

## License

Proprietary - All rights reserved
