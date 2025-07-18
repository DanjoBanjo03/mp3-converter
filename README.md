# 🎵 MP3 Converter

A modern, full-stack web application for converting YouTube videos and SoundCloud tracks to high-quality MP3 files with custom metadata support.

![MP3 Converter](https://img.shields.io/badge/MP3-Converter-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

### 🎥 YouTube to MP3
- Convert any YouTube video to high-quality MP3
- Automatic audio extraction with best quality settings
- Support for all YouTube video formats
- URL validation and normalization

### 🎵 SoundCloud to MP3
- Convert SoundCloud tracks to MP3 format
- HLS stream processing for optimal quality
- Direct track download support

### 🏷️ Metadata Tagging
- Add custom ID3 tags (Title, Artist, Year)
- Upload and embed custom cover art
- Automatic filename sanitization
- Base64 cover art processing

### 🎨 Modern UI/UX
- Responsive design for all devices
- Glass-morphism design with gradient backgrounds
- Platform-specific theming (YouTube red, SoundCloud orange)
- Smooth animations and hover effects
- Loading states and visual feedback
- Accessibility-focused design

## 🛠️ Tech Stack

### Frontend
- **Next.js** - React framework with SSR support
- **React** - Component-based UI library
- **TypeScript** - Type-safe JavaScript
- **Styled-JSX** - CSS-in-JS styling solution

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Node.js** - Runtime environment
- **FFmpeg** - Audio processing and conversion

### Key Dependencies
- **youtube-dl-exec** - YouTube video downloading
- **soundcloud-downloader** - SoundCloud track processing
- **fluent-ffmpeg** - FFmpeg wrapper for audio conversion
- **ffmpeg-static** - Static FFmpeg binary
- **node-id3** - MP3 metadata manipulation

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mp3-converter
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Create .env.local file
   SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 📱 Usage

### Converting Videos/Tracks

1. **Choose Platform**: Select YouTube or SoundCloud from the home page
2. **Enter URL**: Paste the video/track URL in the input field
3. **Convert**: Click "Convert to MP3" and wait for processing
4. **Download**: Click the download button when conversion is complete

### Adding Metadata (Optional)

1. **After conversion**: Click "Tag it" button
2. **Fill metadata**: Enter title, artist, year, and upload cover art
3. **Process**: Click "Tag & Download MP3"
4. **Download**: Get your tagged MP3 file

## 🏗️ Project Structure

```
mp3-converter/
├── components/           # Reusable React components
│   ├── ConverterForm.tsx # URL input and conversion form
│   ├── ResultLink.js     # Download link component
│   ├── TagForm.js        # Metadata tagging form
│   ├── Footer.js         # Footer component
│   └── LoadingSpinner.js # Loading animation
├── pages/               # Next.js pages and API routes
│   ├── api/            # Backend API endpoints
│   │   ├── youtube.js  # YouTube conversion API
│   │   └── soundcloud.js # SoundCloud conversion API
│   ├── _app.js         # Global app configuration
│   ├── index.js        # Home page
│   ├── youtube.js      # YouTube converter page
│   └── soundcloud.js   # SoundCloud converter page
├── public/             # Static assets
├── package.json        # Dependencies and scripts
└── README.md          # Project documentation
```

## 🔧 API Endpoints

### POST `/api/youtube`
Convert YouTube videos to MP3

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "title": "Song Title (optional)",
  "artist": "Artist Name (optional)",
  "year": "2024 (optional)",
  "coverData": "data:image/jpeg;base64,... (optional)"
}
```

### POST `/api/soundcloud`
Convert SoundCloud tracks to MP3

**Request Body:**
```json
{
  "url": "https://soundcloud.com/artist/track",
  "title": "Song Title (optional)",
  "artist": "Artist Name (optional)",
  "year": "2024 (optional)",
  "coverData": "data:image/jpeg;base64,... (optional)"
}
```

## 🎨 Design Features

- **Gradient Backgrounds**: Modern purple/blue gradients with platform-specific themes
- **Glass-morphism**: Translucent cards with backdrop blur effects
- **Responsive Design**: Mobile-first approach with breakpoints
- **Hover Animations**: Smooth transitions and interactive elements
- **Loading States**: Visual feedback during processing
- **Error Handling**: User-friendly error messages with styled alerts

## ⚠️ Important Notes

### Legal Compliance
- **Respect Copyright**: Only convert content you own or have permission to use
- **Personal Use**: This tool is intended for personal, non-commercial use
- **Platform Terms**: Ensure compliance with YouTube and SoundCloud terms of service

### Technical Limitations
- **File Size**: Large files may take longer to process
- **Quality**: Output quality depends on source material
- **Rate Limits**: Avoid excessive requests to prevent API throttling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational and personal use. Please respect copyright laws and platform terms of service.

## 🙏 Acknowledgments

- **FFmpeg** - Audio processing engine
- **youtube-dl** - YouTube downloading capabilities
- **SoundCloud** - Audio streaming platform
- **Next.js Team** - Amazing React framework
- **Vercel** - Deployment platform

---

Made with ❤️ for music lovers