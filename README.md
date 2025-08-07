# 🔐 Visitor Watchlist Management System - Part 2 (Expanded Version)

A comprehensive React TypeScript application for managing visitor access control and security watchlists in corporate environments.

> **Note:** This is the expanded version (Part 2) of the VM Watchlist system. For the stable Version 1, see the `v1-stable` branch.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup
```bash
# Clone the repository
git clone [YOUR-REPO-URL]
cd vm-watchlist-v1-bolt

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📋 Features

### Core Functionality
- **Visitor Registration**: Quick visitor check-in with real-time watchlist verification
- **Watchlist Management**: Add, edit, and manage security-flagged individuals
- **Security Alerts**: Automatic flagging of high-risk visitors during registration
- **Status Tracking**: Monitor visitor check-in/check-out status throughout the day
- **Search & Filtering**: Quickly find visitors and watchlist entries

### Security Features
- **Risk Level Classification**: High risk, Medium priority, Low priority categorization
- **Alternative Names**: Support for aliases and multiple name variations
- **Detailed Notes**: Comprehensive incident documentation
- **Photo Attachments**: Visual identification support
- **Audit Trail**: Track all changes and updates

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Live status changes and notifications
- **Batch Operations**: Bulk status changes for multiple visitors
- **Intuitive Interface**: Clean, professional design optimized for security workflows

## 🏗️ Technical Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context API
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application screens
├── context/            # State management
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## 🎯 User Testing Ready

This prototype is configured for user testing with:
- **Realistic test data** for security scenarios
- **Complete workflows** for all major user tasks
- **Error handling** and validation
- **Mobile-responsive** design for field testing

### Test Scenarios Available
1. Visitor registration with watchlist checking
2. Adding high-risk individuals to watchlist
3. Status management and daily operations
4. Emergency lookups and incident response

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built files in `dist/` can be deployed to:
- Netlify
- Vercel  
- GitHub Pages
- AWS S3 + CloudFront
- Any static file server

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Configuration Files
- `tailwind.config.js` - Tailwind CSS configuration
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration

## 📊 Performance Features

- **Sticky table headers** for long lists
- **Optimized tooltips** that don't block interactions
- **Efficient sorting and filtering**
- **Lazy loading** for better initial load times

## 🐛 Known Issues & Improvements

Current known issues are tracked and being addressed:
- Tooltip positioning optimizations
- Mobile UX enhancements
- Additional security features

## 👥 Contributing

This is a prototype for user testing and team feedback. To contribute:

1. Test the application with real-world scenarios
2. Document any usability issues or suggestions
3. Provide feedback on security workflows
4. Report bugs or performance issues

## 📞 Support

For questions, issues, or feedback about this prototype, please contact the development team or create an issue in this repository.

---

**Status**: User Testing Phase  
**Last Updated**: $(date)  
**Version**: 1.0.0 