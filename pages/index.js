// pages/index.js
import Link from 'next/link'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .main-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .title {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .subtitle {
          color: #666;
          font-size: 1.1rem;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .links-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .converter-link {
          display: block;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }

        .converter-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .converter-link:active {
          transform: translateY(0);
        }

        .converter-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .converter-link:hover::before {
          left: 100%;
        }

        .youtube-link {
          background: linear-gradient(135deg, #ff0000, #cc0000);
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
        }

        .youtube-link:hover {
          box-shadow: 0 8px 25px rgba(255, 0, 0, 0.4);
        }

        .soundcloud-link {
          background: linear-gradient(135deg, #ff8500, #ff5500);
          box-shadow: 0 4px 15px rgba(255, 133, 0, 0.3);
        }

        .soundcloud-link:hover {
          box-shadow: 0 8px 25px rgba(255, 133, 0, 0.4);
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .main-card {
            padding: 2rem 1.5rem;
          }

          .title {
            font-size: 2.5rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .converter-link {
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .main-card {
            padding: 1.5rem 1rem;
          }

          .title {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 0.9rem;
            margin-bottom: 2rem;
          }
        }
      `}</style>

      <div className="container">
        <div className="main-card">
          <h1 className="title">MP3 Converter</h1>
          <p className="subtitle">Convert your favorite tracks from YouTube and SoundCloud to high-quality MP3 files</p>
          <div className="links-container">
            <Link href="/youtube" className="converter-link youtube-link">
              🎥 YouTube → MP3
            </Link>
            <Link href="/soundcloud" className="converter-link soundcloud-link">
              🎵 SoundCloud → MP3
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}