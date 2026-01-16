'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Loader2 } from 'lucide-react'

export default function NewCompanyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: '',
    size: '',
    description: '',
    linkedinUrl: '',
    priority: 'MEDIUM',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const company = await res.json()
        router.push(`/companies/${company.id}`)
      } else {
        const error = await res.json()
        alert(error.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/companies"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux entreprises
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle entreprise</h1>
            <p className="text-gray-500">Ajoutez une entreprise à cibler</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="card-body space-y-6">
          {/* Nom */}
          <div>
            <label className="form-label">
              Nom de l'entreprise <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: TotalEnergies, BNP Paribas..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Website & LinkedIn */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Site web</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://www.example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Page LinkedIn</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://www.linkedin.com/company/..."
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Secteur & Taille */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Secteur d'activité</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Banque, Énergie, Tech..."
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Taille</label>
              <select
                className="form-select"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              >
                <option value="">Sélectionner</option>
                <option value="1-50">1-50 employés</option>
                <option value="51-200">51-200 employés</option>
                <option value="201-500">201-500 employés</option>
                <option value="501-1000">501-1000 employés</option>
                <option value="1000+">1000+ employés</option>
              </select>
            </div>
          </div>

          {/* Priorité */}
          <div>
            <label className="form-label">Priorité</label>
            <div className="flex gap-4">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => (
                <label key={priority} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">
                    {priority === 'LOW' && 'Basse'}
                    {priority === 'MEDIUM' && 'Moyenne'}
                    {priority === 'HIGH' && 'Haute'}
                    {priority === 'CRITICAL' && 'Critique'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Description de l'entreprise, contexte..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Notes internes</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Notes pour le suivi..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <Link href="/companies" className="btn-secondary">
            Annuler
          </Link>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              'Créer l\'entreprise'
            )}
          </button>
        </div>
      </form>

      {/* Tip */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>💡 Astuce :</strong> Après avoir créé l'entreprise, vous pourrez utiliser
          l'enrichissement Apollo.io pour trouver automatiquement les contacts décideurs
          (Responsables Formation, DRH, L&D Managers...).
        </p>
      </div>
    </div>
  )
}
