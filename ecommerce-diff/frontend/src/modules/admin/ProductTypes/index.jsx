import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import Helmet from '@components/Helmet';

const empty = { name: '', description: '', bannerUrl: '', isActive: true };

const AdminProductTypes = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const res = await api.get(ENDPOINTS.PRODUCT_TYPES.LIST, { params: { limit: 50 } });
    setItems(unwrap(res) || []);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(ENDPOINTS.PRODUCT_TYPES.ONE(editingId), form);
        toast.success('Category updated.');
      } else {
        await api.post(ENDPOINTS.PRODUCT_TYPES.LIST, form);
        toast.success('Category created.');
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save');
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, description: item.description || '', bannerUrl: item.bannerUrl || '', isActive: item.isActive });
  };

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(ENDPOINTS.PRODUCT_TYPES.ONE(id));
    toast.success('Category deleted.');
    load();
  };

  return (
    <>
      <Helmet title="Admin · Categories" />
      <header className="section__head">
        <div>
          <p className="aura-label">Atelier</p>
          <h1 className="aura-display-md">Categories</h1>
        </div>
      </header>
      <div className="cat-grid">
        <form onSubmit={onSubmit} className="surface" style={{ padding: 24, display: 'grid', gap: 16, height: 'fit-content' }}>
          <h3 className="aura-headline">{editingId ? 'Edit category' : 'New category'}</h3>
          <div className="field">
            <label className="field__label">Name</label>
            <input className="field__input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Description</label>
            <textarea className="field__textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Banner URL</label>
            <input className="field__input" value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} />
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn--primary">{editingId ? 'Save' : 'Create'}</button>
            {editingId && <button type="button" className="btn btn--ghost" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>

        <div className="surface" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Slug</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td><span className="aura-mono">{c.slug}</span></td>
                  <td><span className={`badge badge--${c.isActive ? 'active' : 'inactive'}`}>{c.isActive ? 'active' : 'inactive'}</span></td>
                  <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => edit(c)}>Edit</button>
                    <button className="btn btn--ghost btn--sm" onClick={() => remove(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .cat-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1024px) { .cat-grid { grid-template-columns: 380px 1fr; gap: 32px; } }
      `}</style>
    </>
  );
};

export default AdminProductTypes;
