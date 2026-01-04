import { useState, useEffect } from 'react'
import { User, TrendingUp, Target, Percent } from 'lucide-react'
import { usersAPI, statsAPI } from '../api'
import { formatCurrency, formatPercent } from '../utils/format'

export default function Team() {
  const [users, setUsers] = useState<any[]>([])
  const [performance, setPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      usersAPI.getAll(),
      statsAPI.getUserPerformance()
    ])
      .then(([usersRes, perfRes]) => {
        setUsers(usersRes.data)
        setPerformance(perfRes.data)
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

  // Merge users with performance data
  const teamData = users.map(user => {
    const perf = performance.find(p => p.user_id === user.id) || {}
    return { ...user, ...perf }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Équipe commerciale</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamData.map(user => (
          <div key={user.id} className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="text-primary-600" size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user.first_name} {user.last_name}</h3>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Target size={16} />
                  <span className="text-sm">Deals actifs</span>
                </div>
                <span className="font-semibold text-gray-900">{user.deals_count || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp size={16} />
                  <span className="text-sm">Pipeline</span>
                </div>
                <span className="font-semibold text-primary-600">{formatCurrency(user.pipeline_amount || 0)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp size={16} />
                  <span className="text-sm">CA signé</span>
                </div>
                <span className="font-semibold text-green-600">{formatCurrency(user.signed_amount || 0)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Percent size={16} />
                  <span className="text-sm">Conversion</span>
                </div>
                <span className="font-semibold text-gray-900">{formatPercent(user.conversion_rate || 0)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href={`mailto:${user.email}`}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {user.email}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Performance comparison */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Comparatif performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">Commercial</th>
                <th className="table-header text-right">Deals</th>
                <th className="table-header text-right">Pipeline</th>
                <th className="table-header text-right">CA Signé</th>
                <th className="table-header text-right">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamData
                .sort((a, b) => (b.signed_amount || 0) - (a.signed_amount || 0))
                .map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium">{user.first_name} {user.last_name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-right">{user.deals_count || 0}</td>
                    <td className="table-cell text-right font-medium text-primary-600">
                      {formatCurrency(user.pipeline_amount || 0)}
                    </td>
                    <td className="table-cell text-right font-medium text-green-600">
                      {formatCurrency(user.signed_amount || 0)}
                    </td>
                    <td className="table-cell text-right">{formatPercent(user.conversion_rate || 0)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
