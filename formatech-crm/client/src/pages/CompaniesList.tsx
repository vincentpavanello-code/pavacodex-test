import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, Download, Building2 } from 'lucide-react'
import { companiesAPI, exportAPI } from '../api'
import { SECTOR_LABELS, SIZE_LABELS, Sector, CompanySize } from '../types'
import clsx from 'clsx'
import NewCompanyModal from '../components/NewCompanyModal'

export default function CompaniesList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewCompany, setShowNewCompany] = useState(false)

  const search = searchParams.get('search') || ''
  const sector = searchParams.get('sector') || ''
  const size = searchParams.get('size') || ''

  useEffect(() => {
    companiesAPI.getAll({ search, sector, size })
      .then(res => {
        setCompanies(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [search, sector, size])

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
    window.open(exportAPI.companies(), '_blank')
  }

  const handleCreated = () => {
    setShowNewCompany(false)
    companiesAPI.getAll({ search, sector, size }).then(res => setCompanies(res.data))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Entreprises</h1>
        <button onClick={() => setShowNewCompany(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nouvelle Entreprise
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une entreprise, SIREN..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={sector}
            onChange={(e) => updateFilter('sector', e.target.value)}
            className="select w-full sm:w-40"
          >
            <option value="">Tous secteurs</option>
            {Object.entries(SECTOR_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={size}
            onChange={(e) => updateFilter('size', e.target.value)}
            className="select w-full sm:w-40"
          >
            <option value="">Toutes tailles</option>
            {Object.entries(SIZE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download size={20} />
            CSV
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        {companies.length} entreprise{companies.length !== 1 ? 's' : ''} trouvée{companies.length !== 1 ? 's' : ''}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : companies.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">Aucune entreprise trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map(company => (
            <Link
              key={company.id}
              to={`/companies/${company.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="text-primary-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{company.name}</h3>
                  <p className="text-sm text-gray-500">{company.siren}</p>
                  <div className="flex gap-2 mt-2">
                    {company.sector && (
                      <span className="badge badge-blue">
                        {SECTOR_LABELS[company.sector as Sector]}
                      </span>
                    )}
                    {company.size && (
                      <span className="badge badge-gray">
                        {SIZE_LABELS[company.size as CompanySize]}
                      </span>
                    )}
                  </div>
                  {company.city && (
                    <p className="text-xs text-gray-400 mt-2">{company.city}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showNewCompany && (
        <NewCompanyModal
          onClose={() => setShowNewCompany(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
