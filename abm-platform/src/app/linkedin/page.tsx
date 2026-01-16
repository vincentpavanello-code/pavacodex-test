'use client'

import { useState, useEffect } from 'react'
import {
  Linkedin,
  Search,
  UserPlus,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Building2
} from 'lucide-react'

interface Contact {
  id: string
  firstName: string
  lastName: string
  jobTitle: string | null
  linkedinUrl: string | null
  company: { name: string }
  status: string
}

export default function LinkedInPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messageType, setMessageType] = useState<'linkedin_connection' | 'linkedin_message'>('linkedin_connection')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      // Filtrer les contacts avec LinkedIn
      setContacts(data.filter((c: Contact) => c.linkedinUrl))
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMessage = async (contact: Contact, type: 'linkedin_connection' | 'linkedin_message') => {
    setSelectedContact(contact)
    setMessageType(type)
    setIsGenerating(true)
    setGeneratedMessage('')

    try {
      const res = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          messageType: type,
        }),
      })

      const data = await res.json()
      setGeneratedMessage(data.message)
    } catch (error) {
      console.error('Erreur génération:', error)
      setGeneratedMessage('Erreur lors de la génération du message')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const openLinkedInSearch = (companyName: string) => {
    const searchUrl = `https://www.linkedin.com/sales/search/people?keywords=${encodeURIComponent(companyName + ' formation learning development RH')}`
    window.open(searchUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Linkedin className="h-7 w-7 text-[#0A66C2]" />
          LinkedIn Outreach
        </h1>
        <p className="mt-1 text-gray-500">
          Gérez vos actions LinkedIn avec Sales Navigator
        </p>
      </div>

      {/* Sales Navigator Tips */}
      <div className="card bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white">
        <div className="card-body">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Utiliser LinkedIn Sales Navigator
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">1. Recherche avancée</p>
              <p className="text-white/80 text-xs mt-1">
                Filtrez par titre : "Responsable Formation", "DRH", "L&D Manager"
              </p>
            </div>
            <div>
              <p className="font-medium">2. Générez un message IA</p>
              <p className="text-white/80 text-xs mt-1">
                Utilisez Claude pour personnaliser votre approche
              </p>
            </div>
            <div>
              <p className="font-medium">3. Copiez et envoyez</p>
              <p className="text-white/80 text-xs mt-1">
                Collez le message généré dans LinkedIn
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des contacts LinkedIn */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Contacts avec LinkedIn ({contacts.length})
            </h2>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Chargement...
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center">
                <Linkedin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Aucun contact avec profil LinkedIn
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {contact.jobTitle || 'Poste non renseigné'}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {contact.company.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <a
                          href={contact.linkedinUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#0A66C2] hover:bg-blue-50 rounded"
                          title="Ouvrir le profil"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => generateMessage(contact, 'linkedin_connection')}
                        className="flex-1 btn-outline text-xs py-1.5"
                        disabled={isGenerating && selectedContact?.id === contact.id}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Demande connexion
                      </button>
                      <button
                        onClick={() => generateMessage(contact, 'linkedin_message')}
                        className="flex-1 btn-outline text-xs py-1.5"
                        disabled={isGenerating && selectedContact?.id === contact.id}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Générateur de message */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Message généré par IA
            </h2>
          </div>
          <div className="card-body">
            {!selectedContact ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Sélectionnez un contact et cliquez sur "Demande connexion" ou "Message"</p>
              </div>
            ) : isGenerating ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Génération en cours...</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Pour :</strong> {selectedContact.firstName} {selectedContact.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {messageType === 'linkedin_connection' ? 'Demande de connexion' : 'Message LinkedIn'}
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                    className="form-input min-h-[200px] font-mono text-sm"
                    placeholder="Le message apparaîtra ici..."
                  />
                  <button
                    onClick={() => copyToClipboard(generatedMessage, selectedContact.id)}
                    className="absolute top-2 right-2 p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                    title="Copier"
                  >
                    {copiedId === selectedContact.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      copyToClipboard(generatedMessage, selectedContact.id)
                      window.open(selectedContact.linkedinUrl!, '_blank')
                    }}
                    className="flex-1 btn-linkedin"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    Copier & Ouvrir LinkedIn
                  </button>
                  <button
                    onClick={() => generateMessage(selectedContact, messageType)}
                    className="btn-secondary"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recherche Sales Navigator */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Rechercher dans Sales Navigator
          </h2>
        </div>
        <div className="card-body">
          <p className="text-sm text-gray-600 mb-4">
            Lancez une recherche pré-configurée pour trouver les décideurs formation d'une entreprise :
          </p>
          <div className="flex gap-4">
            <input
              type="text"
              id="company-search"
              placeholder="Nom de l'entreprise..."
              className="form-input flex-1"
            />
            <button
              onClick={() => {
                const input = document.getElementById('company-search') as HTMLInputElement
                if (input.value) {
                  openLinkedInSearch(input.value)
                }
              }}
              className="btn-linkedin"
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Ouvre Sales Navigator avec les filtres : formation, learning, development, RH
          </p>
        </div>
      </div>
    </div>
  )
}
