import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, Download, User } from 'lucide-react'
import { contactsAPI, exportAPI } from '../api'
import NewContactModal from '../components/NewContactModal'

export default function ContactsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewContact, setShowNewContact] = useState(false)

  const search = searchParams.get('search') || ''

  useEffect(() => {
    contactsAPI.getAll({ search })
      .then(res => {
        setContacts(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [search])

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const handleExport = () => {
    window.open(exportAPI.contacts(), '_blank')
  }

  const handleCreated = () => {
    setShowNewContact(false)
    contactsAPI.getAll({ search }).then(res => setContacts(res.data))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <button onClick={() => setShowNewContact(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nouveau Contact
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un contact, email..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input pl-10"
            />
          </div>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download size={20} />
            CSV
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        {contacts.length} contact{contacts.length !== 1 ? 's' : ''} trouvé{contacts.length !== 1 ? 's' : ''}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="card text-center py-12">
          <User className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">Aucun contact trouvé</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Nom</th>
                <th className="table-header">Fonction</th>
                <th className="table-header">Email</th>
                <th className="table-header">Téléphone</th>
                <th className="table-header">Entreprise</th>
                <th className="table-header">Décideur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <Link
                      to={`/contacts/${contact.id}`}
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {contact.civility} {contact.first_name} {contact.last_name}
                    </Link>
                  </td>
                  <td className="table-cell text-gray-600">{contact.function || '-'}</td>
                  <td className="table-cell text-gray-600">{contact.email || '-'}</td>
                  <td className="table-cell text-gray-600">{contact.phone_mobile || contact.phone_fixed || '-'}</td>
                  <td className="table-cell">
                    {contact.company_name ? (
                      <Link
                        to={`/companies/${contact.company_id}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {contact.company_name}
                      </Link>
                    ) : '-'}
                  </td>
                  <td className="table-cell">
                    {contact.is_decision_maker === 'oui' && <span className="badge badge-green">Oui</span>}
                    {contact.is_decision_maker === 'non' && <span className="badge badge-gray">Non</span>}
                    {contact.is_decision_maker === 'a_confirmer' && <span className="badge badge-yellow">?</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNewContact && (
        <NewContactModal
          onClose={() => setShowNewContact(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
