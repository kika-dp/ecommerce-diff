import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { unwrapMeta } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import Helmet from '@components/Helmet';
import Pagination from '@components/Pagination';
import StatusBadge from '@components/StatusBadge';
import useDebounced from '@hooks/useDebounced';
import { formatDate } from '@utils/format';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search, 300);

  const fetch = async (params = {}) => {
    const res = await api.get(ENDPOINTS.USERS.LIST, { params: { page, limit: 12, search: debounced || undefined, ...params } });
    const { data, meta: m } = unwrapMeta(res);
    setUsers(data);
    setMeta(m);
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debounced]);

  const setStatus = async (id, status) => {
    await api.patch(ENDPOINTS.USERS.STATUS(id), { status });
    toast.success('User updated.');
    fetch();
  };

  const remove = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(ENDPOINTS.USERS.REMOVE(id));
    toast.success('User deleted.');
    fetch();
  };

  return (
    <>
      <Helmet title="Admin · Users" />
      <header className="section__head">
        <div>
          <p className="aura-label">Atelier</p>
          <h1 className="aura-display-md">Users</h1>
        </div>
        <input
          className="field__input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          style={{ maxWidth: 320 }}
        />
      </header>

      <div className="surface" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32 }}>No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td><span className="aura-mono">{u.role}</span></td>
                <td><StatusBadge status={u.status} /></td>
                <td>{formatDate(u.createdAt)}</td>
                <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {u.status === 'active' ? (
                    <button className="btn btn--ghost btn--sm" onClick={() => setStatus(u.id, 'inactive')}>Deactivate</button>
                  ) : (
                    <button className="btn btn--ghost btn--sm" onClick={() => setStatus(u.id, 'active')}>Activate</button>
                  )}
                  <button className="btn btn--ghost btn--sm" onClick={() => remove(u.id)}>Delete</button>
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

export default AdminUsers;
