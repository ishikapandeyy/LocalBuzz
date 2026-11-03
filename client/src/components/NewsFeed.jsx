
import { useEffect, useState } from "react";

function NewsFeed({
  onLoginClick,
  onRegisterClick,
  onSubmitNewsClick
}) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/news")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }
        return response.json();
      })
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <header className="app-header">
  <div className="brand">
    Local<span>Buzz</span>.
  </div>

  <nav className="main-nav">
    <a href="/">Home</a>
    <a href="#news">Latest News</a>
    <a href="#radio">Community Radio</a>
    <a href="#about">About</a>
   <a
  href="#login"
  className="nav-login"
  onClick={(e) => {
    e.preventDefault();
    onLoginClick();
  }}
>
  Login
</a>
<a
  href="#register"
  onClick={(e) => {
    e.preventDefault();
    onRegisterClick();
  }}
>
  Register
</a>
  </nav>
</header>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-label">YOUR COMMUNITY NEWS NETWORK</div>
          <h1 style={{ color: "#beb5b5" }}>
            Your Community. Your News. Your Voice.
          </h1>
          <p>
            Discover what's happening around you. Stay informed about
            local stories, community updates and the voices that matter.
          </p>
        </div>
      </section>

      <main className="news-section" id="news">
        <div className="section-heading">
  <h2>Latest Local News</h2>

  <button
    className="share-news-btn"
    onClick={onSubmitNewsClick}
  >
    + Share News
  </button>
</div>

        {loading ? (
          <p className="loading">Loading local stories...</p>
        ) : news.length === 0 ? (
          <p className="empty-message">
            No stories available yet. Check back soon!
          </p>
        ) : (
          <div className="news-grid">
            {news.map((item) => (
              <article className="news-card" key={item._id}>
  <span className="news-category">{item.category}</span>

  <h3>{item.title}</h3>

  <p>{item.description}</p>

  {item.imageUrl && (
    <img
      src={item.imageUrl}
      alt={item.title}
      className="news-media"
    />
  )}

  {item.videoUrl && (
    <video
      src={item.videoUrl}
      controls
      className="news-media"
    />
  )}

  {item.audioUrl && (
    <div className="news-audio">
      <p>🎧 Listen to this update</p>
      <audio src={item.audioUrl} controls />
    </div>
  )}

  <div className="news-meta">
    📍 {item.location}
  </div>

  <span className="status">{item.status}</span>
</article>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        © 2026 LocalBuzz. Local stories, stronger communities.
      </footer>
    </div>
  );
}

export default NewsFeed;
