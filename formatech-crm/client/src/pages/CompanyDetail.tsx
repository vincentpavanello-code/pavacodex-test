import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Building2, User, Globe, MapPin, Euro, FileText } from 'lucide-react'
import { companiesAPI } from '../api'
import { formatCurrency, formatDate, getStageColor } from '../utils/format'
import { SECTOR_LABELS, SIZE_LABELS, OPCO_LABELS, STAGE_LABELS, Sector, CompanySize, OPCO, DealStage } from '../types'

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    companiesAPI.getById(id)
      .then(res => {
        setCompany(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Entreprise non trouvée</p>
        <Link to="/companies" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/companies')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 className="text-primary-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-500">{company.siren}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Informations générales</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Secteur:</span>
                <span className="ml-2 font-medium">{SECTOR_LABELS[company.sector as Sector] || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Taille:</span>
                <span className="ml-2 font-medium">{SIZE_LABELS[company.size as CompanySize] || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">OPCO:</span>
                <span className="ml-2 font-medium">{OPCO_LABELS[company.opco as OPCO] || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">CA estimé:</span>
                <span className="ml-2 font-medium">{company.estimated_revenue ? formatCurrency(company.estimated_revenue) : '-'}</span>
              </div>
              {company.collective_agreement && (
                <div className="col-span-2">
                  <span className="text-gray-500">Convention collective:</span>
                  <span className="ml-2">{company.collective_agreement}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contacts */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Contacts ({company.contacts?.length || 0})</h2>
            {company.contacts?.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun contact</p>
            ) : (
              <div className="space-y-3">
                {company.contacts?.map((contact: any) => (
                  <Link
                    key={contact.id}
                    to={`/contacts/${contact.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {contact.civility} {contact.first_name} {contact.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{contact.function}</p>
                    </div>
                    {contact.is_decision_maker === 'oui' && (
                      <span className="badge badge-green">Décideur</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Deals */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Deals ({company.deals?.length || 0})</h2>
            {company.deals?.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun deal</p>
            ) : (
              <div className="space-y-3">
                {company.deals?.map((deal: any) => (
                  <Link
                    key={deal.id}
                    to={`/deals/${deal.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <span className={`badge ${getStageColor(deal.stage)}`}>
                        {STAGE_LABELS[deal.stage as DealStage]}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {deal.user_first_name} {deal.user_last_name} - {formatDate(deal.created_at)}
                      </p>
                    </div>
                    <span className="font-medium text-primary-600">
                      {formatCurrency(deal.current_amount || 0)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={18} />
              Adresse
            </h3>
            <div className="text-sm text-gray-600">
              {company.address && <p>{company.address}</p>}
              <p>{company.postal_code} {company.city}</p>
            </div>
          </div>

          {company.website && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Globe size={18} />
                Site web
              </h3>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700 break-all"
              >
                {company.website}
              </a>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={18} />
              Métadonnées
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Créé le: {formatDate(company.created_at)}</p>
              <p>Modifié le: {formatDate(company.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
