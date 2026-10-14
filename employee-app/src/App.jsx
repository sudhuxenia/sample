import { useState } from 'react'
import './App.css'

const emptyForm = { code: '', name: '', age: '', gender: '', basicSalary: '' }

function App() {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [employees, setEmployees] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const validate = () => {
    const errs = {}
    if (!form.code.trim()) errs.code = 'Employee code is required'
    else if (employees.some((emp) => emp.code === form.code.trim()))
      errs.code = 'Employee code already exists'
    if (!form.name.trim()) errs.name = 'Name is required'
    const age = Number(form.age)
    if (!form.age) errs.age = 'Age is required'
    else if (!Number.isInteger(age) || age < 18 || age > 65)
      errs.age = 'Age must be between 18 and 65'
    if (!form.gender) errs.gender = 'Select a gender'
    const salary = Number(form.basicSalary)
    if (!form.basicSalary) errs.basicSalary = 'Basic salary is required'
    else if (salary <= 0) errs.basicSalary = 'Salary must be greater than 0'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setEmployees([
      ...employees,
      {
        code: form.code.trim(),
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender,
        basicSalary: Number(form.basicSalary),
      },
    ])
    setForm(emptyForm)
  }

  const handleDelete = (code) => {
    setEmployees(employees.filter((emp) => emp.code !== code))
  }

  return (
    <div className="container">
      <h1>Employee Entry</h1>

      <form onSubmit={handleSubmit} noValidate>
        <label>
          Employee Code
          <input name="code" value={form.code} onChange={handleChange} />
          {errors.code && <span className="error">{errors.code}</span>}
        </label>

        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} />
          {errors.name && <span className="error">{errors.name}</span>}
        </label>

        <label>
          Age
          <input type="number" name="age" value={form.age} onChange={handleChange} />
          {errors.age && <span className="error">{errors.age}</span>}
        </label>

        <fieldset>
          <legend>Gender</legend>
          {['Male', 'Female', 'Other'].map((g) => (
            <label key={g} className="radio">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={form.gender === g}
                onChange={handleChange}
              />
              {g}
            </label>
          ))}
          {errors.gender && <span className="error">{errors.gender}</span>}
        </fieldset>

        <label>
          Basic Salary
          <input
            type="number"
            name="basicSalary"
            value={form.basicSalary}
            onChange={handleChange}
          />
          {errors.basicSalary && <span className="error">{errors.basicSalary}</span>}
        </label>

        <div className="actions">
          <button type="submit">Save</button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setForm(emptyForm)
              setErrors({})
            }}
          >
            Clear
          </button>
        </div>
      </form>

      <h2>Employees ({employees.length})</h2>
      {employees.length === 0 ? (
        <p className="empty">No employees added yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Basic Salary</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.code}>
                <td>{emp.code}</td>
                <td>{emp.name}</td>
                <td>{emp.age}</td>
                <td>{emp.gender}</td>
                <td>{emp.basicSalary.toLocaleString()}</td>
                <td>
                  <button className="danger" onClick={() => handleDelete(emp.code)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
