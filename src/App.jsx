import { useEffect, useState, useRef } from 'react';
import { getTopHeadlines, searchNews } from './newsApi';
import './styles.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const categories = [
  'trending', 'recent', 'top', // virtual tags
  'business', 'entertainment', 'general', 'health',
  'science', 'sports', 'technology', 'politics',
  'education', 'travel', 'food', 'fashion'
];

function App() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [theme, setTheme] = useState('light');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('bookmarked');
    return saved ? JSON.parse(saved) : [];
  });

  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchData(1, true);
  }, [activeCategory]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('bookmarked', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Debounced Search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        setPage(1);
        fetchData(1, true);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchData = async (pageNum = 1, replace = false) => {
    setLoading(true);
    let data = [];
    const specialTags = ['trending', 'recent', 'top'];

    if (searchTerm.trim()) {
      data = await searchNews(searchTerm, pageNum);
    } else if (specialTags.includes(activeCategory)) {
      data = await getTopHeadlines('general', pageNum); // fallback
      if (activeCategory === 'trending') {
        data = data.slice(0, 6);
      } else if (activeCategory === 'recent') {
        data = data.reverse().slice(0, 6);
      } else if (activeCategory === 'top') {
        data = data.filter(a => a.title.length > 60);
      }
    } else {
      data = await getTopHeadlines(activeCategory, pageNum);
    }

    setArticles(prev => (replace ? data : [...prev, ...data]));
    setLoading(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleBookmark = (article) => {
    const isBookmarked = bookmarks.some((a) => a.url === article.url);
    if (isBookmarked) {
      setBookmarks(bookmarks.filter((a) => a.url !== article.url));
    } else {
      setBookmarks([...bookmarks, article]);
    }
  };

  const BookmarksPage = () => (
    <div className="articles">
      <h2 style={{ textAlign: 'center' }}>🔖 Your Bookmarks</h2>
      {bookmarks.length === 0 ? (
        <p>No bookmarks saved.</p>
      ) : (
        bookmarks.map((article, index) => (
          <div key={index} className="article-card">
            <span className="tag">Saved</span>
            <h2>{article.title}</h2>
            {article.urlToImage && <img src={article.urlToImage} alt="news" />}
            <p>{article.description}</p>
            <div className="article-actions">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read more →
              </a>
              <button onClick={() => toggleBookmark(article)} className="bookmark-btn">
                ❌ Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const HomePage = () => (
    <>
      <div className="category-buttons">
        {categories.map((cat) => (
          <button
            key={cat}
            className={activeCategory === cat ? 'active' : ''}
            onClick={() => {
              setSearchTerm('');
              setPage(1);
              setActiveCategory(cat);
              searchInputRef.current?.blur(); // prevents search bug
            }}
          >
            {cat === 'trending' ? '🔥 Trending' :
             cat === 'recent' ? '🕒 Recent' :
             cat === 'top' ? '📌 Top Week' :
             cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="articles">
        {loading && articles.length === 0 ? (
          <p>Loading news...</p>
        ) : articles.length === 0 ? (
          <p>No news found.</p>
        ) : (
          articles.map((article, index) => (
            <div key={index} className="article-card">
              {activeCategory === 'trending' && <span className="tag">🔥</span>}
              <h2>{article.title}</h2>
              {article.urlToImage && <img src={article.urlToImage} alt="news" />}
              <p>{article.description}</p>
              <div className="article-actions">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Read more →
                </a>
                <button onClick={() => toggleBookmark(article)} className="bookmark-btn">
                  💾 {bookmarks.some((a) => a.url === article.url) ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {articles.length > 0 && !loading && (
        <div className="load-more">
          <button onClick={handleLoadMore}>🧠 Load More</button>
        </div>
      )}
      {loading && <p style={{ textAlign: 'center' }}>Loading more...</p>}
    </>
  );

  return (
    <Router>
      <div className="app-container">
        <header>
          <h1>📰 NewsFlash</h1>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/bookmarks">🔖 Bookmarks</Link>
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </nav>
        </header>

        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </div>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
        </Routes>

        <footer>
          Built by Prathu 💙 | Powered by NewsAPI
        </footer>
      </div>
    </Router>
  );
}

export default App;
