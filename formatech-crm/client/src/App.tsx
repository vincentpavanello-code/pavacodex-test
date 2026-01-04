import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DealsList from './pages/DealsList'
import DealDetail from './pages/DealDetail'
import CompaniesList from './pages/CompaniesList'
import CompanyDetail from './pages/CompanyDetail'
import ContactsList from './pages/ContactsList'
import ContactDetail from './pages/ContactDetail'
import Team from './pages/Team'
import Reminders from './pages/Reminders'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="deals" element={<DealsList />} />
          <Route path="deals/:id" element={<DealDetail />} />
          <Route path="companies" element={<CompaniesList />} />
          <Route path="companies/:id" element={<CompanyDetail />} />
          <Route path="contacts" element={<ContactsList />} />
          <Route path="contacts/:id" element={<ContactDetail />} />
          <Route path="team" element={<Team />} />
          <Route path="reminders" element={<Reminders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
