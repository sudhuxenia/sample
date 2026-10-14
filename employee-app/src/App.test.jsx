import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

async function addEmployee(user, { code, name, age, gender, salary }) {
  await user.type(screen.getByLabelText('Employee Code'), code)
  await user.type(screen.getByLabelText('Name'), name)
  await user.type(screen.getByLabelText('Age'), age)
  await user.click(screen.getByLabelText(gender))
  await user.type(screen.getByLabelText('Basic Salary'), salary)
  await user.click(screen.getByRole('button', { name: 'Save' }))
}

const sample = { code: 'E001', name: 'Asha', age: '30', gender: 'Female', salary: '50000' }

describe('Employee form', () => {
  it('shows errors when submitted empty', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Employee code is required')).toBeInTheDocument()
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Age is required')).toBeInTheDocument()
    expect(screen.getByText('Select a gender')).toBeInTheDocument()
    expect(screen.getByText('Basic salary is required')).toBeInTheDocument()
  })

  it('rejects an age outside 18-65', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addEmployee(user, { ...sample, age: '15' })

    expect(screen.getByText('Age must be between 18 and 65')).toBeInTheDocument()
    expect(screen.getByText('No employees added yet.')).toBeInTheDocument()
  })

  it('adds a valid employee to the table and clears the form', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addEmployee(user, sample)

    const row = screen.getByRole('row', { name: /E001/ })
    expect(within(row).getByText('Asha')).toBeInTheDocument()
    expect(within(row).getByText('Female')).toBeInTheDocument()
    expect(screen.getByLabelText('Employee Code')).toHaveValue('')
  })

  it('rejects a duplicate employee code', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addEmployee(user, sample)
    await addEmployee(user, { ...sample, name: 'Ravi', gender: 'Male' })

    expect(screen.getByText('Employee code already exists')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(2) // header + 1 employee
  })

  it('deletes an employee', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addEmployee(user, sample)
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByText('No employees added yet.')).toBeInTheDocument()
  })
})
