import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { remindersAPI } from '../api'
import { formatCurrency, formatRelativeTime, getStageColor } from '../utils/format'
import { STAGE_LABELS, DealStage } from '../types'
import clsx from 'clsx'

const REMINDER_TYPES: Record<string, { label: string; color: string; icon: any }> = {
  lead_a_qualifier: { label: 'Lead à qualifier', color: 'bg-blue-100 text-blue-800', icon: Clock },
  lead_froid: { label: 'Lead froid', color: 'bg-purple-100 text-purple-800', icon: AlertTriangle },
  deal_dormant: { label: 'Deal dormant', color: 'bg-gray-100 text-gray-800', icon: Clock },
  relance_propale: { label: 'Relance propale', color: 'bg-yellow-100 text-yellow-800', icon: Bell },
  propale_expiree: { label: 'Propale expirée', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  nego_longue: { label: 'Négo longue', color: 'bg-red-100 text-red-800', icon: Clock },
  alerte_formation: { label: 'Alerte formation', color: 'bg-green-100 text-green-800', icon: Bell },
}

export default function Reminders() {
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('unread')

  const loadReminders = () => {
    remindersAPI.getAll(filter === 'unread' ? { is_read: 'false' } : {})
      .then(res => {
        setReminders(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadReminders()
  }, [filter])

  const handleMarkAsRead = async (id: string) => {
    await remindersAPI.markAsRead(id)
    loadReminders()
  }

  const handleMarkAllAsRead = async () => {
    await remindersAPI.markAllAsRead()
    loadReminders()
  }

  const unreadCount = reminders.filter(r => !r.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Alertes</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('unread')}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                filter === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              )}
            >
              Non lues
            </button>
            <button
              onClick={() => setFilter('all')}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              )}
            >
              Toutes
            </button>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-secondary text-sm">
              <CheckCircle size={16} className="mr-1" />
              Tout marquer lu
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : reminders.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <p className="text-gray-500">Aucune alerte {filter === 'unread' ? 'non lue' : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map(reminder => {
            const typeInfo = REMINDER_TYPES[reminder.type] || { label: reminder.type, color: 'bg-gray-100 text-gray-800', icon: Bell }
            const Icon = typeInfo.icon

            return (
              <div
                key={reminder.id}
                className={clsx(
                  'card flex items-start gap-4',
                  !reminder.is_read && 'border-l-4 border-l-red-500'
                )}
              >
                <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', typeInfo.color)}>
                  <Icon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx('badge', typeInfo.color)}>{typeInfo.label}</span>
                    <span className="text-xs text-gray-500">{formatRelativeTime(reminder.created_at)}</span>
                  </div>

                  <p className="text-gray-900 font-medium">{reminder.message}</p>

                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <Link
                      to={`/deals/${reminder.deal_id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {reminder.company_name}
                    </Link>
                    <span className={clsx('badge', getStageColor(reminder.stage))}>
                      {STAGE_LABELS[reminder.stage as DealStage]}
                    </span>
                    <span className="text-gray-500">{formatCurrency(reminder.current_amount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/deals/${reminder.deal_id}`}
                    className="btn-primary text-sm py-1.5"
                  >
                    Voir le deal
                  </Link>
                  {!reminder.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(reminder.id)}
                      className="btn-secondary text-sm py-1.5"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
