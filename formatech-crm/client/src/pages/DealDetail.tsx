import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Building2, User, Phone, Mail, Calendar, FileText,
  ChevronRight, ChevronLeft, AlertTriangle, CheckCircle, XCircle,
  Plus, Clock, Euro, Percent
} from 'lucide-react'
import { dealsAPI, activitiesAPI, usersAPI } from '../api'
import { formatCurrency, formatDate, formatDateTime, formatRelativeTime, getStageColor } from '../utils/format'
import {
  STAGE_LABELS, STAGE_ORDER, SOURCE_LABELS, OFFER_LABELS, TIMING_LABELS,
  SIZE_LABELS, DealStage
} from '../types'
import clsx from 'clsx'

export default function DealDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deal, setDeal] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('current')
  const [error, setError] = useState('')

  // Form states for different stages
  const [qualForm, setQualForm] = useState<any>({})
  const [demoForm, setDemoForm] = useState<any>({})
  const [propForm, setPropForm] = useState<any>({})
  const [negoNote, setNegoNote] = useState('')
  const [negoAmount, setNegoAmount] = useState<any>({})
  const [wonForm, setWonForm] = useState<any>({})
  const [lostForm, setLostForm] = useState<any>({})
  const [activityForm, setActivityForm] = useState({ type: 'note', description: '' })

  useEffect(() => {
    if (!id) return
    Promise.all([
      dealsAPI.getById(id),
      usersAPI.getAll()
    ])
      .then(([dealRes, usersRes]) => {
        const d = dealRes.data
        setDeal(d)
        setUsers(usersRes.data)

        // Initialize forms with existing data
        setQualForm({
          qual_budget_identified: d.qual_budget_identified || 1,
          qual_decision_maker_identified: d.qual_decision_maker_identified || 1,
          qual_timing: d.qual_timing || 'flou',
          qual_real_need_expressed: d.qual_real_need_expressed || 1,
          qual_company_size: d.qual_company_size || 'pme'
        })
        setDemoForm({
          demo_date: d.demo_date || '',
          demo_participants: d.demo_participants || '',
          demo_duration: d.demo_duration || 60,
          demo_client_context: d.demo_client_context || '',
          demo_needs_expressed: d.demo_needs_expressed || '',
          demo_objections_raised: d.demo_objections_raised || '',
          demo_next_steps: d.demo_next_steps || '',
          demo_decision_maker_present: d.demo_decision_maker_present || false
        })
        setPropForm({
          prop_sent_date: d.prop_sent_date || new Date().toISOString().split('T')[0],
          prop_offer_type: d.prop_offer_type || 'starter',
          prop_amount: d.prop_amount || 1500,
          prop_participants_count: d.prop_participants_count || 8,
          prop_proposed_dates: d.prop_proposed_dates || '',
          prop_validity_days: d.prop_validity_days || 30
        })
        setNegoAmount({
          nego_revised_amount: d.nego_revised_amount || d.prop_amount || 0,
          nego_discount_reason: d.nego_discount_reason || 'concurrence'
        })
        setWonForm({
          won_signature_date: d.won_signature_date || new Date().toISOString().split('T')[0],
          won_final_amount: d.won_final_amount || d.nego_revised_amount || d.prop_amount || 0,
          won_payment_mode: d.won_payment_mode || 'virement',
          won_payment_terms: d.won_payment_terms || '30_jours',
          won_purchase_order_number: d.won_purchase_order_number || '',
          won_confirmed_training_dates: d.won_confirmed_training_dates || ''
        })
        setLostForm({
          lost_reason: d.lost_reason || 'projet_annule',
          lost_competitor_name: d.lost_competitor_name || '',
          lost_other_reason: d.lost_other_reason || '',
          lost_recontact_in_6_months: d.lost_recontact_in_6_months || false,
          lost_lessons_learned: d.lost_lessons_learned || ''
        })

        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  const refreshDeal = async () => {
    if (!id) return
    const res = await dealsAPI.getById(id)
    setDeal(res.data)
  }

  const currentStageIndex = STAGE_ORDER.indexOf(deal?.stage)
  const canAdvance = currentStageIndex >= 0 && currentStageIndex < STAGE_ORDER.length - 1 && deal?.stage !== 'perdu'
  const canGoBack = currentStageIndex > 0 && deal?.stage !== 'gagne' && deal?.stage !== 'perdu'

  const handleAdvanceStage = async () => {
    if (!canAdvance || !id) return
    const nextStage = STAGE_ORDER[currentStageIndex + 1]
    setSaving(true)
    try {
      await dealsAPI.updateStage(id, nextStage, users[0]?.id)
      await refreshDeal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleGoBackStage = async () => {
    if (!canGoBack || !id) return
    const prevStage = STAGE_ORDER[currentStageIndex - 1]
    setSaving(true)
    try {
      await dealsAPI.updateStage(id, prevStage, users[0]?.id)
      await refreshDeal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveQualification = async () => {
    if (!id) return
    setSaving(true)
    try {
      await dealsAPI.updateQualification(id, { ...qualForm, user_id: users[0]?.id })
      await refreshDeal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDemo = async () => {
    if (!id) return
    setSaving(true)
    try {
      await dealsAPI.updateDemo(id, { ...demoForm, user_id: users[0]?.id })
      await refreshDeal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProposal = async () => {
    if (!id) return
    setSaving(true)
    try {
      await dealsAPI.updateProposal(id, { ...propForm, user_id: users[0]?.id })
      await refreshDeal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddNegoNote = async () => {
    if (!id || !negoNote.trim()) return
    setSaving(true)
    try {
      await dealsAPI.addNegotiationEntry(id, negoNote, users[0]?.id)
      setNegoNote('')
      await refreshDeal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNegoAmount = async () => {
    if (!id) return
    setSaving(true)
    try {
      await dealsAPI.updateNegotiation(id, { ...negoAmount, user_id: users[0]?.id })
      await refreshDeal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAsWon = async () => {
    if (!id) return
    setSaving(true)
    try {
      await dealsAPI.markAsWon(id, { ...wonForm, user_id: users[0]?.id })
      await refreshDeal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAsLost = async () => {
    if (!id) return
    setSaving(true)
    try {
      await dealsAPI.markAsLost(id, { ...lostForm, user_id: users[0]?.id })
      await refreshDeal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddActivity = async () => {
    if (!id || !activityForm.description.trim()) return
    setSaving(true)
    try {
      await activitiesAPI.create({
        deal_id: id,
        user_id: users[0]?.id,
        type: activityForm.type,
        description: activityForm.description
      })
      setActivityForm({ type: 'note', description: '' })
      await refreshDeal()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Deal non trouvé</p>
        <Link to="/deals" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    )
  }

  const qualScore = deal.qual_total_score || 0
  const isQualCold = qualScore > 0 && qualScore < 12
  const discountPercent = deal.nego_discount_percent || 0
  const isHighDiscount = discountPercent > 15

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/deals')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{deal.company_name}</h1>
          <p className="text-gray-500">
            {deal.contact_first_name} {deal.contact_last_name} - {deal.contact_function}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">{formatCurrency(deal.current_amount)}</p>
          <span className={clsx('badge', getStageColor(deal.stage))}>
            {STAGE_LABELS[deal.stage as DealStage]}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stage Timeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Pipeline</h2>
          <div className="flex gap-2">
            <button
              onClick={handleGoBackStage}
              disabled={!canGoBack || saving}
              className="btn-secondary flex items-center gap-1 text-sm py-1.5"
            >
              <ChevronLeft size={16} />
              Reculer
            </button>
            <button
              onClick={handleAdvanceStage}
              disabled={!canAdvance || saving}
              className="btn-primary flex items-center gap-1 text-sm py-1.5"
            >
              Avancer
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STAGE_ORDER.map((stage, index) => {
            const isActive = deal.stage === stage
            const isPassed = currentStageIndex > index
            const isLost = deal.stage === 'perdu'

            return (
              <div key={stage} className="flex items-center">
                <div className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap',
                  isActive ? getStageColor(stage) : isPassed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                )}>
                  {STAGE_LABELS[stage as DealStage]}
                </div>
                {index < STAGE_ORDER.length - 1 && (
                  <ChevronRight className="text-gray-300 mx-1 flex-shrink-0" size={16} />
                )}
              </div>
            )
          })}
          {deal.stage === 'perdu' && (
            <>
              <ChevronRight className="text-gray-300 mx-1" size={16} />
              <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-800">
                Perdu
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stage-specific forms */}
          {deal.stage === 'lead_entrant' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Lead Entrant</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Source:</span>
                  <span className="ml-2 font-medium">{SOURCE_LABELS[deal.source as keyof typeof SOURCE_LABELS]}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date d'entrée:</span>
                  <span className="ml-2 font-medium">{formatDate(deal.entry_date)}</span>
                </div>
                {deal.source_details && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Détails:</span>
                    <span className="ml-2">{deal.source_details}</span>
                  </div>
                )}
                {deal.how_did_they_find_us && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Comment nous a-t-il connu:</span>
                    <p className="mt-1">{deal.how_did_they_find_us}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {deal.stage === 'qualification' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Scorecard de Qualification</h3>
                {isQualCold && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertTriangle size={16} />
                    Lead froid - à réqualifier
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Budget identifié (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={qualForm.qual_budget_identified}
                    onChange={(e) => setQualForm({ ...qualForm, qual_budget_identified: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Faible</span>
                    <span className="font-medium text-primary-600">{qualForm.qual_budget_identified}/5</span>
                    <span>Fort</span>
                  </div>
                </div>

                <div>
                  <label className="label">Décideur identifié (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={qualForm.qual_decision_maker_identified}
                    onChange={(e) => setQualForm({ ...qualForm, qual_decision_maker_identified: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Faible</span>
                    <span className="font-medium text-primary-600">{qualForm.qual_decision_maker_identified}/5</span>
                    <span>Fort</span>
                  </div>
                </div>

                <div>
                  <label className="label">Timing</label>
                  <select
                    value={qualForm.qual_timing}
                    onChange={(e) => setQualForm({ ...qualForm, qual_timing: e.target.value })}
                    className="select"
                  >
                    {Object.entries(TIMING_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Besoin réel exprimé (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={qualForm.qual_real_need_expressed}
                    onChange={(e) => setQualForm({ ...qualForm, qual_real_need_expressed: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Faible</span>
                    <span className="font-medium text-primary-600">{qualForm.qual_real_need_expressed}/5</span>
                    <span>Fort</span>
                  </div>
                </div>

                <div>
                  <label className="label">Taille entreprise</label>
                  <select
                    value={qualForm.qual_company_size}
                    onChange={(e) => setQualForm({ ...qualForm, qual_company_size: e.target.value })}
                    className="select"
                  >
                    {Object.entries(SIZE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Score total:</span>
                    <span className={clsx(
                      'text-xl font-bold',
                      qualScore >= 12 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {deal.qual_total_score || 0}/25
                    </span>
                  </div>
                </div>

                <button onClick={handleSaveQualification} disabled={saving} className="btn-primary w-full">
                  {saving ? 'Enregistrement...' : 'Enregistrer la qualification'}
                </button>
              </div>
            </div>
          )}

          {deal.stage === 'demo_rdv' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">RDV Découverte / Démo</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date du RDV *</label>
                    <input
                      type="date"
                      value={demoForm.demo_date}
                      onChange={(e) => setDemoForm({ ...demoForm, demo_date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Durée (minutes)</label>
                    <input
                      type="number"
                      value={demoForm.demo_duration}
                      onChange={(e) => setDemoForm({ ...demoForm, demo_duration: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Participants côté client</label>
                  <input
                    type="text"
                    value={demoForm.demo_participants}
                    onChange={(e) => setDemoForm({ ...demoForm, demo_participants: e.target.value })}
                    className="input"
                    placeholder="Nom + fonction"
                  />
                </div>

                <div>
                  <label className="label">Contexte client</label>
                  <textarea
                    value={demoForm.demo_client_context}
                    onChange={(e) => setDemoForm({ ...demoForm, demo_client_context: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="label">Besoins exprimés</label>
                  <textarea
                    value={demoForm.demo_needs_expressed}
                    onChange={(e) => setDemoForm({ ...demoForm, demo_needs_expressed: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="label">Objections soulevées</label>
                  <textarea
                    value={demoForm.demo_objections_raised}
                    onChange={(e) => setDemoForm({ ...demoForm, demo_objections_raised: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="label">Prochaines étapes convenues</label>
                  <textarea
                    value={demoForm.demo_next_steps}
                    onChange={(e) => setDemoForm({ ...demoForm, demo_next_steps: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={demoForm.demo_decision_maker_present}
                    onChange={(e) => setDemoForm({ ...demoForm, demo_decision_maker_present: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Décideur présent au RDV</span>
                </label>

                <button onClick={handleSaveDemo} disabled={saving} className="btn-primary w-full">
                  {saving ? 'Enregistrement...' : 'Enregistrer le compte-rendu'}
                </button>
              </div>
            </div>
          )}

          {deal.stage === 'proposition' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Proposition Commerciale</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date d'envoi</label>
                    <input
                      type="date"
                      value={propForm.prop_sent_date}
                      onChange={(e) => setPropForm({ ...propForm, prop_sent_date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Validité (jours)</label>
                    <input
                      type="number"
                      value={propForm.prop_validity_days}
                      onChange={(e) => setPropForm({ ...propForm, prop_validity_days: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Offre proposée</label>
                  <select
                    value={propForm.prop_offer_type}
                    onChange={(e) => {
                      const prices: Record<string, number> = { starter: 1500, advanced: 3500, enterprise: 8000 }
                      setPropForm({
                        ...propForm,
                        prop_offer_type: e.target.value,
                        prop_amount: prices[e.target.value]
                      })
                    }}
                    className="select"
                  >
                    {Object.entries(OFFER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Montant HT</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={propForm.prop_amount}
                        onChange={(e) => setPropForm({ ...propForm, prop_amount: parseInt(e.target.value) })}
                        className="input pr-8"
                      />
                      <Euro className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Nb participants</label>
                    <input
                      type="number"
                      value={propForm.prop_participants_count}
                      onChange={(e) => setPropForm({ ...propForm, prop_participants_count: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Dates proposées</label>
                  <input
                    type="text"
                    value={propForm.prop_proposed_dates}
                    onChange={(e) => setPropForm({ ...propForm, prop_proposed_dates: e.target.value })}
                    className="input"
                    placeholder="ex: 15-16 mars ou semaine 12"
                  />
                </div>

                <button onClick={handleSaveProposal} disabled={saving} className="btn-primary w-full">
                  {saving ? 'Enregistrement...' : 'Enregistrer la proposition'}
                </button>
              </div>
            </div>
          )}

          {deal.stage === 'negociation' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Négociation</h3>

              {/* Negotiation entries */}
              {deal.nego_entries && deal.nego_entries.length > 0 && (
                <div className="mb-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Historique des échanges</h4>
                  {deal.nego_entries.map((entry: any) => (
                    <div key={entry.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="text-xs text-gray-500 mb-1">{formatDateTime(entry.date)}</p>
                      <p>{entry.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new note */}
              <div className="mb-6">
                <label className="label">Ajouter une note</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={negoNote}
                    onChange={(e) => setNegoNote(e.target.value)}
                    className="input flex-1"
                    placeholder="Nouvelle note de négociation..."
                  />
                  <button onClick={handleAddNegoNote} disabled={saving || !negoNote.trim()} className="btn-primary">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Amount revision */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <h4 className="font-medium text-gray-900">Révision du montant</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Montant initial</label>
                    <p className="text-lg font-medium text-gray-900">{formatCurrency(deal.prop_amount || 0)}</p>
                  </div>
                  <div>
                    <label className="label">Montant révisé</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={negoAmount.nego_revised_amount}
                        onChange={(e) => setNegoAmount({ ...negoAmount, nego_revised_amount: parseInt(e.target.value) })}
                        className="input pr-8"
                      />
                      <Euro className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>
                </div>

                {deal.prop_amount && negoAmount.nego_revised_amount < deal.prop_amount && (
                  <div className={clsx(
                    'p-3 rounded-lg flex items-center gap-2',
                    isHighDiscount ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                  )}>
                    <Percent size={16} />
                    <span>
                      Remise: {Math.round((1 - negoAmount.nego_revised_amount / deal.prop_amount) * 100)}%
                      {isHighDiscount && ' - Validation manager requise'}
                    </span>
                  </div>
                )}

                <div>
                  <label className="label">Motif de la remise</label>
                  <select
                    value={negoAmount.nego_discount_reason}
                    onChange={(e) => setNegoAmount({ ...negoAmount, nego_discount_reason: e.target.value })}
                    className="select"
                  >
                    <option value="volume">Volume</option>
                    <option value="fidelite">Fidélité</option>
                    <option value="concurrence">Concurrence</option>
                    <option value="timing">Timing</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <button onClick={handleSaveNegoAmount} disabled={saving} className="btn-primary w-full">
                  {saving ? 'Enregistrement...' : 'Enregistrer le montant révisé'}
                </button>
              </div>
            </div>
          )}

          {/* Won/Lost forms */}
          {deal.stage !== 'gagne' && deal.stage !== 'perdu' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="card">
                <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Marquer comme Gagné
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Date signature</label>
                    <input
                      type="date"
                      value={wonForm.won_signature_date}
                      onChange={(e) => setWonForm({ ...wonForm, won_signature_date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Montant final</label>
                    <input
                      type="number"
                      value={wonForm.won_final_amount}
                      onChange={(e) => setWonForm({ ...wonForm, won_final_amount: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Mode paiement</label>
                    <select
                      value={wonForm.won_payment_mode}
                      onChange={(e) => setWonForm({ ...wonForm, won_payment_mode: e.target.value })}
                      className="select"
                    >
                      <option value="virement">Virement</option>
                      <option value="cb">CB</option>
                      <option value="cheque">Chèque</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Conditions</label>
                    <select
                      value={wonForm.won_payment_terms}
                      onChange={(e) => setWonForm({ ...wonForm, won_payment_terms: e.target.value })}
                      className="select"
                    >
                      <option value="comptant">Comptant</option>
                      <option value="30_jours">30 jours</option>
                      <option value="45_jours">45 jours</option>
                      <option value="60_jours">60 jours</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">N° BC client</label>
                    <input
                      type="text"
                      value={wonForm.won_purchase_order_number}
                      onChange={(e) => setWonForm({ ...wonForm, won_purchase_order_number: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Dates formation</label>
                    <input
                      type="text"
                      value={wonForm.won_confirmed_training_dates}
                      onChange={(e) => setWonForm({ ...wonForm, won_confirmed_training_dates: e.target.value })}
                      className="input"
                    />
                  </div>
                  <button onClick={handleMarkAsWon} disabled={saving} className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">
                    {saving ? 'Enregistrement...' : 'Valider Gagné'}
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <XCircle size={20} />
                  Marquer comme Perdu
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Raison de la perte *</label>
                    <select
                      value={lostForm.lost_reason}
                      onChange={(e) => setLostForm({ ...lostForm, lost_reason: e.target.value })}
                      className="select"
                    >
                      <option value="prix_eleve">Prix trop élevé</option>
                      <option value="concurrent">Concurrent choisi</option>
                      <option value="projet_reporte">Projet reporté</option>
                      <option value="projet_annule">Projet annulé</option>
                      <option value="pas_reponse">Pas de réponse</option>
                      <option value="besoin_mal_qualifie">Besoin mal qualifié</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  {lostForm.lost_reason === 'concurrent' && (
                    <div>
                      <label className="label">Nom du concurrent</label>
                      <input
                        type="text"
                        value={lostForm.lost_competitor_name}
                        onChange={(e) => setLostForm({ ...lostForm, lost_competitor_name: e.target.value })}
                        className="input"
                      />
                    </div>
                  )}
                  {lostForm.lost_reason === 'autre' && (
                    <div>
                      <label className="label">Précisez</label>
                      <input
                        type="text"
                        value={lostForm.lost_other_reason}
                        onChange={(e) => setLostForm({ ...lostForm, lost_other_reason: e.target.value })}
                        className="input"
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={lostForm.lost_recontact_in_6_months}
                      onChange={(e) => setLostForm({ ...lostForm, lost_recontact_in_6_months: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Recontacter dans 6 mois</span>
                  </label>
                  <div>
                    <label className="label">Leçons apprises</label>
                    <textarea
                      value={lostForm.lost_lessons_learned}
                      onChange={(e) => setLostForm({ ...lostForm, lost_lessons_learned: e.target.value })}
                      className="input"
                      rows={2}
                    />
                  </div>
                  <button onClick={handleMarkAsLost} disabled={saving} className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">
                    {saving ? 'Enregistrement...' : 'Valider Perdu'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activities */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Historique des activités</h3>

            {/* Add activity form */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-2 mb-2">
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                  className="select w-32"
                >
                  <option value="note">Note</option>
                  <option value="appel">Appel</option>
                  <option value="email">Email</option>
                  <option value="rdv">RDV</option>
                </select>
                <input
                  type="text"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  placeholder="Description de l'activité..."
                  className="input flex-1"
                />
                <button onClick={handleAddActivity} disabled={saving || !activityForm.description.trim()} className="btn-primary">
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Activities list */}
            <div className="space-y-3">
              {deal.activities?.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 border">
                    {activity.type === 'appel' && <Phone size={14} className="text-gray-600" />}
                    {activity.type === 'email' && <Mail size={14} className="text-gray-600" />}
                    {activity.type === 'rdv' && <Calendar size={14} className="text-gray-600" />}
                    {activity.type === 'note' && <FileText size={14} className="text-gray-600" />}
                    {activity.type === 'changement_etape' && <ChevronRight size={14} className="text-gray-600" />}
                    {activity.type === 'modification' && <FileText size={14} className="text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user_first_name} {activity.user_last_name} - {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 size={18} />
              Entreprise
            </h3>
            <div className="space-y-2 text-sm">
              <Link to={`/companies/${deal.company_id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                {deal.company_name}
              </Link>
              {deal.company_siren && <p className="text-gray-500">SIREN: {deal.company_siren}</p>}
              {deal.company_sector && <p className="text-gray-500 capitalize">{deal.company_sector}</p>}
              {deal.company_city && <p className="text-gray-500">{deal.company_city}</p>}
            </div>
          </div>

          {/* Contact info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User size={18} />
              Contact principal
            </h3>
            <div className="space-y-2 text-sm">
              <Link to={`/contacts/${deal.contact_id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                {deal.contact_civility} {deal.contact_first_name} {deal.contact_last_name}
              </Link>
              {deal.contact_function && <p className="text-gray-500">{deal.contact_function}</p>}
              {deal.contact_email && (
                <a href={`mailto:${deal.contact_email}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Mail size={14} />
                  {deal.contact_email}
                </a>
              )}
              {deal.contact_phone && (
                <a href={`tel:${deal.contact_phone}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Phone size={14} />
                  {deal.contact_phone}
                </a>
              )}
            </div>
          </div>

          {/* Commercial */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User size={18} />
              Commercial
            </h3>
            <p className="text-sm text-gray-900">{deal.user_first_name} {deal.user_last_name}</p>
          </div>

          {/* Dates */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={18} />
              Dates
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Création:</span>
                <span>{formatDate(deal.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dernière activité:</span>
                <span>{formatRelativeTime(deal.last_activity_at)}</span>
              </div>
              {deal.expected_close_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Closing prévu:</span>
                  <span>{formatDate(deal.expected_close_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
