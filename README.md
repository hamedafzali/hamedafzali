# Profile Website

A modern portfolio website inspired by Adham Dannaway's design, built with React, TypeScript, Node.js, and MongoDB.

## Features

- **Modern Design**: Clean, minimalist design inspired by professional portfolios
- **Responsive**: Fully responsive layout that works on all devices
- **Interactive**: Smooth animations and transitions
- **Contact Form**: Functional contact form with backend integration
- **Portfolio Management**: Dynamic portfolio section with MongoDB backend
- **TypeScript**: Type-safe frontend development
- **Node.js Backend**: RESTful API for data management

## Tech Stack

### Frontend

- React 18
- TypeScript
- CSS3 (no frameworks)
- React Router

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

## Project Structure

```
profile-website/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string

5. Start the server:

```bash
npm run dev
```

6. Seed the database with sample data:

```bash
node seed.js
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

## API Endpoints

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/featured` - Get featured projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project

### Contact

- `POST /api/contact` - Submit contact form
- `GET /api/contacts` - Get all contacts (admin)

### Health

- `GET /api/health` - Health check

## Features Breakdown

### Navigation

- Fixed navigation with scroll effects
- Mobile-responsive hamburger menu
- Smooth scroll to sections
- Social media links

### Hero Section

- Eye-catching headline with dual role display
- Call-to-action buttons
- Animated visual elements

### About Section

- Skills showcase with interactive tags
- Professional description
- Visual design elements

### Portfolio Section

- Grid layout for project cards
- Category filtering
- Hover effects and animations
- Project details and links

### Contact Section

- Functional contact form
- Form validation
- Contact information display
- Social media links

### Footer

- Site navigation links
- Social media links
- Back to top functionality
- Copyright information

## Deployment

### Frontend (Netlify/Vercel)

1. Build the frontend:

```bash
npm run build
```

2. Deploy the `build` folder to your preferred hosting platform

### Backend (Heroku/Railway)

1. Set environment variables in your hosting platform
2. Deploy the backend application
3. Ensure MongoDB is accessible from your hosting environment

## Customization

### Personal Information

Update the following files with your information:

- `frontend/src/components/Hero.tsx` - Update hero text and buttons
- `frontend/src/components/About.tsx` - Update about section and skills
- `frontend/src/components/Contact.tsx` - Update contact information
- `frontend/src/components/Footer.tsx` - Update footer links

### Styling

All styles are located in component-specific CSS files:

- `frontend/src/components/Navigation.css`
- `frontend/src/components/Hero.css`
- `frontend/src/components/About.css`
- `frontend/src/components/Portfolio.css`
- `frontend/src/components/Contact.css`
- `frontend/src/components/Footer.css`

### Colors and Fonts

Modify the global styles in `frontend/src/index.css` to change colors, fonts, and base styles.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support and questions, please open an issue in the repository.
