import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().url().optional().nullable(),
  industry: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  status: z.enum(['IDENTIFIED', 'RESEARCHING', 'CONTACTED', 'ENGAGED', 'OPPORTUNITY', 'CUSTOMER', 'LOST']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  notes: z.string().optional().nullable(),
})

// GET - Détails d'une entreprise
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const company = await db.company.findUnique({
      where: { id: params.id },
      include: {
        contacts: {
          orderBy: { createdAt: 'desc' }
        },
        campaigns: {
          include: {
            campaign: true
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { message: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Erreur GET company:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'entreprise' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une entreprise
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = updateCompanySchema.parse(body)

    const company = await db.company.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Erreur PUT company:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de l\'entreprise' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une entreprise
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.company.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE company:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de l\'entreprise' },
      { status: 500 }
    )
  }
}
