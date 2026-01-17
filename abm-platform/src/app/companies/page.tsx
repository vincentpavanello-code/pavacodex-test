import { db } from '@/lib/db'
import { companyStatusColors, companyStatusLabels, priorityColors, priorityLabels } from '@/lib/utils'
import Link from 'next/link'
import { Building2, Plus, Search, Filter, ExternalLink } from 'lucide-react'
import { CompanyActions } from './CompanyActions'
import type { Company } from '@prisma/client'

type CompanyWithCount = Company & { _count: { contacts: number } }

async function getCompanies(): Promise<CompanyWithCount[]> {
  return db.company.findMany({
    include: {
      _count: {
        select: { contacts: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entreprises</h1>
          <p className="mt-1 text-gray-500">
            Gérez vos entreprises cibles pour l'ABM
          </p>
        </div>
        <Link href="/companies/new" className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une entreprise
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            className="form-input pl-10"
          />
        </div>
        <button className="btn-outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </button>
      </div>

      {/* Table */}
      {companies.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune entreprise
          </h3>
          <p className="text-gray-500 mb-4">
            Commencez par ajouter votre première entreprise cible
          </p>
          <Link href="/companies/new" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une entreprise
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Entreprise</th>
                <th>Secteur</th>
                <th>Taille</th>
                <th>Contacts</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Link
                          href={`/companies/${company.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {company.name}
                        </Link>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                          >
                            {company.website.replace(/^https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-600">{company.industry || '-'}</td>
                  <td className="text-gray-600">{company.size || '-'}</td>
                  <td>
                    <span className="badge bg-gray-100 text-gray-800">
                      {company._count.contacts} contact{company._count.contacts > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${companyStatusColors[company.status]}`}>
                      {companyStatusLabels[company.status]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${priorityColors[company.priority]}`}>
                      {priorityLabels[company.priority]}
                    </span>
                  </td>
                  <td>
                    <CompanyActions companyId={company.id} companyName={company.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
