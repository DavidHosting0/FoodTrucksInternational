# Personal Expense Manager

Next.js-Webapp zur Verwaltung und Optimierung persönlicher Finanzen – mit eigener **Postgres**-Datenbank, Auth.js und PWA fürs Handy.

## Features

- Authentifizierung (E-Mail/Passwort)
- Ausgaben erfassen / bearbeiten / filtern (Quick-Add)
- Dashboard mit KPIs, Charts, Budget- und Abo-Übersicht
- Kategorien, Monatsbudgets, Abonnements
- Beleg-Upload (Kamera) und Verknüpfung mit Transaktionen
- Cost-Optimization-Heuristiken
- CSV- und PDF-Export
- Mobile Bottom-Nav + installierbare PWA

## Voraussetzungen

- Node.js 20+
- Postgres auf deinem Server
- HTTPS in Produktion (für PWA „Zum Home-Bildschirm“)

## Setup

1. Dependencies:

```bash
npm install
```

2. Schema in Postgres ausführen:

Datei: [`drizzle/0000_init.sql`](drizzle/0000_init.sql)  
Im `psql`-Client oder einem Admin-Tool ausführen (Datenbank vorher anlegen).

Alternativ mit Drizzle Kit (wenn `DATABASE_URL` gesetzt):

```bash
npm run db:push
```

3. Umgebungsvariablen:

```bash
cp .env.local.example .env.local
```

Eintragen:

- `DATABASE_URL=postgresql://USER:PASS@HOST:5432/finance`
- `AUTH_SECRET=` (z. B. `openssl rand -base64 32`)
- `NEXT_PUBLIC_DEMO_MODE=false`
- optional `UPLOAD_DIR=uploads`, `AUTH_URL=https://deine-domain`

4. Dev-Server:

```bash
npm run dev
```

App: [http://localhost:3000](http://localhost:3000) – Account über **Registrieren** anlegen (legt Default-Kategorien an).

## Produktion auf dem Server

```bash
npm run build
npm run start
```

Empfohlen:

- Process-Manager: `systemd` oder PM2
- Reverse Proxy: Caddy/Nginx mit HTTPS
- Port z. B. `3000` intern, Domain öffentlich
- Regelmäßige Backups: `pg_dump`

Beispiel PM2:

```bash
pm2 start npm --name finance -- start
```

### Handy nutzen

1. App unter HTTPS öffnen  
2. iOS Safari: Teilen → **Zum Home-Bildschirm**  
3. Android Chrome: Menü → **App installieren**

Im gleichen WLAN ohne Domain: `http://SERVER-IP:3000` (PWA-Install eingeschränkt ohne HTTPS).

## Demo-Modus

`NEXT_PUBLIC_DEMO_MODE=true` – kein Login, Seed-Transaktionen im RAM.  
Budgets, Abos, Belege und Persistenz brauchen Postgres (`DEMO_MODE=false`).

## Stack

- Next.js (App Router) + TypeScript
- Auth.js (Credentials) + bcrypt
- Drizzle ORM + Postgres
- Tailwind CSS + shadcn/ui
- Recharts, PDFKit
