import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

// Génération de messages personnalisés avec Claude
export async function POST(request: Request) {
  try {
    const { contactId, messageType, customContext } = await request.json()

    if (!contactId) {
      return NextResponse.json(
        { message: 'L\'ID du contact est requis' },
        { status: 400 }
      )
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY

    if (!anthropicApiKey) {
      return NextResponse.json(
        { message: 'Clé API Anthropic non configurée' },
        { status: 500 }
      )
    }

    // Récupérer les infos du contact et de l'entreprise
    const contact = await db.contact.findUnique({
      where: { id: contactId },
      include: {
        company: true,
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!contact) {
      return NextResponse.json(
        { message: 'Contact non trouvé' },
        { status: 404 }
      )
    }

    const client = new Anthropic({
      apiKey: anthropicApiKey,
    })

    // Construire le contexte pour Claude
    const context = buildContext(contact, messageType, customContext)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: context,
        },
      ],
    })

    // Extraire le texte de la réponse
    const generatedMessage = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    return NextResponse.json({
      message: generatedMessage,
      contact: {
        name: `${contact.firstName} ${contact.lastName}`,
        company: contact.company.name,
        jobTitle: contact.jobTitle,
      },
    })
  } catch (error) {
    console.error('Erreur génération message:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la génération du message' },
      { status: 500 }
    )
  }
}

function buildContext(
  contact: {
    firstName: string
    lastName: string
    jobTitle: string | null
    company: { name: string; industry: string | null; description: string | null }
    interactions: { type: string; content: string | null }[]
  },
  messageType: string,
  customContext: string
): string {
  const baseContext = `
Tu es un expert en prospection B2B pour Mister IA, une société de formation spécialisée en Intelligence Artificielle.

Voici les informations sur le contact :
- Prénom : ${contact.firstName}
- Nom : ${contact.lastName}
- Poste : ${contact.jobTitle || 'Non renseigné'}
- Entreprise : ${contact.company.name}
- Secteur : ${contact.company.industry || 'Non renseigné'}
- Description entreprise : ${contact.company.description || 'Non renseignée'}

${contact.interactions.length > 0 ? `
Historique des interactions récentes :
${contact.interactions.map((i) => `- ${i.type}: ${i.content || 'Pas de détail'}`).join('\n')}
` : ''}

${customContext ? `Contexte supplémentaire : ${customContext}` : ''}
`

  const prompts: Record<string, string> = {
    linkedin_connection: `
${baseContext}

Génère une demande de connexion LinkedIn courte et personnalisée (max 300 caractères).
Le message doit :
- Être professionnel mais chaleureux
- Mentionner un point commun ou un intérêt pour leur domaine
- Ne PAS être commercial directement
- Donner envie d'accepter la connexion

Réponds uniquement avec le message, sans guillemets ni explication.
`,

    linkedin_message: `
${baseContext}

Génère un message LinkedIn de prospection personnalisé (max 500 caractères).
Le message doit :
- Commencer par une accroche personnalisée liée à leur poste/entreprise
- Mentionner brièvement Mister IA et notre expertise en formation IA
- Proposer une valeur concrète (insight, ressource, échange)
- Terminer par une question ouverte ou une proposition de call
- Être naturel, pas commercial

Réponds uniquement avec le message, sans guillemets ni explication.
`,

    email_intro: `
${baseContext}

Génère un email de premier contact professionnel.
L'email doit inclure :
- Un objet accrocheur et personnalisé
- Une accroche liée à leur entreprise/secteur
- Présentation concise de Mister IA et notre valeur pour la formation IA
- Une proposition concrète (démo, call, ressource gratuite)
- Un CTA clair

Format de réponse :
OBJET: [objet de l'email]

[Corps de l'email]

Signature :
[Prénom Nom]
Mister IA - Formation en Intelligence Artificielle
`,

    email_followup: `
${baseContext}

Génère un email de relance courtois suite à un premier contact sans réponse.
L'email doit :
- Être court (3-4 phrases max)
- Rappeler brièvement le contexte
- Apporter une nouvelle valeur (chiffre, insight, cas client)
- Proposer une alternative simple (call de 15min, envoi de doc)

Format de réponse :
OBJET: [objet de l'email]

[Corps de l'email]
`,

    email_whitepaper: `
${baseContext}

Génère un email proposant un livre blanc sur l'IA en entreprise.
L'email doit :
- Avoir un objet qui donne envie d'ouvrir
- Accrocher avec un problème/enjeu de leur secteur
- Présenter le livre blanc comme une ressource de valeur
- Inciter à télécharger sans être trop commercial

Format de réponse :
OBJET: [objet de l'email]

[Corps de l'email]
`,
  }

  return prompts[messageType] || `${baseContext}\n\nGénère un message de prospection personnalisé pour ce contact.`
}
