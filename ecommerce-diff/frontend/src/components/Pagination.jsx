const Pagination = ({ meta, onPage }) => {
  if (!meta || meta.totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= meta.totalPages; i += 1) pages.push(i);

  return (
    <nav style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }} aria-label="pagination">
      <button
        className="btn btn--ghost btn--sm"
        disabled={!meta.hasPrev}
        onClick={() => onPage(meta.page - 1)}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`chip ${p === meta.page ? 'active' : ''}`}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="btn btn--ghost btn--sm"
        disabled={!meta.hasNext}
        onClick={() => onPage(meta.page + 1)}
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
