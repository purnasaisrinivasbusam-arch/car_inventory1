import React, { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate, useParams } from 'react-router-dom'

export default function UserRecordDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const loadUser = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/auth/users/${id}`);
      setUser(res.data.user);
      setFormData(res.data.user);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.response?.data?.message || 'Failed to load user record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await API.put(`/auth/users/${id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        employeeId: formData.employeeId
      });
      setUser(res.data.user);
      setFormData(res.data.user);
      setIsEditing(false);
      alert('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the user ${user.name}? This action cannot be undone.`)) {
      API.delete(`/auth/users/${id}`)
        .then(() => {
          alert('User deleted successfully');
          navigate('/user-records');
        })
        .catch(err => {
          console.error('Error deleting user:', err);
          alert(err.response?.data?.message || 'Failed to delete user');
        });
    }
  };

  if (loading) return <div className="alert alert-info">Loading user record...</div>;
  if (error && !user) return <div className="alert alert-danger">{error}</div>;
  if (!user) return <div className="alert alert-warning">User not found</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Record Details</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/user-records')}
        >
          <i className="bi bi-arrow-left me-2"></i>Back to Records
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{user.name}</h5>
            <div className="d-flex gap-2">
              {!isEditing && (
                <>
                  <button
                    className="btn btn-warning btn-lg"
                    onClick={() => setIsEditing(true)}
                    title="Click to edit user information"
                    style={{ minWidth: '120px' }}
                  >
                    <i className="bi bi-pencil me-2"></i>Edit
                  </button>
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={handleDelete}
                    title="Click to delete this user permanently"
                    style={{ minWidth: '120px' }}
                  >
                    <i className="bi bi-trash me-2"></i>Delete
                  </button>
                </>
              )}
              {isEditing && (
                <>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={handleSave}
                    disabled={saving}
                    title="Click to save changes"
                    style={{ minWidth: '120px' }}
                  >
                    <i className="bi bi-check me-2"></i>{saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="btn btn-secondary btn-lg"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(user);
                    }}
                    disabled={saving}
                    title="Click to cancel editing"
                    style={{ minWidth: '120px' }}
                  >
                    <i className="bi bi-x me-2"></i>Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card-body">
          {isEditing ? (
            <form onSubmit={handleSave}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    name="employeeId"
                    value={formData.employeeId || ''}
                    onChange={handleInputChange}
                    maxLength="16"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.role || ''}
                    disabled
                  />
                </div>
              </div>
            </form>
          ) : (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <p className="form-control-plaintext">{user.firstName}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <p className="form-control-plaintext">{user.lastName}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <p className="form-control-plaintext">{user.email}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <p className="form-control-plaintext">{user.phone}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Employee ID</label>
                  <p className="form-control-plaintext">{user.employeeId}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <p className="form-control-plaintext">
                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                      {user.role}
                    </span>
                  </p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Registered On</label>
                  <p className="form-control-plaintext">{new Date(user.createdAt).toLocaleString()}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Updated</label>
                  <p className="form-control-plaintext">{new Date(user.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <hr className="my-4" />

              <div className="bg-light p-3 rounded">
                <h6 className="mb-3">
                  <i className="bi bi-info-circle me-2"></i>Available Actions
                </h6>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-pencil text-warning" style={{ fontSize: '20px' }}></i>
                      <div>
                        <strong>Edit</strong>
                        <p className="small text-muted mb-0">Modify user information (name, email, phone, employee ID)</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-trash text-danger" style={{ fontSize: '20px' }}></i>
                      <div>
                        <strong>Delete</strong>
                        <p className="small text-muted mb-0">Permanently remove this user from the system</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
