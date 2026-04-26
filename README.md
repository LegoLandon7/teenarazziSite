# Teenarazzi

[teenarazzi.com](teenarazzi.com)

Teenarazzi is a website for a teen community

---

## Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Backend

The backend runs as a Cloudflare Worker using Hono and Cloudflare D1 for database management.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) - Install globally with `npm install -g wrangler`
- [Cloudflare Account](https://dash.cloudflare.com)

### Setup

1. **Install dependencies:**
```bash
cd teenarazzi-api
npm install
```

2. **Configure Wrangler:**
Ensure you're authenticated with Cloudflare:
```bash
wrangler login
```

3. **Set up the database:**
The project uses Cloudflare D1 for the database. The `wrangler.jsonc` is already configured with the database bindings. To initialize or apply the schema:
```bash
wrangler d1 execute teenarazzi-database --file=schema.sql
```

4. **Development:**
Run the local development server:
```bash
npm run dev
```
The API will be available at `http://localhost:8787`

5. **Generate/Update Types:**
To synchronize TypeScript types with your Worker configuration:
```bash
npm run cf-typegen
```

6. **Deploy:**
Deploy to Cloudflare Workers:
```bash
npm run deploy
```

### Database Schema
The backend uses two main tables:
- `about_sections` - Stores community information content
- `about_updates` - Tracks pending updates with approval workflow

### Configuration
- **KV Namespace**: `STORE` binding for general key-value storage
- **Rate Limiting**: Configured at 30 requests per 60 seconds per endpoint
- **CORS**: Enabled for cross-origin requests


## Legal

This project is licensed under the MIT License.

By using this product or using our code you agree and have read the following:

- [LICENSE](LICENSE)
