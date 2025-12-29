# Advanced Finance

**Autonomous On-Chain Payments powered by MetaMask Advanced Permissions**

A powerful on-chain payment service that lets users and merchants automate payments, subscriptions, installments, DCA, recurring swaps, and split payouts using a single secure MetaMask permission.

## Features

- 🔐 **Privy Wallet Integration** - Seamless wallet connection with embedded wallets
- 💳 **Payment Requests** - Create one-time, recurring, and split payments
- 🤖 **Finance Automation** - DCA, recurring swaps, subscriptions, and installments
- 📊 **Dashboard** - Monitor payments, permissions, and activity in real-time
- 📈 **Analytics** - Track payment performance and trends
- ⚡ **MetaMask Advanced Permissions** - One-time approval for continuous execution
- 🎨 **Modern UI** - Dark theme with smooth animations and mobile-responsive design

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Wallet Integration**: Privy
- **Animations**: Custom CSS animations + Tailwind
- **Typography**: Inter (body), Space Grotesk (headings)

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

The Privy App ID is already configured in the code:
- App ID: `cmj9oonfg03uvji0dxwertwtm`

For production, you may want to add additional environment variables.

## Project Structure

```
app/
├── page.tsx                 # Home page
├── create-payment/          # Payment creation flow
├── finance/                 # Finance automation hub
├── dashboard/               # User dashboard
├── analytics/               # Analytics page
├── settings/                # Settings page
└── layout.tsx               # Root layout with Privy provider

components/
├── home/                    # Home page components
├── create-payment/          # Payment creation steps
├── finance/                 # Finance modules
├── dashboard/               # Dashboard widgets
├── analytics/               # Analytics charts
├── settings/                # Settings forms
├── layout/                  # Header & Footer
├── providers/               # Privy provider
└── ui/                      # Reusable UI components
```

## Key Pages

### Home (`/`)
- Hero section with gradient animations
- Two main action cards: Payments and Finance
- Features section explaining Advanced Permissions

### Create Payment (`/create-payment`)
- Multi-step flow for creating payment requests
- Payment type selection
- Payment details form
- Permission preview
- Payment link generation

### Finance (`/finance`)
- 7 automation modules:
  - Recurring Payments
  - Subscriptions
  - Installments
  - DCA (Dollar Cost Averaging)
  - Recurring Swaps
  - Scheduled Payments
  - Split Payouts

### Dashboard (`/dashboard`)
- Overview widgets (active payments, automations, total spent)
- Real-time activity feed
- Active permissions panel with revoke options

### Analytics (`/analytics`)
- Payment volume metrics
- Success rate tracking
- Failed payment monitoring
- Monthly payment activity chart

### Settings (`/settings`)
- Default token selection
- Notification preferences
- Auto-retry rules
- Emergency permission revoke

## Design System

### Colors
- **Primary**: Indigo (oklch(0.65 0.22 265))
- **Accent**: Cyan (oklch(0.6 0.2 195))
- **Background**: Dark (oklch(0.145 0 0))
- **Success**: Green (oklch(0.6 0.18 150))
- **Warning**: Yellow (oklch(0.75 0.15 85))
- **Destructive**: Red (oklch(0.55 0.22 25))

### Animations
- Slide up/down animations for page elements
- Fade in for immediate elements
- Scale in for interactive cards
- Glow effect for hero backgrounds
- Card hover with lift and shadow

### Typography
- **Body**: Inter (clean, professional)
- **Headings**: Space Grotesk (modern, geometric)

## Deployment

This project is optimized for deployment on Vercel:

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Key Features Implementation

### Wallet Connection
- Privy handles authentication and wallet management
- Supports MetaMask, WalletConnect, and embedded wallets
- Dark theme matching the application design

### Permission System
- Preview permissions before granting
- Define spending limits and intervals
- Revoke permissions at any time
- Track active permissions in dashboard

### Payment Types
1. **One-Time**: Single payment execution
2. **Subscription**: Regular recurring payments
3. **Installments**: Split payments over time
4. **Scheduled**: Future dated payments
5. **Split**: Multiple recipient payments

### Automation Features
- Set and forget payment strategies
- Automatic execution within defined limits
- Retry logic for failed transactions
- Real-time activity monitoring

## Mobile Responsiveness

- Fully responsive design for all screen sizes
- Touch-friendly buttons and interactions
- Collapsible navigation for mobile
- Optimized layouts for tablets and phones

## Browser Support

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Brave

## License

MIT

## Support

For issues or questions, please open a GitHub issue or contact the team.
