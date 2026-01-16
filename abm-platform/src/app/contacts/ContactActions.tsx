'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  Linkedin,
  MessageSquare,
  Sparkles
} from 'lucide-react'

interface ContactActionsProps {
  contactId: string
  contactName: string
  email: string | null
  linkedinUrl: string | null
}

export function ContactActions({ contactId, contactName, email, linkedinUrl }: ContactActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${contactName} ?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
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

  const openLinkedInMessage = () => {
    if (linkedinUrl) {
      // Ouvre le profil LinkedIn où l'utilisateur peut envoyer un message
      window.open(linkedinUrl, '_blank')
    }
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
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 py-1 animate-fade-in">
            <Link
              href={`/contacts/${contactId}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              Voir le profil
            </Link>
            <Link
              href={`/contacts/${contactId}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Link>

            <hr className="my-1" />

            {/* Actions de contact */}
            <Link
              href={`/ai-generator?contactId=${contactId}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50"
            >
              <Sparkles className="h-4 w-4" />
              Générer un message IA
            </Link>

            {email && (
              <Link
                href={`/contacts/${contactId}/send-email`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Mail className="h-4 w-4" />
                Envoyer un email
              </Link>
            )}

            {linkedinUrl && (
              <button
                onClick={openLinkedInMessage}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#0A66C2] hover:bg-blue-50"
              >
                <Linkedin className="h-4 w-4" />
                Ouvrir LinkedIn
              </button>
            )}

            <Link
              href={`/contacts/${contactId}/add-interaction`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <MessageSquare className="h-4 w-4" />
              Ajouter une interaction
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
