import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// API Apollo.io pour enrichir les données d'une entreprise
// Documentation: https://apolloio.github.io/apollo-api-docs/

interface ApolloContact {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone_numbers: { raw_number: string }[]
  title: string
  linkedin_url: string
  organization: {
    name: string
  }
}

interface ApolloSearchResponse {
  people: ApolloContact[]
  pagination: {
    total_entries: number
    total_pages: number
  }
}

export async function POST(request: Request) {
  try {
    const { companyId, companyName } = await request.json()

    if (!companyName) {
      return NextResponse.json(
        { message: 'Le nom de l\'entreprise est requis' },
        { status: 400 }
      )
    }

    const apolloApiKey = process.env.APOLLO_API_KEY

    if (!apolloApiKey) {
      return NextResponse.json(
        { message: 'Clé API Apollo.io non configurée' },
        { status: 500 }
      )
    }

    // Recherche de personnes travaillant dans les domaines formation/RH
    // On filtre par titre : "formation", "learning", "development", "RH", "HR", "talent"
    const searchTitles = [
      'formation',
      'learning',
      'development',
      'L&D',
      'RH',
      'HR',
      'ressources humaines',
      'talent',
      'training',
      'DRH',
      'directeur formation',
      'responsable formation',
    ]

    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        api_key: apolloApiKey,
        q_organization_name: companyName,
        person_titles: searchTitles,
        page: 1,
        per_page: 25,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erreur Apollo API:', error)
      return NextResponse.json(
        { message: 'Erreur lors de la recherche Apollo.io' },
        { status: response.status }
      )
    }

    const data: ApolloSearchResponse = await response.json()

    // Créer les contacts dans la base de données
    const createdContacts = []

    for (const person of data.people) {
      // Vérifier si le contact existe déjà (par email ou LinkedIn)
      const existingContact = await db.contact.findFirst({
        where: {
          OR: [
            person.email ? { email: person.email } : {},
            person.linkedin_url ? { linkedinUrl: person.linkedin_url } : {},
          ].filter(c => Object.keys(c).length > 0),
          companyId,
        },
      })

      if (!existingContact && person.first_name && person.last_name) {
        const contact = await db.contact.create({
          data: {
            firstName: person.first_name,
            lastName: person.last_name,
            email: person.email,
            phone: person.phone_numbers?.[0]?.raw_number || null,
            jobTitle: person.title,
            linkedinUrl: person.linkedin_url,
            companyId,
            isDecisionMaker: isDecisionMaker(person.title),
          },
        })
        createdContacts.push(contact)
      }
    }

    // Mettre à jour le statut de l'entreprise
    await db.company.update({
      where: { id: companyId },
      data: { status: 'RESEARCHING' },
    })

    return NextResponse.json({
      message: `${createdContacts.length} contacts trouvés et ajoutés`,
      totalFound: data.pagination.total_entries,
      contactsCreated: createdContacts.length,
      contacts: createdContacts,
    })
  } catch (error) {
    console.error('Erreur enrichissement:', error)
    return NextResponse.json(
      { message: 'Erreur lors de l\'enrichissement' },
      { status: 500 }
    )
  }
}

// Détermine si le titre indique un décideur
function isDecisionMaker(title: string | null): boolean {
  if (!title) return false

  const decisionMakerKeywords = [
    'directeur',
    'director',
    'head',
    'chief',
    'vp',
    'vice president',
    'responsable',
    'manager',
    'lead',
    'drh',
    'cfo',
    'coo',
    'ceo',
  ]

  const titleLower = title.toLowerCase()
  return decisionMakerKeywords.some(keyword => titleLower.includes(keyword))
}
