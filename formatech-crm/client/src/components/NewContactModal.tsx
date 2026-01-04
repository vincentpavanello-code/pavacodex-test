import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { contactsAPI, companiesAPI } from '../api'

interface Props {
  onClose: () => void
  onCreated: () => void
  companyId?: string
}

export default function NewContactModal({ onClose, onCreated, companyId }: Props) {
  const [companies, setCompanies] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    civility: 'M.',
    first_name: '',
    last_name: '',
    function: '',
    email: '',
    phone_fixed: '',
    phone_mobile: '',
    linkedin_url: '',
    is_decision_maker: 'a_confirmer',
    is_signatory: false,
    company_id: companyId || '',
    notes: ''
  })

  useEffect(() => {
    companiesAPI.getAll()
      .then(res => setCompanies(res.data))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.first_name || !formData.last_name) {
      setError('Le prénom et le nom sont obligatoires')
      return
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Format d\'email invalide')
      return
    }

    setSaving(true)
    try {
      await contactsAPI.create(formData)
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
          <h2 className="text-xl font-semibold text-gray-900">Nouveau Contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="label">Civilité</label>
              <select
                value={formData.civility}
                onChange={(e) => setFormData({ ...formData, civility: e.target.value })}
                className="select"
              >
                <option value="M.">M.</option>
                <option value="Mme">Mme</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="label">Prénom *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Nom *</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Fonction</label>
            <input
              type="text"
              value={formData.function}
              onChange={(e) => setFormData({ ...formData, function: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Téléphone fixe</label>
              <input
                type="tel"
                value={formData.phone_fixed}
                onChange={(e) => setFormData({ ...formData, phone_fixed: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Téléphone mobile</label>
              <input
                type="tel"
                value={formData.phone_mobile}
                onChange={(e) => setFormData({ ...formData, phone_mobile: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className="input"
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div>
            <label className="label">Entreprise</label>
            <select
              value={formData.company_id}
              onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
              className="select"
            >
              <option value="">Aucune</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Décideur ?</label>
              <select
                value={formData.is_decision_maker}
                onChange={(e) => setFormData({ ...formData, is_decision_maker: e.target.value })}
                className="select"
              >
                <option value="a_confirmer">À confirmer</option>
                <option value="oui">Oui</option>
                <option value="non">Non</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_signatory}
                  onChange={(e) => setFormData({ ...formData, is_signatory: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Signataire</span>
              </label>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
