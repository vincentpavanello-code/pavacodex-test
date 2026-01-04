import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Building2, Mail, Phone, Linkedin, FileText } from 'lucide-react'
import { contactsAPI } from '../api'
import { formatDate, formatRelativeTime } from '../utils/format'

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    contactsAPI.getById(id)
      .then(res => {
        setContact(res.data)
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

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Contact non trouvé</p>
        <Link to="/contacts" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/contacts')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="text-primary-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {contact.civility} {contact.first_name} {contact.last_name}
            </h1>
            <p className="text-gray-500">{contact.function}</p>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {contact.is_decision_maker === 'oui' && (
            <span className="badge badge-green">Décideur</span>
          )}
          {contact.is_signatory && (
            <span className="badge badge-blue">Signataire</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact info */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Coordonnées</h2>
            <div className="space-y-3">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
                  <Mail size={18} />
                  {contact.email}
                </a>
              )}
              {contact.phone_fixed && (
                <a href={`tel:${contact.phone_fixed}`} className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
                  <Phone size={18} />
                  {contact.phone_fixed} (fixe)
                </a>
              )}
              {contact.phone_mobile && (
                <a href={`tel:${contact.phone_mobile}`} className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
                  <Phone size={18} />
                  {contact.phone_mobile} (mobile)
                </a>
              )}
              {contact.linkedin_url && (
                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
                  <Linkedin size={18} />
                  Profil LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* Activities */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Historique des interactions</h2>
            {contact.activities?.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune interaction enregistrée</p>
            ) : (
              <div className="space-y-3">
                {contact.activities?.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                      <FileText size={14} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Company */}
          {contact.company_id && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 size={18} />
                Entreprise
              </h3>
              <Link
                to={`/companies/${contact.company_id}`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {contact.company_name}
              </Link>
            </div>
          )}

          {/* Metadata */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={18} />
              Métadonnées
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Créé le: {formatDate(contact.created_at)}</p>
              <p>Modifié le: {formatDate(contact.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
