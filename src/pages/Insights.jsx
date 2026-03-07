import React from 'react';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

const Insights = () => {
  // Mock articles - will be replaced with backend data
  const articles = [
    {
      id: 1,
      title: 'The Quantum Computing Revolution: Small Caps Leading the Charge',
      excerpt: 'Quantum computing is no longer science fiction. Small cap companies are making breakthrough advances that could reshape entire industries.',
      author: 'Caveman Research Team',
      date: 'Feb 20, 2026',
      readTime: '5 min read',
      category: 'Quantum',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    },
    {
      id: 2,
      title: 'Space Economy 2026: Investment Opportunities Beyond Earth',
      excerpt: 'The commercial space sector is exploding with opportunities. From lunar missions to satellite internet, small caps are capturing massive market share.',
      author: 'Caveman Research Team',
      date: 'Feb 18, 2026',
      readTime: '7 min read',
      category: 'Space',
      image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
    },
    {
      id: 3,
      title: 'AI-Powered Robotics: The Next Industrial Revolution',
      excerpt: 'Robotics companies are integrating advanced AI to create autonomous systems that are transforming manufacturing and logistics.',
      author: 'Caveman Research Team',
      date: 'Feb 15, 2026',
      readTime: '6 min read',
      category: 'Robotics',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    },
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="display-lg mb-6">Investment Insights</h1>
          <p className="body-lg text-text-secondary max-w-2xl mx-auto">
            Expert analysis, market research, and deep dives into emerging sectors and breakthrough technologies.
          </p>
        </div>

        {/* Featured Article */}
        {articles.length > 0 && (
          <div className="featured-article-card mb-16">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="relative overflow-hidden rounded-2xl h-full min-h-[400px]">
                <img
                  src={articles[0].image}
                  alt={articles[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="category-badge">{articles[0].category}</span>
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="mb-4">
                  <span className="badge-featured">Featured</span>
                </div>
                <h2 className="display-md mb-4">{articles[0].title}</h2>
                <p className="body-lg text-text-secondary mb-6">
                  {articles[0].excerpt}
                </p>
                
                <div className="flex items-center space-x-6 mb-8 text-text-muted">
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span className="body-sm">{articles[0].author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span className="body-sm">{articles[0].date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span className="body-sm">{articles[0].readTime}</span>
                  </div>
                </div>

                <button className="btn-primary self-start">
                  Read Full Article
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="mb-12">
          <h2 className="h2 mb-8">Latest Articles</h2>
          
          {articles.length === 0 ? (
            <div className="empty-state-card">
              <div className="text-center py-16">
                <div className="empty-state-icon mb-4">
                  <Calendar className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="h3 mb-3">No Articles Yet</h3>
                <p className="body-md text-text-secondary">
                  Check back soon for expert insights and analysis on small cap opportunities.
                </p>
              </div>
            </div>
          ) : (
            <div className="articles-grid">
              {articles.slice(1).map((article) => (
                <div key={article.id} className="article-card">
                  <div className="article-image-container mb-4">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="article-image"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="category-badge">{article.category}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="h3 mb-3 line-clamp-2">{article.title}</h3>
                    <p className="body-md text-text-secondary mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <div className="flex items-center space-x-4 text-text-muted">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span className="body-sm">{article.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span className="body-sm">{article.readTime}</span>
                        </div>
                      </div>
                      <button className="btn-ghost text-accent-primary hover:text-accent-hover">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="cta-section mt-16">
          <div className="text-center">
            <h2 className="display-md mb-4">Never Miss an Insight</h2>
            <p className="body-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Get weekly analysis, sector updates, and investment opportunities delivered straight to your inbox.
            </p>
            <button className="btn-primary">
              Subscribe to Newsletter
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
