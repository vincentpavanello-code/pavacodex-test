import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { dealsAPI, companiesAPI, contactsAPI, usersAPI } from '../api'
import { SOURCE_LABELS } from '../types'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function NewDealModal({ onClose, onCreated }: Props) {
  const [companies, setCompanies] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    company_id: '',
    contact_id: '',
    user_id: '',
    source: '',
    source_details: '',
    how_did_they_find_us: '',
    expected_close_date: ''
  })

  useEffect(() => {
    Promise.all([
      companiesAPI.getAll(),
      contactsAPI.getAll(),
      usersAPI.getAll()
    ])
      .then(([compRes, contRes, usersRes]) => {
        setCompanies(compRes.data)
        setContacts(contRes.data)
        setUsers(usersRes.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Erreur lors du chargement des données')
        setLoading(false)
      })
  }, [])

  // Filter contacts by selected company
  const filteredContacts = formData.company_id
    ? contacts.filter(c => c.company_id === formData.company_id)
    : contacts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.company_id || !formData.contact_id || !formData.user_id || !formData.source) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)
    try {
      await dealsAPI.create(formData)
      onCreated()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nouveau Deal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">Entreprise *</label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value, contact_id: '' })}
                className="select"
                required
              >
                <option value="">Sélectionner une entreprise</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Contact *</label>
              <select
                value={formData.contact_id}
                onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                className="select"
                required
                disabled={!formData.company_id}
              >
                <option value="">Sélectionner un contact</option>
                {filteredContacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name} - {contact.function}
                  </option>
                ))}
              </select>
              {formData.company_id && filteredContacts.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Aucun contact pour cette entreprise
                </p>
              )}
            </div>

            <div>
              <label className="label">Commercial assigné *</label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="select"
                required
              >
                <option value="">Sélectionner un commercial</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Source du lead *</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="select"
                required
              >
                <option value="">Sélectionner une source</option>
                {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {(formData.source === 'recommandation' || formData.source === 'salon' || formData.source === 'autre') && (
              <div>
                <label className="label">Précisions sur la source</label>
                <input
                  type="text"
                  value={formData.source_details}
                  onChange={(e) => setFormData({ ...formData, source_details: e.target.value })}
                  className="input"
                  placeholder={formData.source === 'recommandation' ? 'Qui a recommandé ?' : 'Précisez...'}
                />
              </div>
            )}

            <div>
              <label className="label">Comment nous a-t-il connu ?</label>
              <textarea
                value={formData.how_did_they_find_us}
                onChange={(e) => setFormData({ ...formData, how_did_they_find_us: e.target.value })}
                className="input"
                rows={2}
                placeholder="Détails supplémentaires..."
              />
            </div>

            <div>
              <label className="label">Date de closing prévue</label>
              <input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                className="input"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Création...' : 'Créer le deal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
