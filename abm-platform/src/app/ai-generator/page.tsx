'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Mail,
  Linkedin,
  FileText,
  RefreshCw,
  User
} from 'lucide-react'

interface Contact {
  id: string
  firstName: string
  lastName: string
  jobTitle: string | null
  email: string | null
  linkedinUrl: string | null
  company: { name: string }
}

const messageTypes = [
  {
    id: 'linkedin_connection',
    label: 'Demande connexion LinkedIn',
    icon: Linkedin,
    description: 'Message court pour une demande de connexion (300 car.)',
  },
  {
    id: 'linkedin_message',
    label: 'Message LinkedIn',
    icon: Linkedin,
    description: 'Message de prospection LinkedIn (500 car.)',
  },
  {
    id: 'email_intro',
    label: 'Email de présentation',
    icon: Mail,
    description: 'Premier email de contact professionnel',
  },
  {
    id: 'email_followup',
    label: 'Email de relance',
    icon: Mail,
    description: 'Relance courtoise sans réponse',
  },
  {
    id: 'email_whitepaper',
    label: 'Email livre blanc',
    icon: FileText,
    description: 'Proposer un livre blanc sur l\'IA',
  },
]

export default function AIGeneratorPage() {
  const searchParams = useSearchParams()
  const preselectedContactId = searchParams.get('contactId')

  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContactId, setSelectedContactId] = useState('')
  const [messageType, setMessageType] = useState('email_intro')
  const [customContext, setCustomContext] = useState('')
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    if (preselectedContactId && contacts.length > 0) {
      setSelectedContactId(preselectedContactId)
    }
  }, [preselectedContactId, contacts])

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      setContacts(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMessage = async () => {
    if (!selectedContactId) {
      alert('Veuillez sélectionner un contact')
      return
    }

    setIsGenerating(true)
    setGeneratedMessage('')

    try {
      const res = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: selectedContactId,
          messageType,
          customContext,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      setGeneratedMessage(data.message)
    } catch (error) {
      console.error('Erreur:', error)
      setGeneratedMessage('Erreur lors de la génération. Vérifiez que la clé API Anthropic est configurée.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedContact = contacts.find(c => c.id === selectedContactId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-purple-500" />
          Générateur IA de Messages
        </h1>
        <p className="mt-1 text-gray-500">
          Créez des messages personnalisés avec Claude
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Sélection contact */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                1. Sélectionnez un contact
              </h2>
            </div>
            <div className="card-body">
              {isLoading ? (
                <p className="text-gray-500">Chargement...</p>
              ) : (
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Choisir un contact --</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} - {contact.company.name}
                      {contact.jobTitle ? ` (${contact.jobTitle})` : ''}
                    </option>
                  ))}
                </select>
              )}

              {selectedContact && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p><strong>{selectedContact.firstName} {selectedContact.lastName}</strong></p>
                  <p className="text-gray-600">{selectedContact.jobTitle || 'Poste non renseigné'}</p>
                  <p className="text-gray-500">{selectedContact.company.name}</p>
                  {selectedContact.email && (
                    <p className="text-blue-600 text-xs mt-1">{selectedContact.email}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Type de message */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                2. Type de message
              </h2>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                {messageTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      messageType === type.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="messageType"
                      value={type.id}
                      checked={messageType === type.id}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Contexte personnalisé */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                3. Contexte additionnel (optionnel)
              </h2>
            </div>
            <div className="card-body">
              <textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Ex: J'ai vu qu'ils viennent de lever des fonds... / Ils ont publié un article sur la transformation digitale..."
                className="form-input"
                rows={3}
              />
            </div>
          </div>

          {/* Bouton générer */}
          <button
            onClick={generateMessage}
            disabled={isGenerating || !selectedContactId}
            className="w-full btn-primary py-3 text-lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Générer le message
              </>
            )}
          </button>
        </div>

        {/* Résultat */}
        <div className="card h-fit sticky top-8">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Message généré</h2>
            {generatedMessage && (
              <button
                onClick={copyToClipboard}
                className="btn-outline text-sm py-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copier
                  </>
                )}
              </button>
            )}
          </div>
          <div className="card-body">
            {!generatedMessage ? (
              <div className="text-center py-16 text-gray-500">
                <Sparkles className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p>Le message généré apparaîtra ici</p>
                <p className="text-sm text-gray-400 mt-1">
                  Sélectionnez un contact et cliquez sur "Générer"
                </p>
              </div>
            ) : (
              <div>
                <textarea
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  className="form-input min-h-[400px] font-mono text-sm"
                />

                {/* Actions rapides */}
                <div className="flex gap-2 mt-4">
                  {selectedContact?.email && messageType.startsWith('email') && (
                    <a
                      href={`mailto:${selectedContact.email}?subject=${encodeURIComponent(
                        generatedMessage.match(/OBJET: (.+)/)?.[1] || 'Contact Mister IA'
                      )}&body=${encodeURIComponent(
                        generatedMessage.replace(/OBJET: .+\n\n/, '')
                      )}`}
                      className="flex-1 btn-primary"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Ouvrir dans Mail
                    </a>
                  )}
                  {selectedContact?.linkedinUrl && messageType.startsWith('linkedin') && (
                    <a
                      href={selectedContact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-linkedin"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      Ouvrir LinkedIn
                    </a>
                  )}
                  <button
                    onClick={generateMessage}
                    className="btn-secondary"
                    title="Régénérer"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
