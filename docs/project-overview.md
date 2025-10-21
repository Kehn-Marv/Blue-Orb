# Blue Orb Project Overview

## 📋 Documentation Index

This comprehensive documentation suite provides everything needed to understand, develop, and scale the Blue Orb educational platform.

### Core Documentation
- **[README.md](./README.md)** - Main project documentation with setup instructions
- **[Architecture.md](./docs/architecture.md)** - System architecture and technical diagrams
- **[Design System.md](./docs/design-system.md)** - UI/UX design system and components
- **[User Flows.md](./docs/user-flows.md)** - Detailed user journey documentation
- **[Metrics & Constraints.md](./docs/metrics-constraints.md)** - Success metrics and technical limitations
- **[Roadmap.md](./docs/roadmap.md)** - Next iteration development plan

### Additional Resources
- **[API Spec.md](./docs/api-spec.md)** - API endpoint documentation
- **[Environment Setup](./env.example)** - Environment configuration template

## 🎯 Project Summary

**Blue Orb** is an open education hub designed specifically for African learners, providing access to curricula, exam materials, learning resources, and a decentralized community forum powered by Nostr.

### Key Features
- **Educational Content**: Curricula, exams, and learning materials
- **Community Forum**: Decentralized Q&A powered by Nostr
- **Bilingual Support**: English and Wolof languages
- **Admin Dashboard**: Content management system
- **Mobile-First Design**: Responsive and accessible interface

### Technology Stack
- **Frontend**: React 19.1.1 + Vite 7.1.7 + TailwindCSS 4.1.14
- **Backend**: Express.js + libSQL (Turso) + Nostr integration
- **Storage**: IPFS for file content, Turso for structured data
- **Deployment**: Vercel for both frontend and backend

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- Turso account
- IPFS access

### Setup Steps
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Blue-orb
   ```

2. **Backend Setup**
   ```bash
   npm install
   cp env.example .env
   # Edit .env with your Turso credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with API URL
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000/api
   - Admin: http://localhost:5173/admin

## 📊 Current Status

### ✅ Completed Features
- [x] Basic curriculum browser
- [x] Exam repository with download functionality
- [x] Learning materials catalog
- [x] Nostr-powered community forum
- [x] Admin dashboard for content management
- [x] Bilingual support (English/Wolof)
- [x] Responsive design implementation
- [x] Basic authentication system
- [x] IPFS integration for file storage
- [x] Rate limiting and security measures

### 🔄 In Progress
- [ ] Enhanced mobile responsiveness
- [ ] Improved community UI/UX
- [ ] Content centering and layout optimization
- [ ] Performance optimizations

### 📋 Next Priorities
- [ ] Direct IPFS file upload integration
- [ ] Multi-relay Nostr support
- [ ] Advanced search functionality
- [ ] Real-time notifications
- [ ] Content moderation system

## 🎨 Design Philosophy

### Core Principles
1. **Accessibility First**: Mobile-first, responsive design
2. **Decentralized Community**: Nostr-powered discussions
3. **Open Education**: Free access to educational resources
4. **Cultural Sensitivity**: Local language support
5. **Performance**: Fast loading and smooth interactions

### Visual Identity
- **Primary Color**: Blue (#3B82F6) - Trust and education
- **Secondary Color**: Purple (#8B5CF6) - Innovation
- **Accent Color**: Cyan (#06B6D4) - Technology
- **Typography**: Inter font family for readability
- **Layout**: Centered, responsive grid system

## 🔧 Technical Architecture

### System Components
```
Frontend (React SPA) ←→ Backend (Express API) ←→ Database (Turso)
                                ↓
                    Nostr Network ←→ IPFS Storage
```

### Key Integrations
- **Turso Database**: Structured data storage
- **Nostr Protocol**: Decentralized community features
- **IPFS Network**: File content storage
- **Vercel Platform**: Hosting and deployment

### Security Measures
- Basic HTTP authentication for admin
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- Content moderation (basic)

## 📈 Success Metrics

### Current Targets
- **Daily Active Users**: 500+
- **Questions Asked**: 50+ daily
- **Content Downloads**: 1,000+ monthly
- **Uptime**: 99.5%+
- **Page Load Time**: < 3 seconds

### Growth Indicators
- User engagement and retention
- Community participation rates
- Content consumption patterns
- Educational impact metrics
- Platform adoption rates

## 🚧 Known Limitations

### Technical Constraints
- Manual IPFS file pinning required
- Single Nostr relay dependency
- Basic authentication system
- Limited offline functionality
- No native mobile app

### Performance Considerations
- Database connection limits
- IPFS retrieval latency
- Nostr sync delays
- Bundle size optimization needed

## 🎯 Next Iteration Focus

### Phase 1 (Weeks 1-4): Foundation
- Direct IPFS integration
- Multi-relay Nostr support
- Advanced search functionality
- Mobile optimization

### Phase 2 (Weeks 5-8): Community
- Real-time notifications
- Content moderation system
- Reputation and gamification
- Thread organization

### Phase 3 (Weeks 9-12): Advanced Features
- Learning progress tracking
- Analytics dashboard
- API documentation
- Multi-language expansion

### Phase 4 (Weeks 13-16): Scale
- Infrastructure scaling
- Advanced security
- Monitoring and observability
- Mobile app development

## 🤝 Contributing

### Development Guidelines
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Test changes thoroughly
- Document new features

### Code Standards
- React functional components with hooks
- TailwindCSS for styling
- Semantic HTML structure
- Accessibility compliance
- Performance optimization

## 📞 Support & Contact

### Getting Help
- **Documentation**: Comprehensive guides in `/docs`
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Email**:

### Community
- **Discord**: Community discussions
- **Twitter**: Project updates
- **GitHub**: Source code and issues
- **Website**: Project information

## 📄 License

MIT License - Open source and free to use, modify, and distribute.

---

**Built with ❤️ for African learners**

*Empowering education through technology, one student at a time.*
