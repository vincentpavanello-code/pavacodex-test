'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Send,
  Eye,
  Upload,
  Link as LinkIcon
} from 'lucide-react'

interface Whitepaper {
  id: string
  title: string
  description: string | null
  fileName: string
  fileUrl: string
  fileSize: number | null
  downloads: number
  createdAt: string
}

export default function WhitepapersPage() {
  const [whitepapers, setWhitepapers] = useState<Whitepaper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWhitepaper, setNewWhitepaper] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileName: '',
  })

  useEffect(() => {
    fetchWhitepapers()
  }, [])

  const fetchWhitepapers = async () => {
    try {
      const res = await fetch('/api/whitepapers')
      if (res.ok) {
        const data = await res.json()
        setWhitepapers(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddWhitepaper = async () => {
    if (!newWhitepaper.title || !newWhitepaper.fileUrl) {
      alert('Titre et URL du fichier requis')
      return
    }

    try {
      const res = await fetch('/api/whitepapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWhitepaper),
      })

      if (res.ok) {
        setShowAddModal(false)
        setNewWhitepaper({ title: '', description: '', fileUrl: '', fileName: '' })
        fetchWhitepapers()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ?`)) return

    try {
      const res = await fetch(`/api/whitepapers/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchWhitepapers()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-orange-500" />
            Livres Blancs
          </h1>
          <p className="mt-1 text-gray-500">
            Gérez vos ressources à partager avec vos prospects
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un livre blanc
        </button>
      </div>

      {/* Info box */}
      <div className="card bg-orange-50 border-orange-200">
        <div className="card-body">
          <p className="text-sm text-orange-800">
            <strong>💡 Comment ça marche ?</strong><br />
            1. Uploadez votre PDF sur un service comme Google Drive, Dropbox ou AWS S3<br />
            2. Copiez le lien de partage public ici<br />
            3. Utilisez le générateur IA pour créer des emails proposant ce livre blanc
          </p>
        </div>
      </div>

      {/* Liste des livres blancs */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : whitepapers.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun livre blanc
          </h3>
          <p className="text-gray-500 mb-4">
            Ajoutez des ressources à partager avec vos prospects
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un livre blanc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whitepapers.map((wp) => (
            <div key={wp.id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex gap-1">
                    <a
                      href={wp.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Voir"
                    >
                      <Eye className="h-4 w-4 text-gray-500" />
                    </a>
                    <button
                      onClick={() => handleDelete(wp.id, wp.title)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mt-4">
                  {wp.title}
                </h3>
                {wp.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {wp.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {wp.downloads} téléchargements
                  </span>
                  <a
                    href={`/ai-generator?whitepaperId=${wp.id}`}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Send className="h-4 w-4" />
                    Créer campagne
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ajouter un livre blanc
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Titre *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Guide complet de l'IA en entreprise"
                    value={newWhitepaper.title}
                    onChange={(e) => setNewWhitepaper({ ...newWhitepaper, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Brève description du contenu..."
                    value={newWhitepaper.description}
                    onChange={(e) => setNewWhitepaper({ ...newWhitepaper, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">URL du fichier *</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      className="form-input flex-1"
                      placeholder="https://drive.google.com/..."
                      value={newWhitepaper.fileUrl}
                      onChange={(e) => setNewWhitepaper({ ...newWhitepaper, fileUrl: e.target.value })}
                    />
                    <span className="btn-outline">
                      <LinkIcon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Lien vers Google Drive, Dropbox, S3, etc.
                  </p>
                </div>

                <div>
                  <label className="form-label">Nom du fichier</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="guide-ia-entreprise.pdf"
                    value={newWhitepaper.fileName}
                    onChange={(e) => setNewWhitepaper({ ...newWhitepaper, fileName: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddWhitepaper}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
