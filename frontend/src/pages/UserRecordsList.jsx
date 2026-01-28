import React, { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function UserRecordsList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load user records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the user ${name}? This action cannot be undone.`)) {
      try {
        await API.delete(`/auth/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        alert('User deleted successfully');
      } catch (err) {
        console.error('Error deleting user:', err);
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/user-records/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/user-records/${id}/edit`);
  };

  const handleExportToExcel = () => {
    if (filteredUsers.length === 0) {
      alert('No user records to export');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Employee ID', 'Role', 'Registered On'];
    const rows = filteredUsers.map(user => [
      user.name,
      user.email,
      user.phone,
      user.employeeId,
      user.role,
      new Date(user.createdAt).toLocaleString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user_records_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.employeeId?.includes(searchTerm)
  );

  if (loading) return <div className="alert alert-info">Loading user records...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Records (Registrations)</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/admin')}
        >
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3 d-flex gap-2 align-items-center">
        <button 
          className="btn btn-success"
          onClick={handleExportToExcel}
          disabled={filteredUsers.length === 0}
        >
          <i className="bi bi-download me-2"></i>Export to Excel
        </button>
        <small className="text-muted">Export filtered user records as Excel file</small>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, phone, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <small className="text-muted">Total users: {filteredUsers.length}</small>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="alert alert-warning">No user records found</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Employee ID</th>
                <th>Role</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.employeeId}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <small>{new Date(user.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-sm btn-info text-white"
                        onClick={() => handleViewDetails(user._id)}
                        title="View full user details"
                        style={{ minWidth: '90px' }}
                      >
                        <i className="bi bi-eye me-1"></i>View
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(user._id)}
                        title="Edit user information"
                        style={{ minWidth: '90px' }}
                      >
                        <i className="bi bi-pencil me-1"></i>Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user._id, user.name)}
                        title="Delete this user"
                        style={{ minWidth: '90px' }}
                      >
                        <i className="bi bi-trash me-1"></i>Delete
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
  );
}
