import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { unwrap, unwrapMeta } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import Helmet from '@components/Helmet';
import Pagination from '@components/Pagination';
import { formatPrice } from '@utils/format';
import { ROUTES } from '@routes/routesConstants';

export const AdminProducts = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const load = async () => {
    const res = await api.get(ENDPOINTS.PRODUCTS.LIST, { params: { page, limit: 12, search: search || undefined } });
    const { data, meta: m } = unwrapMeta(res);
    setItems(data || []);
    setMeta(m);
  };

  useEffect(() => { load(); }, [page]);

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(ENDPOINTS.PRODUCTS.ONE(id));
    toast.success('Product deleted.');
    load();
  };

  return (
    <>
      <Helmet title="Admin · Products" />
      <header className="section__head">
        <div>
          <p className="aura-label">Atelier</p>
          <h1 className="aura-display-md">Products</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            className="field__input"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            style={{ maxWidth: 280 }}
          />
          <Link to={ROUTES.ADMIN.PRODUCT_NEW} className="btn btn--primary btn--sm">+ New Product</Link>
        </div>
      </header>

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th></th><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32 }}>No products yet.</td></tr>
            ) : items.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.images?.[0]?.url && (
                    <img src={p.images[0].url} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                  )}
                </td>
                <td>{p.name}</td>
                <td><span className="aura-mono">{p.sku}</span></td>
                <td>{p.productType?.name}</td>
                <td>{formatPrice(p.price)}</td>
                <td>{p.stock}</td>
                <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Link to={`${ROUTES.ADMIN.PRODUCTS}/${p.id}`} className="btn btn--ghost btn--sm">Edit</Link>
                  <button className="btn btn--ghost btn--sm" onClick={() => remove(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={meta} onPage={(p) => setPage(p)} />
    </>
  );
};

const emptyProduct = {
  name: '',
  sku: '',
  shortDescription: '',
  description: '',
  brand: '',
  price: '',
  compareAtPrice: '',
  stock: 0,
  productTypeId: '',
  isActive: true,
  isFeatured: false,
  isTrending: false,
  isBestseller: false,
  images: [{ url: '', alt: '', isPrimary: true }],
  variants: [],
};

