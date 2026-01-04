import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Filter, Download, ChevronDown, ChevronUp,
  MoreHorizontal, ArrowUpDown
} from 'lucide-react'
import { dealsAPI, usersAPI, exportAPI } from '../api'
import { formatCurrency, formatDate, formatRelativeTime, getStageColor } from '../utils/format'
import { STAGE_LABELS, SOURCE_LABELS, OFFER_LABELS, DealStage, LeadSource, OfferType } from '../types'
import clsx from 'clsx'
import NewDealModal from '../components/NewDealModal'

type SortField = 'company_name' | 'current_amount' | 'stage' | 'created_at' | 'last_activity_at' | 'expected_close_date'
type SortDir = 'asc' | 'desc'

export default function DealsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [deals, setDeals] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [sortField, setSortField] = useState<SortField>('last_activity_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Filters from URL
  const search = searchParams.get('search') || ''
  const stage = searchParams.get('stage') || ''
  const userId = searchParams.get('user_id') || ''
  const source = searchParams.get('source') || ''

  useEffect(() => {
    Promise.all([
      dealsAPI.getAll({ search, stage, user_id: userId, source }),
      usersAPI.getAll()
    ])
      .then(([dealsRes, usersRes]) => {
        setDeals(dealsRes.data)
        setUsers(usersRes.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [search, stage, userId, source])

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sortedDeals = [...deals].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (sortField === 'current_amount') {
      aVal = aVal || 0
      bVal = bVal || 0
    } else {
      aVal = aVal || ''
      bVal = bVal || ''
    }

    if (sortDir === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const handleExport = () => {
    const params: Record<string, string> = {}
    if (stage) params.stage = stage
    if (userId) params.user_id = userId
    if (source) params.source = source
    window.open(exportAPI.deals(params), '_blank')
  }

  const handleDealCreated = () => {
    setShowNewDeal(false)
    // Refresh deals
    dealsAPI.getAll({ search, stage, user_id: userId, source })
      .then(res => setDeals(res.data))
  }

  const activeFilters = [stage, userId, source].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
        <button onClick={() => setShowNewDeal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nouveau Deal
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une entreprise, un contact..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'btn-secondary flex items-center gap-2',
              activeFilters > 0 && 'border-primary-500 text-primary-600'
            )}
          >
            <Filter size={20} />
            Filtres
            {activeFilters > 0 && (
              <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilters}
              </span>
            )}
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Export */}
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download size={20} />
            Exporter CSV
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Étape</label>
              <select
                value={stage}
                onChange={(e) => updateFilter('stage', e.target.value)}
                className="select"
              >
                <option value="">Toutes les étapes</option>
                {Object.entries(STAGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Commercial</label>
              <select
                value={userId}
                onChange={(e) => updateFilter('user_id', e.target.value)}
                className="select"
              >
                <option value="">Tous les commerciaux</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Source</label>
              <select
                value={source}
                onChange={(e) => updateFilter('source', e.target.value)}
                className="select"
              >
                <option value="">Toutes les sources</option>
                {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button onClick={clearFilters} className="btn-secondary w-full">
                Effacer les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {deals.length} deal{deals.length !== 1 ? 's' : ''} trouvé{deals.length !== 1 ? 's' : ''}
      </div>

      {/* Deals Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun deal trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">
                    <button
                      onClick={() => handleSort('company_name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Entreprise
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Offre</th>
                  <th className="table-header">
                    <button
                      onClick={() => handleSort('current_amount')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Montant
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="table-header">
                    <button
                      onClick={() => handleSort('stage')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Étape
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="table-header">Commercial</th>
                  <th className="table-header">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Création
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="table-header">
                    <button
                      onClick={() => handleSort('last_activity_at')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Dernière activité
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="table-header">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedDeals.map(deal => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <Link
                        to={`/deals/${deal.id}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {deal.company_name}
                      </Link>
                    </td>
                    <td className="table-cell text-gray-600">
                      {deal.contact_first_name} {deal.contact_last_name}
                    </td>
                    <td className="table-cell text-gray-600">
                      {deal.prop_offer_type ? (
                        <span className="capitalize">{deal.prop_offer_type}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell font-medium">
                      {deal.current_amount > 0 ? formatCurrency(deal.current_amount) : '-'}
                    </td>
                    <td className="table-cell">
                      <span className={clsx('badge', getStageColor(deal.stage))}>
                        {STAGE_LABELS[deal.stage as DealStage]}
                      </span>
                    </td>
                    <td className="table-cell text-gray-600">
                      {deal.user_first_name} {deal.user_last_name?.charAt(0)}.
                    </td>
                    <td className="table-cell text-gray-500 text-xs">
                      {formatDate(deal.created_at)}
                    </td>
                    <td className="table-cell text-gray-500 text-xs">
                      {formatRelativeTime(deal.last_activity_at)}
                    </td>
                    <td className="table-cell text-gray-500 text-xs">
                      {deal.expected_close_date ? formatDate(deal.expected_close_date) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Deal Modal */}
      {showNewDeal && (
        <NewDealModal
          onClose={() => setShowNewDeal(false)}
          onCreated={handleDealCreated}
        />
      )}
    </div>
  )
}
