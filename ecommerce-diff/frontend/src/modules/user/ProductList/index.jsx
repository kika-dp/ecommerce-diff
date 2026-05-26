import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '@services/api';
import { ENDPOINTS } from '@constants/url';
import Helmet from '@components/Helmet';
import ProductCard from '@components/ProductCard';
import Pagination from '@components/Pagination';
import useDebounced from '@hooks/useDebounced';

const SORT_OPTIONS = [
  { value: 'createdAt:DESC', label: 'Newest' },
  { value: 'price:ASC', label: 'Price · low to high' },
  { value: 'price:DESC', label: 'Price · high to low' },
  { value: 'rating:DESC', label: 'Top rated' },
];

const ProductListPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounced(search, 350);
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt:DESC');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [priceMin, setPriceMin] = useState(searchParams.get('minPrice') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('maxPrice') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('minRating') || '0'));

  const heading = useMemo(() => {
    if (slug) return slug[0].toUpperCase() + slug.slice(1);
    return 'All Collections';
  }, [slug]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(ENDPOINTS.PRODUCT_TYPES.ACTIVE);
        setCategories(data.data || []);
      } catch (_e) {}
    })();
  }, []);

  useEffect(() => {
    const [sortBy, sortOrder] = sort.split(':');
    const params = {
      page,
      limit: 12,
      sortBy,
      sortOrder,
      search: debouncedSearch || undefined,
      productTypeSlug: slug || undefined,
      minPrice: priceMin || undefined,
      maxPrice: priceMax || undefined,
      inStock: inStock || undefined,
      minRating: minRating || undefined,
    };
    setLoading(true);
    api
      .get(ENDPOINTS.PRODUCTS.LIST, { params })
      .then((res) => {
        setProducts(res.data.data || []);
        setMeta(res.data.meta || null);
      })
      .finally(() => setLoading(false));

    const sp = new URLSearchParams();
    if (debouncedSearch) sp.set('q', debouncedSearch);
    if (sort !== 'createdAt:DESC') sp.set('sort', sort);
    if (page !== 1) sp.set('page', String(page));
    if (priceMin) sp.set('minPrice', priceMin);
    if (priceMax) sp.set('maxPrice', priceMax);
    if (inStock) sp.set('inStock', 'true');
    if (minRating) sp.set('minRating', String(minRating));
    setSearchParams(sp, { replace: true });
  }, [page, sort, debouncedSearch, slug, priceMin, priceMax, inStock, minRating, setSearchParams]);

  return (
    <>
      <Helmet title={heading} />
      <div style={{ paddingTop: 140 }} className="container">
        <header className="section__head">
          <div>
            <p className="aura-label">Collection</p>
            <h1 className="aura-display-md">{heading}</h1>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              className="field__input"
              placeholder="Search artifacts…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              style={{ minWidth: 260 }}
            />
            <select className="field__select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="shop-grid">
          <aside className="filters surface" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <p className="aura-label" style={{ marginBottom: 12 }}>Categories</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <a className={`chip ${!slug ? 'active' : ''}`} href="/shop">All</a>
                {categories.map((c) => (
                  <a key={c.id} href={`/shop/${c.slug}`} className={`chip ${slug === c.slug ? 'active' : ''}`}>
                    {c.name}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="aura-label" style={{ marginBottom: 12 }}>Price</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  className="field__input"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => {
                    setPage(1);
                    setPriceMin(e.target.value);
                  }}
                />
                <input
                  type="number"
                  className="field__input"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => {
                    setPage(1);
                    setPriceMax(e.target.value);
                  }}
                />
              </div>
            </div>
            <div>
              <p className="aura-label" style={{ marginBottom: 12 }}>Availability</p>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => {
                    setPage(1);
                    setInStock(e.target.checked);
                  }}
                />
                In stock only
              </label>
            </div>
            <div>
              <p className="aura-label" style={{ marginBottom: 12 }}>Rating</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[0, 3, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`chip ${minRating === r ? 'active' : ''}`}
                    onClick={() => {
                      setPage(1);
                      setMinRating(r);
                    }}
                  >
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div>
            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ aspectRatio: '4/5' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">No artifacts match these filters.</div>
            ) : (
              <div className="product-grid">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
            <Pagination meta={meta} onPage={(p) => setPage(p)} />
          </div>
        </div>
      </div>

      <style>{`
        .shop-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .shop-grid { grid-template-columns: 280px 1fr; gap: 40px; }
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }
      `}</style>
    </>
  );
};

export default ProductListPage;
