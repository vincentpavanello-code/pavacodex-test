import { db } from '@/lib/db'
import {
  Building2,
  Users,
  Mail,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const [
    companiesCount,
    contactsCount,
    campaignsCount,
    companiesByStatus,
    recentContacts
  ] = await Promise.all([
    db.company.count(),
    db.contact.count(),
    db.campaign.count(),
    db.company.groupBy({
      by: ['status'],
      _count: true,
    }),
    db.contact.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { company: true }
    })
  ])

  return {
    companiesCount,
    contactsCount,
    campaignsCount,
    companiesByStatus,
    recentContacts
  }
}

export default async function Dashboard() {
  const stats = await getStats()

  const statusCounts = {
    opportunities: stats.companiesByStatus.find((s: { status: string; _count: number }) => s.status === 'OPPORTUNITY')?._count || 0,
    engaged: stats.companiesByStatus.find((s: { status: string; _count: number }) => s.status === 'ENGAGED')?._count || 0,
    contacted: stats.companiesByStatus.find((s: { status: string; _count: number }) => s.status === 'CONTACTED')?._count || 0,
    customers: stats.companiesByStatus.find((s: { status: string; _count: number }) => s.status === 'CUSTOMER')?._count || 0,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Vue d'ensemble de votre stratégie ABM
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/companies/new" className="btn-primary">
          + Ajouter une entreprise
        </Link>
        <Link href="/campaigns/new" className="btn-secondary">
          + Nouvelle campagne
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-value">{stats.companiesCount}</p>
              <p className="stat-label">Entreprises ciblées</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-value">{stats.contactsCount}</p>
              <p className="stat-label">Contacts identifiés</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-value">{stats.campaignsCount}</p>
              <p className="stat-label">Campagnes actives</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-value">{statusCounts.opportunities}</p>
              <p className="stat-label">Opportunités</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline & Recent Contacts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Pipeline ABM</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Contactées</span>
                </div>
                <span className="text-lg font-semibold">{statusCounts.contacted}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-600">Engagées</span>
                </div>
                <span className="text-lg font-semibold">{statusCounts.engaged}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm text-gray-600">Opportunités</span>
                </div>
                <span className="text-lg font-semibold">{statusCounts.opportunities}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Clients</span>
                </div>
                <span className="text-lg font-semibold">{statusCounts.customers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Derniers contacts</h2>
            <Link href="/contacts" className="text-sm text-blue-600 hover:text-blue-700">
              Voir tous →
            </Link>
          </div>
          <div className="card-body">
            {stats.recentContacts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucun contact pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentContacts.map((contact: { id: string; firstName: string; lastName: string; jobTitle: string | null; company: { name: string } }) => (
                  <div key={contact.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {contact.jobTitle} @ {contact.company.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="card bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-white mb-2">
            🚀 Comment démarrer ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white/90 text-sm">
            <div>
              <strong>1. Ajoutez une entreprise</strong>
              <p className="text-white/70 text-xs mt-1">
                Entrez le nom d'une entreprise à cibler
              </p>
            </div>
            <div>
              <strong>2. Recherchez les contacts</strong>
              <p className="text-white/70 text-xs mt-1">
                Utilisez Apollo.io pour trouver les décideurs formation
              </p>
            </div>
            <div>
              <strong>3. Personnalisez vos messages</strong>
              <p className="text-white/70 text-xs mt-1">
                L'IA génère des messages adaptés à chaque contact
              </p>
            </div>
            <div>
              <strong>4. Lancez vos campagnes</strong>
              <p className="text-white/70 text-xs mt-1">
                Emails, LinkedIn, livres blancs...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
