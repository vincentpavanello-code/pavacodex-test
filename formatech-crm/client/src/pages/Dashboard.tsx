import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Funnel, FunnelChart, LabelList
} from 'recharts'
import {
  TrendingUp, TrendingDown, Target, Euro, Users, AlertTriangle,
  ArrowRight, Phone, Mail, Calendar, FileText, Clock
} from 'lucide-react'
import { statsAPI, activitiesAPI, remindersAPI } from '../api'
import { formatCurrency, formatPercent, formatRelativeTime, formatMonth, getStageColor } from '../utils/format'
import { STAGE_LABELS, SOURCE_LABELS } from '../types'
import clsx from 'clsx'

const COLORS = ['#3b82f6', '#8b5cf6', '#6366f1', '#f59e0b', '#f97316', '#22c55e']

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [sources, setSources] = useState<any[]>([])
  const [userPerformance, setUserPerformance] = useState<any[]>([])
  const [nextToClose, setNextToClose] = useState<any[]>([])
  const [funnel, setFunnel] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      statsAPI.getDashboard(),
      statsAPI.getMonthlyRevenue(),
      statsAPI.getSources(),
      statsAPI.getUserPerformance(),
      statsAPI.getNextToClose(),
      statsAPI.getFunnel(),
      activitiesAPI.getRecent(),
      remindersAPI.getAll({ is_read: 'false' }),
    ])
      .then(([dashRes, monthlyRes, sourcesRes, perfRes, nextRes, funnelRes, actRes, remRes]) => {
        setStats(dashRes.data)
        setMonthlyRevenue(monthlyRes.data)
        setSources(sourcesRes.data)
        setUserPerformance(perfRes.data)
        setNextToClose(nextRes.data)
        setFunnel(funnelRes.data)
        setActivities(actRes.data)
        setReminders(remRes.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const revenueChange = stats?.signedLastMonth > 0
    ? ((stats.signedThisMonth - stats.signedLastMonth) / stats.signedLastMonth * 100)
    : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pipeline total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalPipeline || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Target className="text-primary-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Forecast du mois</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.forecastThisMonth || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Euro className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">CA signé ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.signedThisMonth || 0)}</p>
              <div className="flex items-center mt-1">
                {revenueChange >= 0 ? (
                  <TrendingUp className="text-green-500 mr-1" size={14} />
                ) : (
                  <TrendingDown className="text-red-500 mr-1" size={14} />
                )}
                <span className={clsx('text-xs', revenueChange >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {formatPercent(Math.abs(revenueChange))} vs mois dernier
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Taux conversion (90j)</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercent(stats?.conversionRate90Days || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Funnel commercial</h2>
          <div className="space-y-2">
            {funnel.map((stage, index) => {
              const maxCount = Math.max(...funnel.map(s => s.count))
              const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
              return (
                <div key={stage.stage} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-600 truncate">
                    {STAGE_LABELS[stage.stage as keyof typeof STAGE_LABELS] || stage.stage}
                  </div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                      <span className="text-sm font-medium text-gray-700">{stage.count} deals</span>
                      <span className="text-sm text-gray-500">{formatCurrency(stage.amount)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">CA signé (12 derniers mois)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(v) => formatMonth(v)}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000)}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => formatMonth(label)}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sources de leads</h2>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={sources}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={false}
                >
                  {sources.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, SOURCE_LABELS[name as keyof typeof SOURCE_LABELS] || name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {sources.map((source, index) => (
                <div key={source.source} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">
                    {SOURCE_LABELS[source.source as keyof typeof SOURCE_LABELS] || source.source}
                  </span>
                  <span className="text-sm font-medium text-gray-900 ml-auto">{source.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance by User */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance par commercial</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000)}k`} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="user_name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="signed_amount" fill="#22c55e" name="CA Signé" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next to Close */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Prochains closings</h2>
            <Link to="/deals" className="text-sm text-primary-600 hover:text-primary-700">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {nextToClose.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun deal avec date de closing</p>
            ) : (
              nextToClose.map(deal => (
                <Link
                  key={deal.id}
                  to={`/deals/${deal.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 truncate">{deal.company_name}</span>
                    <span className="text-sm font-medium text-primary-600">{formatCurrency(deal.current_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{deal.user_first_name} {deal.user_last_name}</span>
                    <span>{deal.expected_close_date}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              Alertes
              {reminders.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {reminders.length}
                </span>
              )}
            </h2>
            <Link to="/reminders" className="text-sm text-primary-600 hover:text-primary-700">
              Voir tout
            </Link>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {reminders.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune alerte en cours</p>
            ) : (
              reminders.slice(0, 5).map(reminder => (
                <Link
                  key={reminder.id}
                  to={`/deals/${reminder.deal_id}`}
                  className="block p-2 border border-red-100 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <p className="text-sm text-red-800">{reminder.message}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Activités récentes</h2>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune activité récente</p>
            ) : (
              activities.slice(0, 8).map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {activity.type === 'appel' && <Phone size={14} className="text-gray-600" />}
                    {activity.type === 'email' && <Mail size={14} className="text-gray-600" />}
                    {activity.type === 'rdv' && <Calendar size={14} className="text-gray-600" />}
                    {activity.type === 'note' && <FileText size={14} className="text-gray-600" />}
                    {activity.type === 'changement_etape' && <ArrowRight size={14} className="text-gray-600" />}
                    {activity.type === 'modification' && <FileText size={14} className="text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{activity.company_name}</span>
                      <span>-</span>
                      <span>{formatRelativeTime(activity.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
