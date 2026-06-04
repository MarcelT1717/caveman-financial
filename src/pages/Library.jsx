import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Tag, Search, Filter, ExternalLink, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Library = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === 'all' 
        ? `${API_URL}/api/articles/`
        : `${API_URL}/api/articles/?category=${encodeURIComponent(selectedCategory)}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/articles/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const openPdfViewer = (article) => {
    // Open PDF in new tab instead of modal (better browser compatibility)
    window.open(`${API_URL}${article.pdf_url}`, '_blank');
  };

  const closePdfViewer = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="library-hero">
        <div className="container">
          <div className="library-hero-content">
            <h1 className="library-hero-title">Research Library</h1>
            <p className="library-hero-subtitle">
              Access our collection of market analysis, sector research, and investment insights
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="library-filters-section">
        <div className="container">
          <div className="library-filters">
            {/* Search */}
            <div className="library-search">
              <Search className="library-search-icon" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="library-search-input"
                data-testid="library-search"
              />
            </div>

            {/* Category Filter */}
            <div className="library-category-filter">
              <Filter className="mr-2" size={18} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="library-category-select"
                data-testid="library-category-filter"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="library-content">
        <div className="container">
          {loading ? (
            <div className="library-loading">
              <Loader2 className="animate-spin" size={48} />
              <p>Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="library-empty">
              <FileText size={64} className="text-text-muted mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
              <p className="text-text-muted">
                {articles.length === 0 
                  ? "Check back soon for new research and insights."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="library-grid">
              {filteredArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="library-card"
                  data-testid={`article-card-${article.id}`}
                >
                  {/* PDF Preview / Cover */}
                  <div className="library-card-preview" onClick={() => openPdfViewer(article)}>
                    {article.cover_image ? (
                      <img src={article.cover_image} alt={article.title} className="library-card-cover" />
                    ) : (
                      <div className="library-card-pdf-icon">
                        <FileText size={48} />
                        <span>PDF</span>
                      </div>
                    )}
                    <div className="library-card-overlay">
                      <ExternalLink size={24} />
                      <span>View PDF</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="library-card-content">
                    <div className="library-card-category">
                      <Tag size={14} />
                      <span>{article.category}</span>
                    </div>
                    
                    <h3 className="library-card-title" onClick={() => openPdfViewer(article)}>
                      {article.title}
                    </h3>
                    
                    <p className="library-card-description">
                      {article.description}
                    </p>

                    <div className="library-card-footer">
                      <div className="library-card-date">
                        <Calendar size={14} />
                        <span>{formatDate(article.date)}</span>
                      </div>
                      
                      <a 
                        href={`${API_URL}${article.pdf_url}?download=true`}
                        download={article.pdf_filename}
                        className="library-card-download"
                        data-testid={`download-${article.id}`}
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {selectedArticle && (
        <div className="pdf-viewer-overlay" onClick={closePdfViewer} data-testid="pdf-viewer-modal">
          <div className="pdf-viewer-container" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-viewer-header">
              <h3 className="pdf-viewer-title">{selectedArticle.title}</h3>
              <div className="pdf-viewer-actions">
                <a 
                  href={`${API_URL}${selectedArticle.pdf_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-viewer-download"
                >
                  <Download size={18} />
                  Download
                </a>
                <button onClick={closePdfViewer} className="pdf-viewer-close">
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={`${API_URL}${selectedArticle.pdf_url}`}
              className="pdf-viewer-iframe"
              title={selectedArticle.title}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
