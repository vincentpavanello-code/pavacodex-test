import { useState } from 'react'
import { X } from 'lucide-react'
import { companiesAPI } from '../api'
import { SECTOR_LABELS, SIZE_LABELS, OPCO_LABELS } from '../types'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function NewCompanyModal({ onClose, onCreated }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    siren: '',
    sector: '',
    size: 'pme',
    address: '',
    city: '',
    postal_code: '',
    website: '',
    estimated_revenue: '',
    collective_agreement: '',
    opco: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name) {
      setError('La raison sociale est obligatoire')
      return
    }

    if (formData.siren && !/^\d{9}$/.test(formData.siren)) {
      setError('Le SIREN doit contenir 9 chiffres')
      return
    }

    setSaving(true)
    try {
      await companiesAPI.create({
        ...formData,
        estimated_revenue: formData.estimated_revenue ? parseInt(formData.estimated_revenue) : null
      })
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
          <h2 className="text-xl font-semibold text-gray-900">Nouvelle Entreprise</h2>
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

          <div>
            <label className="label">Raison sociale *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">SIREN (9 chiffres)</label>
              <input
                type="text"
                value={formData.siren}
                onChange={(e) => setFormData({ ...formData, siren: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                className="input"
                placeholder="123456789"
              />
            </div>
            <div>
              <label className="label">Secteur</label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="select"
              >
                <option value="">Sélectionner</option>
                {Object.entries(SECTOR_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Taille</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="select"
              >
                {Object.entries(SIZE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">OPCO</label>
              <select
                value={formData.opco}
                onChange={(e) => setFormData({ ...formData, opco: e.target.value })}
                className="select"
              >
                <option value="">Sélectionner</option>
                {Object.entries(OPCO_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Adresse</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Code postal</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Site web</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="input"
              placeholder="https://"
            />
          </div>

          <div>
            <label className="label">CA estimé (EUR)</label>
            <input
              type="number"
              value={formData.estimated_revenue}
              onChange={(e) => setFormData({ ...formData, estimated_revenue: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Convention collective</label>
            <input
              type="text"
              value={formData.collective_agreement}
              onChange={(e) => setFormData({ ...formData, collective_agreement: e.target.value })}
              className="input"
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
