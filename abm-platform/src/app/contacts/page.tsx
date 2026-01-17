import { db } from '@/lib/db'
import { contactStatusColors, contactStatusLabels } from '@/lib/utils'
import Link from 'next/link'
import { Users, Plus, Search, Filter, Mail, Linkedin, Building2 } from 'lucide-react'
import { ContactActions } from './ContactActions'
import type { Contact } from '@prisma/client'

type ContactWithRelations = Contact & {
  company: { id: string; name: string }
  _count: { interactions: number; emailsSent: number }
}

async function getContacts(): Promise<ContactWithRelations[]> {
  return db.contact.findMany({
    include: {
      company: {
        select: { id: true, name: true }
      },
      _count: {
        select: { interactions: true, emailsSent: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function ContactsPage() {
  const contacts = await getContacts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-1 text-gray-500">
            Gérez vos contacts décideurs
          </p>
        </div>
        <Link href="/contacts/new" className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un contact
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un contact..."
            className="form-input pl-10"
          />
        </div>
        <button className="btn-outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </button>
      </div>

      {/* Table */}
      {contacts.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun contact
          </h3>
          <p className="text-gray-500 mb-4">
            Ajoutez votre premier contact ou enrichissez une entreprise
          </p>
          <Link href="/contacts/new" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un contact
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Entreprise</th>
                <th>Poste</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <Link
                          href={`/contacts/${contact.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {contact.firstName} {contact.lastName}
                        </Link>
                        {contact.isDecisionMaker && (
                          <span className="ml-2 badge bg-yellow-100 text-yellow-800 text-xs">
                            Décideur
                          </span>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          {contact.linkedinUrl && (
                            <a
                              href={contact.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0A66C2] hover:text-[#004182]"
                            >
                              <Linkedin className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Link
                      href={`/companies/${contact.company.id}`}
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                    >
                      <Building2 className="h-3 w-3" />
                      {contact.company.name}
                    </Link>
                  </td>
                  <td className="text-gray-600 text-sm">
                    {contact.jobTitle || '-'}
                  </td>
                  <td>
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                      >
                        <Mail className="h-3 w-3" />
                        <span className="text-sm">{contact.email}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">Non renseigné</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${contactStatusColors[contact.status]}`}>
                      {contactStatusLabels[contact.status]}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${contact.engagementScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{contact.engagementScore}</span>
                    </div>
                  </td>
                  <td>
                    <ContactActions
                      contactId={contact.id}
                      contactName={`${contact.firstName} ${contact.lastName}`}
                      email={contact.email}
                      linkedinUrl={contact.linkedinUrl}
                    />
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
