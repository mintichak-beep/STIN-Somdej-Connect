import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { announcementService } from '../services/app.service';
import { Announcement } from '../types/app';
import { Plus, Pin, Calendar, User, Search, Link as LinkIcon, Trash2, Edit, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Modal } from '../components/Modal';

export function Announcements({ role }: { role: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    author: '',
    attachmentUrl: '',
    isPinned: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  const categories = ['All', 'General', 'Academic', 'Clinical', 'Dormitory', 'Transportation'];

  useEffect(() => {
    const unsub = announcementService.onSnapshot([], (data) => {
      setAnnouncements(data.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const dateA = a.date?.seconds ? a.date.seconds : new Date(a.date).getTime() / 1000;
        const dateB = b.date?.seconds ? b.date.seconds : new Date(b.date).getTime() / 1000;
        return (dateB || 0) - (dateA || 0);
      }));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setSelectedAnn(null);
    setFormData({
      title: '',
      content: '',
      category: 'General',
      author: 'Admin',
      attachmentUrl: '',
      isPinned: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setSelectedAnn(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      category: ann.category || 'General',
      author: ann.author,
      attachmentUrl: ann.attachmentUrl || '',
      isPinned: ann.isPinned || false
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณต้องการลบประกาศนี้ใช่หรือไม่?')) {
      await announcementService.delete(id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        date: new Date(),
        updatedAt: new Date()
      };
      
      if (selectedAnn) {
        await announcementService.update(selectedAnn.id, dataToSave);
      } else {
        await announcementService.create({
          ...dataToSave,
          createdAt: new Date()
        } as any);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error saving announcement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async (ann: Announcement) => {
    try {
      await announcementService.update(ann.id, { isPinned: !ann.isPinned, updatedAt: new Date() });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                          a.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">กำลังโหลดประกาศ...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-black text-slate-800">ประกาศสำคัญ</h2>
        {role === 'Teacher' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            สร้างประกาศ
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาประกาศ..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 shrink-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'All' ? 'ทั้งหมด' : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredAnnouncements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-bold">ไม่พบประกาศ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAnnouncements.map(ann => (
            <div key={ann.id} className={`p-5 rounded-3xl border transition-all ${ann.isPinned ? 'bg-amber-50/50 border-amber-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                    {ann.category || 'General'}
                  </span>
                  <h3 className="text-lg font-black text-slate-800">{ann.title}</h3>
                </div>
                {role === 'Teacher' && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => handleTogglePin(ann)}
                      className={`p-2 rounded-xl transition-all ${ann.isPinned ? 'text-amber-500 bg-amber-100 hover:bg-amber-200' : 'text-slate-400 hover:bg-slate-100'}`}
                      title="ปักหมุด"
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(ann)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(ann.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">
                {ann.content}
              </div>
              
              {ann.attachmentUrl && (
                <a 
                  href={ann.attachmentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all mb-4"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  เอกสารแนบ
                </a>
              )}
              
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-2">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {ann.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {ann.date && format(new Date(ann.date.seconds ? ann.date.seconds * 1000 : ann.date), 'dd MMM yyyy HH:mm', { locale: th })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAnn ? "แก้ไขประกาศ" : "สร้างประกาศ"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">หัวข้อประกาศ</label>
            <input 
              type="text" required 
              value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">หมวดหมู่</label>
              <select
                value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ผู้ประกาศ</label>
              <input 
                type="text" required 
                value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" 
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">รายละเอียด</label>
            <textarea 
              required rows={5}
              value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none resize-none" 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">URL เอกสารแนบ (ทางเลือก)</label>
            <input 
              type="url" 
              value={formData.attachmentUrl} onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })} 
              placeholder="https://"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" 
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกประกาศ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
