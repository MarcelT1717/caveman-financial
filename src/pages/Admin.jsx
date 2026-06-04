import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Edit, Plus, X, Save, Loader2, CheckCircle, AlertCircle, Image } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Admin = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Weekly Newsletter',
    date: new Date().toISOString().split('T')[0],
    pdf_file: null,
    pdf_filename: '',
    cover_image: '',
    cover_image_file: null,
    cover_image_preview: ''
  });

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/articles/`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      showNotification('Error loading articles', 'error');
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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        pdf_file: file,
        pdf_filename: file.name
      }));
    } else {
      showNotification('Please select a PDF file', 'error');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        cover_image_file: file,
        cover_image_preview: previewUrl
      }));
    } else {
      showNotification('Please select an image file', 'error');
    }
  };

  const resetForm = () => {
    // Clean up preview URL if exists
    if (formData.cover_image_preview) {
      URL.revokeObjectURL(formData.cover_image_preview);
    }
    setFormData({
      title: '',
      description: '',
      category: 'Weekly Newsletter',
      date: new Date().toISOString().split('T')[0],
      pdf_file: null,
      pdf_filename: '',
      cover_image: '',
      cover_image_file: null,
      cover_image_preview: ''
    });
    setEditingArticle(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (!editingArticle && !formData.pdf_file) {
      showNotification('Please select a PDF file', 'error');
      return;
    }

    setSubmitting(true);

    try {
      let pdfData = '';
      let coverImageData = '';
      
      if (formData.pdf_file) {
        // Convert PDF to base64
        pdfData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.pdf_file);
        });
      }

      // Convert cover image to base64 if uploaded
      if (formData.cover_image_file) {
        coverImageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result); // Keep full data URL for images
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.cover_image_file);
        });
      }

      const articleData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        pdf_data: pdfData || (editingArticle ? editingArticle.pdf_data : ''),
        pdf_filename: formData.pdf_filename || (editingArticle ? editingArticle.pdf_filename : ''),
        cover_image: coverImageData || formData.cover_image || (editingArticle ? editingArticle.cover_image : null)
      };

      const url = editingArticle 
        ? `${API_URL}/api/articles/${editingArticle.id}`
        : `${API_URL}/api/articles/`;
      
      const method = editingArticle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
      });

      if (response.ok) {
        showNotification(editingArticle ? 'Article updated successfully' : 'Article created successfully');
        resetForm();
        fetchArticles();
      } else {
        const error = await response.json();
        showNotification(error.detail || 'Error saving article', 'error');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      showNotification('Error saving article', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      description: article.description,
      category: article.category,
      date: article.date,
      pdf_file: null,
      pdf_filename: article.pdf_filename,
      cover_image: article.cover_image || '',
      cover_image_file: null,
      cover_image_preview: article.cover_image || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/articles/${articleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('Article deleted successfully');
        fetchArticles();
      } else {
        showNotification('Error deleting article', 'error');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      showNotification('Error deleting article', 'error');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="admin-page">
      {/* Notification */}
      {notification && (
        <div className={`admin-notification ${notification.type}`} data-testid="admin-notification">
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div>
              <h1 className="admin-title">Article Manager</h1>
              <p className="admin-subtitle">Upload and manage your research articles</p>
            </div>
            <button 
              className="admin-add-btn"
              onClick={() => setShowForm(true)}
              data-testid="add-article-btn"
            >
              <Plus size={20} />
              Add Article
            </button>
          </div>
        </div>
      </div>

      {/* Article Form Modal */}
      {showForm && (
        <div className="admin-modal-overlay" data-testid="article-form-modal">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{editingArticle ? 'Edit Article' : 'Add New Article'}</h2>
              <button onClick={resetForm} className="admin-modal-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              {/* Title */}
              <div className="admin-form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Caveman Weekly - Feb 23-27"
                  required
                  data-testid="article-title-input"
                />
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the article content..."
                  rows={3}
                  required
                  data-testid="article-description-input"
                />
              </div>

              {/* Category & Date Row */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    data-testid="article-category-select"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    data-testid="article-date-input"
                  />
                </div>
              </div>

              {/* PDF Upload */}
              <div className="admin-form-group">
                <label>PDF File {!editingArticle && '*'}</label>
                <div 
                  className="admin-file-upload"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="pdf-upload-zone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {formData.pdf_filename ? (
                    <div className="admin-file-selected">
                      <FileText size={24} />
                      <span>{formData.pdf_filename}</span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, pdf_file: null, pdf_filename: '' }));
                        }}
                        className="admin-file-remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="admin-file-placeholder">
                      <Upload size={32} />
                      <span>Click to upload PDF</span>
                      <span className="admin-file-hint">Max file size: 10MB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Image Upload (Optional) */}
              <div className="admin-form-group">
                <label>Cover Image (Optional)</label>
                <div 
                  className="admin-file-upload admin-image-upload"
                  onClick={() => imageInputRef.current?.click()}
                  data-testid="image-upload-zone"
                >
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  {formData.cover_image_preview ? (
                    <div className="admin-image-preview">
                      <img src={formData.cover_image_preview} alt="Cover preview" />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (formData.cover_image_preview && !formData.cover_image_preview.startsWith('data:')) {
                            URL.revokeObjectURL(formData.cover_image_preview);
                          }
                          setFormData(prev => ({ 
                            ...prev, 
                            cover_image_file: null, 
                            cover_image_preview: '',
                            cover_image: '' 
                          }));
                        }}
                        className="admin-image-remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="admin-file-placeholder">
                      <Image size={32} />
                      <span>Click to upload cover image</span>
                      <span className="admin-file-hint">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="admin-form-actions">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="admin-btn-primary"
                  data-testid="submit-article-btn"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingArticle ? 'Update Article' : 'Save Article'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="admin-content">
        <div className="container">
          {loading ? (
            <div className="admin-loading">
              <Loader2 className="animate-spin" size={48} />
              <p>Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="admin-empty">
              <FileText size={64} />
              <h3>No Articles Yet</h3>
              <p>Click "Add Article" to upload your first PDF</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table" data-testid="articles-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>File</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} data-testid={`article-row-${article.id}`}>
                      <td className="admin-table-title">{article.title}</td>
                      <td>
                        <span className="admin-category-badge">{article.category}</span>
                      </td>
                      <td>{formatDate(article.date)}</td>
                      <td>
                        <a 
                          href={`${API_URL}${article.pdf_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-pdf-link"
                        >
                          <FileText size={16} />
                          {article.pdf_filename}
                        </a>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button 
                            onClick={() => handleEdit(article)}
                            className="admin-action-btn edit"
                            title="Edit"
                            data-testid={`edit-${article.id}`}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(article.id)}
                            className="admin-action-btn delete"
                            title="Delete"
                            data-testid={`delete-${article.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
