'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Eye, Edit, Search, Trash2, Linkedin } from 'lucide-react'

interface CompanyActionsProps {
  companyId: string
  companyName: string
}

export function CompanyActions({ companyId, companyName }: CompanyActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${companyName} ?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  const searchOnLinkedIn = () => {
    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName + ' formation')}&origin=GLOBAL_SEARCH_HEADER`
    window.open(searchUrl, '_blank')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-1 animate-fade-in">
            <Link
              href={`/companies/${companyId}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              Voir les détails
            </Link>
            <Link
              href={`/companies/${companyId}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Link>
            <button
              onClick={searchOnLinkedIn}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#0A66C2] hover:bg-blue-50"
            >
              <Linkedin className="h-4 w-4" />
              Rechercher sur LinkedIn
            </button>
            <Link
              href={`/companies/${companyId}/enrich`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Search className="h-4 w-4" />
              Enrichir (Apollo.io)
            </Link>
            <hr className="my-1" />
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
