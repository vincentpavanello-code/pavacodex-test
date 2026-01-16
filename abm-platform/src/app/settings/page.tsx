'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  Key,
  Mail,
  Linkedin,
  Database,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'

interface ApiStatus {
  configured: boolean
  name: string
  key: string
  docUrl: string
  description: string
}

export default function SettingsPage() {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([
    {
      name: 'Claude API (Anthropic)',
      key: 'ANTHROPIC_API_KEY',
      configured: false,
      docUrl: 'https://console.anthropic.com/',
      description: 'Génération de messages personnalisés avec IA',
    },
    {
      name: 'SendGrid',
      key: 'SENDGRID_API_KEY',
      configured: false,
      docUrl: 'https://app.sendgrid.com/settings/api_keys',
      description: 'Envoi d\'emails en masse',
    },
    {
      name: 'Apollo.io',
      key: 'APOLLO_API_KEY',
      configured: false,
      docUrl: 'https://app.apollo.io/#/settings/integrations/api',
      description: 'Enrichissement de données (recherche de contacts)',
    },
  ])

  useEffect(() => {
    // Vérifier les statuts des APIs côté serveur
    checkApiStatuses()
  }, [])

  const checkApiStatuses = async () => {
    try {
      const res = await fetch('/api/settings/check-apis')
      if (res.ok) {
        const data = await res.json()
        setApiStatuses(prev => prev.map(api => ({
          ...api,
          configured: data[api.key] || false
        })))
      }
    } catch (error) {
      console.error('Erreur vérification APIs:', error)
    }
  }

  const configuredCount = apiStatuses.filter(a => a.configured).length

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-7 w-7 text-gray-500" />
          Paramètres
        </h1>
        <p className="mt-1 text-gray-500">
          Configuration des clés API et paramètres de l'application
        </p>
      </div>

      {/* Statut global */}
      <div className={`card ${configuredCount === apiStatuses.length ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="card-body flex items-center gap-4">
          {configuredCount === apiStatuses.length ? (
            <>
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-800">Toutes les APIs sont configurées</p>
                <p className="text-sm text-green-600">La plateforme est prête à être utilisée</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-800">
                  {configuredCount}/{apiStatuses.length} APIs configurées
                </p>
                <p className="text-sm text-yellow-600">
                  Configurez les APIs manquantes pour utiliser toutes les fonctionnalités
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Liste des APIs */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Key className="h-5 w-5" />
            Clés API
          </h2>
        </div>
        <div className="divide-y">
          {apiStatuses.map((api) => (
            <div key={api.key} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    api.configured ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {api.key.includes('ANTHROPIC') && <Database className="h-5 w-5 text-purple-600" />}
                    {api.key.includes('SENDGRID') && <Mail className="h-5 w-5 text-blue-600" />}
                    {api.key.includes('APOLLO') && <Linkedin className="h-5 w-5 text-orange-600" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{api.name}</h3>
                    <p className="text-sm text-gray-500">{api.description}</p>
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                      {api.key}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {api.configured ? (
                    <span className="badge bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Configuré
                    </span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-600 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Non configuré
                    </span>
                  )}
                  <a
                    href={api.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs py-1"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Obtenir
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-gray-900">Comment configurer les clés API ?</h2>
        </div>
        <div className="card-body">
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
            <li>
              Créez un fichier <code className="bg-gray-100 px-1 rounded">.env</code> à la racine du projet
              (copiez <code className="bg-gray-100 px-1 rounded">.env.example</code>)
            </li>
            <li>
              Obtenez vos clés API depuis les liens ci-dessus
            </li>
            <li>
              Ajoutez les clés dans le fichier <code className="bg-gray-100 px-1 rounded">.env</code> :
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg mt-2 overflow-x-auto">
{`ANTHROPIC_API_KEY="sk-ant-api03-xxxxx"
SENDGRID_API_KEY="SG.xxxxx"
SENDGRID_FROM_EMAIL="contact@mister-ia.fr"
APOLLO_API_KEY="xxxxx"`}
              </pre>
            </li>
            <li>
              Redémarrez l'application : <code className="bg-gray-100 px-1 rounded">npm run dev</code>
            </li>
          </ol>
        </div>
      </div>

      {/* Coûts estimés */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-gray-900">Estimation des coûts mensuels</h2>
        </div>
        <div className="card-body">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Service</th>
                <th className="text-left py-2">Plan recommandé</th>
                <th className="text-right py-2">Coût estimé</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Claude API</td>
                <td className="py-2 text-gray-500">Pay as you go</td>
                <td className="py-2 text-right">~20-50€/mois</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">SendGrid</td>
                <td className="py-2 text-gray-500">Essentials (40k emails)</td>
                <td className="py-2 text-right">~15-20€/mois</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Apollo.io</td>
                <td className="py-2 text-gray-500">Basic</td>
                <td className="py-2 text-right">~49€/mois</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">LinkedIn Sales Navigator</td>
                <td className="py-2 text-gray-500">Core</td>
                <td className="py-2 text-right">~80€/mois</td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2">Total estimé</td>
                <td></td>
                <td className="py-2 text-right">~165-200€/mois</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-3">
            * Ces coûts sont des estimations et peuvent varier selon l'utilisation
          </p>
        </div>
      </div>
    </div>
  )
}
