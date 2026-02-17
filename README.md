# CIS-453Project
## Run with Docker (Recommended)

### Prerequisites
- Docker Desktop (Windows / macOS)

### Steps
```bash
git clone <repo-url>
cd <repo>/server
cp .env.example .env        # Windows: copy .env.example .env
docker compose up -d --build
