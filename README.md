# Craig-O-Secrets 🔐

Enterprise-grade secrets management for modern teams. Encrypted storage, team collaboration, audit logs, and API access.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VibeCaaS/craig-o-secrets)

## 🚀 Live Demo

**Website:** [https://craig-o-secrets.vercel.app](https://craig-o-secrets.vercel.app)

## ✨ Features

- **🔒 Encrypted Storage** - AES-256-GCM encryption for all secrets
- **👥 Team Collaboration** - Invite team members with role-based access
- **📝 Audit Logs** - Complete audit trail for compliance
- **🔌 RESTful API** - Integrate with your CI/CD pipelines
- **💻 CLI Tool** - Powerful command-line interface
- **📜 Version History** - Roll back to any previous version
- **🌍 Environment Management** - Organize by dev, staging, production
- **💳 Stripe Integration** - Simple $14/month subscription

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma 7
- **Authentication:** NextAuth.js v5
- **Payments:** Stripe
- **Styling:** Tailwind CSS 4
- **Deployment:** Vercel

## 🏃 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- PostgreSQL database (we use Neon)
- Stripe account

### Installation

```bash
# Clone the repository
git clone https://github.com/VibeCaaS/craig-o-secrets.git
cd craig-o-secrets

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Set up database
pnpm prisma migrate dev

# Start development server
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Encryption
ENCRYPTION_KEY="32-byte-encryption-key"

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_PRICE_ID="price_..."
```

## 📖 API Reference

### Authentication

All API requests require an API key in the Authorization header:

```bash
curl -H "Authorization: Bearer cos_your_api_key" \
  https://craig-o-secrets.vercel.app/api/v1/secrets
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/secrets` | List secrets |
| POST | `/api/v1/secrets` | Create secret |
| GET | `/api/v1/secrets/:id` | Get secret |
| PUT | `/api/v1/secrets/:id` | Update secret |
| DELETE | `/api/v1/secrets/:id` | Delete secret |
| GET | `/api/v1/projects` | List projects |
| POST | `/api/v1/projects` | Create project |
| GET | `/api/v1/teams` | List teams |
| POST | `/api/v1/teams` | Create team |
| GET | `/api/v1/api-keys` | List API keys |
| POST | `/api/v1/api-keys` | Create API key |
| GET | `/api/v1/audit-logs` | List audit logs |

### Create a Secret

```bash
curl -X POST \
  -H "Authorization: Bearer cos_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "DATABASE_URL",
    "value": "postgresql://...",
    "environmentId": "env_123"
  }' \
  https://craig-o-secrets.vercel.app/api/v1/secrets
```

## 💻 CLI Tool

### Installation

```bash
npm install -g craig-o-secrets-cli
```

### Usage

```bash
# Login with your API key
cos login

# List projects
cos projects

# Pull secrets to stdout (pipe to .env)
cos pull --project my-app --env production > .env

# Run command with injected secrets
cos run --project my-app --env production -- npm start

# Push secrets from .env file
cos push --project my-app --env development .env

# List secrets
cos secrets --env env_123
```

## 💰 Pricing

**$14/month** - Everything included:

- ✅ Unlimited secrets
- ✅ Unlimited projects
- ✅ Unlimited team members
- ✅ Full audit logs
- ✅ API access
- ✅ CLI tool
- ✅ Version history
- ✅ Priority support

## 🔒 Security

- **Encryption:** AES-256-GCM encryption at rest
- **Transport:** TLS 1.3 in transit
- **Access Control:** Role-based permissions
- **Audit Trail:** Complete logging of all access
- **API Keys:** Scoped, expiring keys

## 📁 Project Structure

```
craig-o-secrets/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Auth pages (login, register)
│   │   ├── (dashboard)/  # Dashboard pages
│   │   ├── api/          # API routes
│   │   └── ...
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   │   ├── auth.ts       # NextAuth configuration
│   │   ├── encryption.ts # Encryption utilities
│   │   ├── prisma.ts     # Prisma client
│   │   └── stripe.ts     # Stripe configuration
│   └── types/            # TypeScript types
├── prisma/
│   └── schema.prisma     # Database schema
├── cli/                  # CLI tool source
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- **Website:** [https://craig-o-secrets.vercel.app](https://craig-o-secrets.vercel.app)
- **Documentation:** [https://craig-o-secrets.vercel.app/docs](https://craig-o-secrets.vercel.app/docs)
- **GitHub:** [https://github.com/VibeCaaS/craig-o-secrets](https://github.com/VibeCaaS/craig-o-secrets)

---

Built with ❤️ by [VibeCaaS](https://vibecaas.com)
