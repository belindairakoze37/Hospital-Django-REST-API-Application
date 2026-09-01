import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiRequest('/departments/');

      setDepartments(data.results || data);
    } catch (error) {
      console.error(error);
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading departments...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>Departments</h1>

      {departments.length === 0 ? (
        <p>No departments found.</p>
      ) : (
        departments.map((department) => (
          <div key={department.id}>
            <h3>{department.dept_name}</h3>
            <p>Floor: {department.floor_number}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Departments;