# AccessiGo - Modern Accessibility Mapping Platform

[![Modern Web App](https://img.shields.io/badge/Modern-Web_App-2563eb?style=for-the-badge&logo=web&logoColor=white)](https://github.com)
[![Accessibility First](https://img.shields.io/badge/Accessibility_First-10b981?style=for-the-badge&logo=accessibility&logoColor=white)](https://www.w3.org/WAI/)
[![Progressive Web App](https://img.shields.io/badge/PWA-Ready-f59e0b?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

A cutting-edge, fully accessible web application that empowers communities to map and discover accessibility features in their neighborhoods. Built with modern web technologies and a focus on inclusive design.

![AccessiGo Preview](https://via.placeholder.com/800x400/2563eb/ffffff?text=AccessiGo+Preview)

## ✨ Features

### 🗺️ Interactive Mapping
- **Modern Leaflet Integration**: Smooth, responsive map experience with OpenStreetMap tiles
- **Real-time Location Search**: Powered by Nominatim API for accurate geocoding
- **GPS Integration**: Get current location with one click
- **Color-coded Markers**: Visual accessibility indicators for different feature types

### 🔐 Advanced Authentication
- **Secure User Accounts**: Client-side authentication with localStorage
- **Personalized Experience**: User-specific marker management
- **Form Validation**: Real-time validation with helpful error messages
- **Password Security**: Show/hide password functionality

### ♿ Comprehensive Accessibility Features
- **9 Marker Types**: From ramps to audio signals
- **Accessibility Ratings**: Automatic rating system for features
- **Detailed Information**: Comprehensive marker details with timestamps
- **User Contributions**: Community-driven accessibility mapping

### 🎨 Modern UI/UX
- **CSS Custom Properties**: Consistent theming and easy customization
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Dark Mode Ready**: Automatic dark mode support
- **Smooth Animations**: Modern transitions and micro-interactions
- **Toast Notifications**: Non-intrusive feedback system

### 🚀 Performance & Accessibility
- **WCAG 2.1 Compliant**: Built with accessibility best practices
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Progressive Enhancement**: Works without JavaScript
- **Fast Loading**: Optimized assets and lazy loading

## 🛠️ Technology Stack

### Frontend Architecture
```javascript
├── HTML5 - Semantic markup with ARIA support
├── CSS3 - Custom properties, Grid, Flexbox, Animations
├── JavaScript (ES6+) - Classes, Async/await, Modules
├── Leaflet.js - Interactive mapping library
└── LocalStorage API - Client-side data persistence
```

### Key Libraries
- **Leaflet 1.9.4**: Modern mapping with custom markers
- **Inter Font**: Professional typography
- **Nominatim API**: Open geocoding service

### Development Tools
- **Modern CSS**: Custom properties, CSS Grid, Flexbox
- **ES6+ JavaScript**: Classes, arrow functions, template literals
- **Responsive Images**: Optimized for all screen sizes
- **Progressive Enhancement**: Graceful degradation

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Internet connection for map tiles and geocoding
- Local development server (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/accessigo.git
   cd accessigo
   ```

2. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 📖 Usage Guide

### For New Users
1. **Create Account**: Click "Sign Up" and fill in your details
2. **Explore Map**: Use search or GPS to navigate
3. **Add Markers**: Click "Add Marker" and select locations on the map
4. **Contribute**: Help build the accessibility community

### For Existing Users
1. **Sign In**: Use your email and password
2. **View Markers**: See all your contributed accessibility features
3. **Edit/Delete**: Manage your markers as needed
4. **Explore**: Discover markers added by the community

### Marker Types Available
- 🟢 **Ramp**: Wheelchair accessible ramps
- 🟡 **Elevator**: Building elevators
- 🟢 **Accessible Entrance**: ADA compliant entrances
- ⚪ **Parking**: Accessible parking spaces
- 🔵 **Stairs**: Staircase locations
- 🔴 **Obstacle**: Barriers or obstacles
- 🟠 **Uneven Path**: Uneven walking surfaces
- 🟣 **Tactile Paving**: Braille/tactile guidance
- 🔊 **Audio Signals**: Audible crossing signals

## 🎯 Accessibility Ratings

| Rating | Description | Color |
|--------|-------------|-------|
| High Accessibility | Fully accessible features | 🟢 Green |
| Medium Accessibility | Partially accessible | 🟡 Yellow |
| Low Accessibility | Limited accessibility | 🟠 Orange |
| No Accessibility | Not accessible | 🔴 Red |

## 🏗️ Architecture

### Application Structure
```
accessigo/
├── index.html          # Main HTML document
├── styles.css          # Modern CSS with custom properties
├── app.js             # ES6+ application logic
└── README.md          # Documentation
```

### State Management
- **AppState Class**: Centralized application state
- **LocalStorage**: Persistent user data
- **Event-driven**: Reactive UI updates

### Component Architecture
- **Modular Functions**: Single responsibility principle
- **Event Delegation**: Efficient event handling
- **Template Literals**: Dynamic HTML generation

## 🔧 Customization

### Theming
Modify CSS custom properties in `styles.css`:

```css
:root {
  --color-primary: #your-color;
  --color-secondary: #your-color;
  --font-family-primary: 'Your Font', sans-serif;
}
```

### Adding Marker Types
Extend the `CONFIG.MARKER_TYPES` object in `app.js`:

```javascript
'Tactile Paving': { color: 'purple', icon: '🟣' }
```

### API Integration
Replace localStorage with your backend API:

```javascript
// Replace localStorage calls with fetch requests
async saveMarkerToUser(markerData) {
  const response = await fetch('/api/markers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(markerData)
  });
  return response.json();
}
```

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |
| iOS Safari | 14+ | ✅ Full Support |
| Android Chrome | 90+ | ✅ Full Support |

## 📱 Progressive Web App Features

- **Installable**: Add to home screen on mobile devices
- **Offline Ready**: Service worker for caching (future enhancement)
- **Responsive**: Adapts to any screen size
- **Fast**: Optimized loading and rendering

## 🔒 Security Considerations

### Current Implementation
- Client-side authentication (demo purposes)
- Local data storage
- No server-side validation

### Production Recommendations
- Implement server-side authentication
- Use secure HTTPS connections
- Add input sanitization
- Implement rate limiting
- Use environment variables for API keys

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow ES6+ best practices
- Use semantic HTML and ARIA labels
- Ensure WCAG 2.1 compliance
- Test on multiple browsers and devices
- Keep the codebase modular and maintainable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** for map data
- **Leaflet** for the mapping library
- **Nominatim** for geocoding services
- **Web Accessibility Initiative** for accessibility guidelines

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/accessigo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/accessigo/discussions)
- **Email**: support@accessigo.com

## 🚀 Future Roadmap

- [ ] **Backend API**: Server-side data persistence
- [ ] **User Profiles**: Avatar upload and user settings
- [ ] **Social Features**: Marker reviews and comments
- [ ] **Offline Mode**: Service worker implementation
- [ ] **Advanced Search**: Filter by accessibility type, rating
- [ ] **Route Planning**: Accessible route suggestions
- [ ] **Data Export**: CSV/JSON export functionality
- [ ] **Admin Panel**: Content moderation tools

---

**Made with ❤️ for accessibility and inclusion**

*Empowering communities to create more accessible environments, one marker at a time.*

## License

This project is for educational and demonstration purposes.