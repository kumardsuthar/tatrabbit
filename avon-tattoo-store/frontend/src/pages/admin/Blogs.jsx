import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from '../../services/api';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/blogs-list.php');
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await api.post('/admin/blog-toggle.php', { id });
      fetchBlogs();
    } catch (err) {
      alert('Failed to update blog publish status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await api.post('/admin/blog-delete.php', { id });
      fetchBlogs();
    } catch (err) {
      alert('Failed to delete blog: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <AdminLayout title="Blog & Equipment Masterclass Management">
      <div className="space-y-6 font-sans">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Masterclass Blog Articles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, edit, publish, or draft equipment guides and studio articles for the website
            </p>
          </div>
          <Link
            to="/admin/blogs/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Blog Article
          </Link>
        </div>

        {/* Blogs Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading blog articles...</div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Article Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Read Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {blogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-400 text-xs">
                        No blog articles yet. Click "Create Blog Article" to write your first post!
                      </td>
                    </tr>
                  ) : (
                    blogs.map((b) => {
                      const isPublished = parseInt(b.is_published) === 1;
                      const cleanImg = cleanProductImageUrl(b.image_url);
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {cleanImg ? (
                                <img
                                  src={cleanImg}
                                  alt={b.title}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-900 text-xs">{b.title}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-1">{b.excerpt}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-blue-600">{b.category}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-500">{b.read_time}</td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                              isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleTogglePublish(b.id)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors inline-block"
                              title={isPublished ? 'Unpublish to Draft' : 'Publish Article'}
                            >
                              {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <Link
                              to={`/admin/blogs/edit/${b.id}`}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors inline-block"
                              title="Edit Article"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(b.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors inline-block"
                              title="Delete Article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
