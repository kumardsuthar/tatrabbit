import React, { useState, useEffect } from 'react';
import {
  Brain,
  Globe,
  FileText,
  Upload,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Link as LinkIcon,
  RefreshCw,
  FileCode,
  Layers,
  Sparkles,
  X,
  Loader2,
  Check
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from '../../services/api';

export const KnowledgeBase = () => {
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('note'); // 'note' | 'url' | 'file'
  const [viewingItem, setViewingItem] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    type: 'note',
    source: '',
    content: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchKnowledgeBase = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/knowledge-list.php');
      if (response.data.status === 'success') {
        setKnowledgeList(response.data.knowledge || []);
      }
    } catch (err) {
      console.error('Failed to fetch knowledge base:', err);
      showToast('Error loading knowledge base items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (type = 'note') => {
    setActiveTab(type);
    setFormData({
      id: '',
      title: '',
      type: type,
      source: '',
      content: ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id) => {
    try {
      await api.post('/admin/knowledge-toggle.php', { id });
      setKnowledgeList(prev =>
        prev.map(item => (item.id === id ? { ...item, is_active: item.is_active == 1 ? 0 : 1 } : item))
      );
      showToast('Knowledge item status updated!');
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this knowledge base item? The AI Chatbot will no longer use this data.')) {
      return;
    }
    try {
      await api.post('/admin/knowledge-delete.php', { id });
      setKnowledgeList(prev => prev.filter(item => item.id !== id));
      showToast('Knowledge item deleted successfully!');
    } catch (err) {
      showToast('Failed to delete knowledge item', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (activeTab === 'file') {
        const data = new FormData();
        if (formData.id) data.append('id', formData.id);
        data.append('title', formData.title);
        data.append('type', 'file');
        data.append('source', formData.source);
        data.append('content', formData.content);
        if (selectedFile) data.append('file', selectedFile);

        await api.post('/admin/knowledge-save.php', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/knowledge-save.php', {
          ...formData,
          type: activeTab
        });
      }

      showToast(formData.id ? 'Knowledge base item updated!' : 'Knowledge base item added successfully!');
      setIsModalOpen(false);
      fetchKnowledgeBase();
    } catch (err) {
      console.error('Save error:', err);
      showToast(err.response?.data?.error || 'Failed to save knowledge item', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filtered list
  const filteredList = knowledgeList.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.source && item.source.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalNotes = knowledgeList.filter(k => k.type === 'note').length;
  const totalUrls = knowledgeList.filter(k => k.type === 'url').length;
  const totalFiles = knowledgeList.filter(k => k.type === 'file').length;

  return (
    <AdminLayout title="AI Chatbot Knowledge Base & Training">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-bounce ${
          toast.type === 'error' ? 'bg-red-600 text-white border-red-500' : 'bg-emerald-600 text-white border-emerald-500'
        }`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="space-y-6 font-sans">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-white/10">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-semibold tracking-widest text-blue-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" /> Smart Assistant Knowledge Management
            </span>
            <h2 className="font-heading font-semibold text-base tracking-tight text-white pt-1">
              Chatbot Data Training Center
            </h2>
            <p className="text-xs text-blue-100/90 font-medium max-w-2xl leading-relaxed">
              Upload custom store documentation, website URLs, technical notes, and product manual files. The AI Chatbot reads this data in real time to answer customer equipment questions and track orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => handleOpenAddModal('file')}
              className="bg-white text-slate-900 hover:bg-blue-50 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Upload className="w-4 h-4 text-blue-600" /> Upload File
            </button>
            <button
              onClick={() => handleOpenAddModal('url')}
              className="bg-blue-600/60 hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Globe className="w-4 h-4 text-blue-300" /> Add Website URL
            </button>
            <button
              onClick={() => handleOpenAddModal('note')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Write Notes
            </button>
          </div>
        </div>

        {/* Stats Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-[1.5rem] p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Total Items</span>
              <p className="font-heading font-semibold text-base text-slate-900">{knowledgeList.length}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-[1.5rem] p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-semibold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Web Links / URLs</span>
              <p className="font-heading font-semibold text-base text-purple-600">{totalUrls}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-[1.5rem] p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Studio Notes & FAQs</span>
              <p className="font-heading font-semibold text-base text-emerald-600">{totalNotes}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-[1.5rem] p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-semibold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Uploaded Files</span>
              <p className="font-heading font-semibold text-base text-amber-600">{totalFiles}</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white border border-slate-200/90 rounded-[1.5rem] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {['all', 'note', 'url', 'file'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'All Data Sources' : type === 'url' ? '🌐 Website URLs' : type === 'note' ? '📝 Studio Notes' : '📄 Uploaded Files'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge items..."
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Data Table List */}
        <div className="bg-white border border-slate-200/90 rounded-[1.8rem] overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> Loading Knowledge Base...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Brain className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No Knowledge Base Items Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add website URLs, studio notes, or upload documents to train your chatbot to give accurate responses.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-5">Type</th>
                    <th className="py-3.5 px-5">Title & Source</th>
                    <th className="py-3.5 px-5">Content Preview</th>
                    <th className="py-3.5 px-5">Active Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Type Badge */}
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                          item.type === 'url'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : item.type === 'file'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.type === 'url' && <Globe className="w-3 h-3" />}
                          {item.type === 'file' && <FileCode className="w-3 h-3" />}
                          {item.type === 'note' && <FileText className="w-3 h-3" />}
                          {item.type}
                        </span>
                      </td>

                      {/* Title & Source */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-semibold text-slate-900 text-xs line-clamp-1">{item.title}</div>
                        {item.source && (
                          <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5 flex items-center gap-1">
                            {item.type === 'url' ? (
                              <a href={item.source} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                                <LinkIcon className="w-3 h-3" /> {item.source}
                              </a>
                            ) : (
                              <span>{item.source}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Content Preview */}
                      <td className="py-4 px-5 max-w-md">
                        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                          {item.content}
                        </p>
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-5">
                        <button
                          onClick={() => handleToggleActive(item.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide border transition-all ${
                            item.is_active == 1
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {item.is_active == 1 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {item.is_active == 1 ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingItem(item)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="View Full Content"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* VIEW CONTENT MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 font-sans">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {viewingItem.type} Knowledge Entry
                </span>
                <h3 className="font-heading font-semibold text-sm text-slate-900 pt-1">{viewingItem.title}</h3>
                {viewingItem.source && <p className="text-xs text-slate-400 font-medium">Source: {viewingItem.source}</p>}
              </div>
              <button onClick={() => setViewingItem(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
              {viewingItem.content}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT KNOWLEDGE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 font-sans">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-semibold text-sm text-slate-900">Add Chatbot Knowledge Data</h3>
                <p className="text-xs text-slate-400">Train Alex AI Advisor with studio data</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => { setActiveTab('note'); setFormData(f => ({ ...f, type: 'note' })); }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'note' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" /> Note / FAQ
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('url'); setFormData(f => ({ ...f, type: 'url' })); }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'url' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Globe className="w-4 h-4" /> Website URL
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('file'); setFormData(f => ({ ...f, type: 'file' })); }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'file' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4" /> Upload File
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Title / Document Name *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={
                    activeTab === 'url' ? 'e.g., Tattoo Care & Equipment Usage' :
                    activeTab === 'file' ? 'e.g., Needle Specification Chart PDF' :
                    'e.g., 1-Year Studio Warranty Terms'
                  }
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              {activeTab === 'url' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Website URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="https://example.com/tattoo-equipment-guide"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Our system automatically fetches the page content if left blank.</p>
                </div>
              )}

              {activeTab === 'file' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Knowledge Document *</label>
                  <input
                    type="file"
                    required={!formData.id}
                    accept=".txt,.md,.json,.csv,.pdf,.doc,.docx,.html"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        if (!formData.title) {
                          setFormData(f => ({ ...f, title: e.target.files[0].name }));
                        }
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl p-2.5 focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Accepted file formats: .pdf, .txt, .md, .docx, .json, .csv</p>
                </div>
              )}

              {activeTab === 'note' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Source / Category Tag</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g., Studio Policy, Rotary Tech Note"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Knowledge Text Content {activeTab === 'note' ? '*' : '(Optional)'}
                </label>
                <textarea
                  rows={5}
                  required={activeTab === 'note'}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={
                    activeTab === 'url' ? 'Paste specific text from the web page or leave empty to auto-scrape.' :
                    activeTab === 'file' ? 'Optional extra context for the uploaded file.' :
                    'Write detailed instructions, equipment specs, or FAQ answers here...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl p-3 focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-xs"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Save Knowledge Data
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
};
