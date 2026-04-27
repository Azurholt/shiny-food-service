# Kueue

A modern food ordering and queue management platform built for Kumasi's busy markets. Kueue connects customers with local food sellers through an organized, transparent system to eliminate uncertain queues and reduce wasted food.

## Overview

Kueue addresses the inefficiencies in street food ordering by providing a digital queue management system. Customers can see their place in line before arriving, pay upfront via Mobile Money, and receive a pickup code. Sellers gain an organized order list, payment confirmation, and a simple dashboard that works on any phone.

## Features

### For Customers
- Browse sellers by category (Waakye, Shawarma, Fufu, etc.)
- Real-time queue status and estimated wait times
- Secure Mobile Money payments (MTN MoMo, Telecel Cash)
- 4-digit pickup codes for seamless collection
- No app download required

### For Sellers
- Organized order list with status tracking (Pending, Cooking, Ready)
- Upfront payment confirmation to eliminate ghost orders
- Simple dashboard optimized for mobile devices
- Free 30-day trial

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Icons:** Lucide React
- **Fonts:** Plus Jakarta Sans, Manrope
- **Deployment:** Vercel

## Known Working Versions

- **dependencies**:
    "@supabase/supabase-js": "~2.100.0",
    "eslint-config-next": "14.2.5",
    "lucide-react": "1.6.0",
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"

- **devDependencies**:
    "@types/node": "20.19.37",
    "@types/react": "18.3.28",
    "@types/react-dom": "18.3.7",
    "eslint": "8.57.1",
    "postcss": "8.5.8",
    "tailwindcss": "3.4.1",
    "typescript": "5.9.3"

*NB: The condition "--legacy-peer-deps" needs to be present for all dependency conflictions to be rendered ignorable, otherwise a conflict could spiral into the software not working as intended or simply crashing.* 
Particularly, "npm install --legacy-peer-deps"

## Design System

The UI follows the "Modern Weaver" design philosophy, emphasizing structural rhythm, tonal layering, and a Ghanaian-inspired color palette. Key principles include:

- **Tonal Depth:** Using background color shifts instead of borders for sectioning.
- **Editorial Typography:** Pairing Plus Jakarta Sans for headlines with Manrope for body text.
- **Ghanaian Palette:** Using Green, Red, and Gold as strategic accents rather than dominant fills.
- **Asymmetry:** Intentional layout breaks to create visual interest.

## Deployment

This project is hosted on Vercel. Environment variables for Supabase connection are managed securely through the Vercel dashboard. 

## License

MIT License

## Contact

Made in Kumasi, Ghana.