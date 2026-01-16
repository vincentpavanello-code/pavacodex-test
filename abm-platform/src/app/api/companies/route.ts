import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const companySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.string().optional(),
  description: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  notes: z.string().optional(),
})

// GET - Liste des entreprises
export async function GET() {
  try {
    const companies = await db.company.findMany({
      include: {
        _count: {
          select: { contacts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(companies)
  } catch (error) {
    console.error('Erreur GET companies:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des entreprises' },
      { status: 500 }
    )
  }
}

// POST - Créer une entreprise
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = companySchema.parse(body)

    // Nettoyer les champs vides
    const cleanData = {
      ...data,
      website: data.website || null,
      linkedinUrl: data.linkedinUrl || null,
      industry: data.industry || null,
      size: data.size || null,
      description: data.description || null,
      notes: data.notes || null,
    }

    const company = await db.company.create({
      data: cleanData,
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Erreur POST company:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'entreprise' },
      { status: 500 }
    )
  }
}