export const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyProduct);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get(ENDPOINTS.PRODUCT_TYPES.ACTIVE).then((res) => setCategories(unwrap(res) || []));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(ENDPOINTS.PRODUCTS.ONE(id)).then((res) => {
      const p = unwrap(res);
      setForm({
        name: p.name,
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description,
        brand: p.brand || '',
        price: p.price,
        compareAtPrice: p.compareAtPrice || '',
        stock: p.stock,
        productTypeId: p.productTypeId,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isTrending: p.isTrending,
        isBestseller: p.isBestseller,
        images: p.images.map((i) => ({ url: i.url, alt: i.alt, isPrimary: i.isPrimary, position: i.position })),
        variants: p.variants.map((v) => ({ name: v.name, sku: v.sku, priceOverride: v.priceOverride, stock: v.stock, attributes: v.attributes })),
      });
    });
  }, [id, isEdit]);

  const setImage = (idx, key, value) => {
    const next = [...form.images];
    next[idx] = { ...next[idx], [key]: value };
    setForm({ ...form, images: next });
  };

  const addImage = () => setForm({ ...form, images: [...form.images, { url: '', alt: '', isPrimary: false }] });
  const removeImage = (idx) => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });

  const setVariant = (idx, key, value) => {
    const next = [...form.variants];
    next[idx] = { ...next[idx], [key]: value };
    setForm({ ...form, variants: next });
  };
  const addVariant = () => setForm({ ...form, variants: [...form.variants, { name: '', sku: '', priceOverride: '', stock: 0, attributes: {} }] });
  const removeVariant = (idx) => setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: String(form.price),
        compareAtPrice: form.compareAtPrice ? String(form.compareAtPrice) : undefined,
        variants: form.variants.length ? form.variants : undefined,
      };
      if (isEdit) {
        await api.patch(ENDPOINTS.PRODUCTS.ONE(id), payload);
        toast.success('Product updated.');
      } else {
        await api.post(ENDPOINTS.PRODUCTS.LIST, payload);
        toast.success('Product created.');
      }
      navigate(ROUTES.ADMIN.PRODUCTS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save');
    }
  };

  return (
    <>
      <Helmet title={isEdit ? 'Edit product' : 'New product'} />
      <header className="section__head">
        <div>
          <p className="aura-label">{isEdit ? 'Edit' : 'New'}</p>
          <h1 className="aura-display-md">{isEdit ? form.name || 'Product' : 'New product'}</h1>
        </div>
        <Link to={ROUTES.ADMIN.PRODUCTS} className="btn btn--ghost btn--sm">Back</Link>
      </header>

      <form onSubmit={onSubmit} className="surface" style={{ padding: 32, display: 'grid', gap: 16 }}>
        <div className="form-row">
          <div className="field">
            <label className="field__label">Name</label>
            <input className="field__input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">SKU</label>
            <input className="field__input" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field__label">Brand</label>
            <input className="field__input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Category</label>
            <select className="field__select" required value={form.productTypeId} onChange={(e) => setForm({ ...form, productTypeId: e.target.value })}>
              <option value="">Select…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label className="field__label">Short description</label>
          <input className="field__input" required value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
        </div>
        <div className="field">
          <label className="field__label">Description</label>
          <textarea className="field__textarea" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field__label">Price</label>
            <input className="field__input" required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Compare at price</label>
            <input className="field__input" type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Stock</label>
            <input className="field__input" required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value || '0', 10) })} />
          </div>
        </div>

        <fieldset style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <legend className="aura-label">Images</legend>
          {form.images.map((img, idx) => (
            <div key={idx} className="form-row" style={{ marginBottom: 12 }}>
              <input className="field__input" required placeholder="URL" value={img.url} onChange={(e) => setImage(idx, 'url', e.target.value)} />
              <input className="field__input" placeholder="Alt text" value={img.alt || ''} onChange={(e) => setImage(idx, 'alt', e.target.value)} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={img.isPrimary} onChange={(e) => setImage(idx, 'isPrimary', e.target.checked)} /> Primary
              </label>
              {form.images.length > 1 && <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeImage(idx)}>Remove</button>}
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={addImage}>+ Add image</button>
        </fieldset>

        <fieldset style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <legend className="aura-label">Variants (optional)</legend>
          {form.variants.map((v, idx) => (
            <div key={idx} className="form-row" style={{ marginBottom: 12 }}>
              <input className="field__input" placeholder="Name (e.g. 42 EU)" value={v.name} onChange={(e) => setVariant(idx, 'name', e.target.value)} />
              <input className="field__input" placeholder="SKU" value={v.sku} onChange={(e) => setVariant(idx, 'sku', e.target.value)} />
              <input className="field__input" placeholder="Price override" value={v.priceOverride || ''} onChange={(e) => setVariant(idx, 'priceOverride', e.target.value)} />
              <input className="field__input" type="number" placeholder="Stock" value={v.stock} onChange={(e) => setVariant(idx, 'stock', parseInt(e.target.value || '0', 10))} />
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeVariant(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={addVariant}>+ Add variant</button>
        </fieldset>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          <label><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
          <label><input type="checkbox" checked={form.isTrending} onChange={(e) => setForm({ ...form, isTrending: e.target.checked })} /> Trending</label>
          <label><input type="checkbox" checked={form.isBestseller} onChange={(e) => setForm({ ...form, isBestseller: e.target.checked })} /> Bestseller</label>
        </div>

        <div>
          <button type="submit" className="btn btn--primary">{isEdit ? 'Save changes' : 'Create product'}</button>
        </div>
      </form>

      <style>{`
        .form-row { display: grid; grid-template-columns: 1fr; gap: 12px; align-items: end; }
        @media (min-width: 768px) {
          .form-row { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
      `}</style>
    </>
  );
};

export default AdminProducts;
