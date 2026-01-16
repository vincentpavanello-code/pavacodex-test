import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateContactSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  status: z.enum(['NEW', 'RESEARCHING', 'TO_CONTACT', 'CONTACTED', 'RESPONDED', 'MEETING', 'QUALIFIED', 'NOT_INTERESTED']).optional(),
  isDecisionMaker: z.boolean().optional(),
  engagementScore: z.number().min(0).max(100).optional(),
  notes: z.string().optional().nullable(),
})

// GET - Détails d'un contact
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await db.contact.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        interactions: {
          orderBy: { createdAt: 'desc' }
        },
        emailsSent: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!contact) {
      return NextResponse.json(
        { message: 'Contact non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Erreur GET contact:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du contact' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un contact
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = updateContactSchema.parse(body)

    const contact = await db.contact.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Erreur PUT contact:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du contact' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un contact
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.contact.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE contact:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du contact' },
      { status: 500 }
    )
  }
}
