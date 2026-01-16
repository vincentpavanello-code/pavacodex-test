import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const contactSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  companyId: z.string().min(1, 'L\'entreprise est requise'),
  isDecisionMaker: z.boolean().default(false),
  notes: z.string().optional(),
})

// GET - Liste des contacts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    const where = companyId ? { companyId } : {}

    const contacts = await db.contact.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Erreur GET contacts:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des contacts' },
      { status: 500 }
    )
  }
}

// POST - Créer un contact
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Nettoyer les champs vides
    const cleanData = {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      linkedinUrl: data.linkedinUrl || null,
      jobTitle: data.jobTitle || null,
      department: data.department || null,
      notes: data.notes || null,
    }

    const contact = await db.contact.create({
      data: cleanData,
      include: {
        company: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Erreur POST contact:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la création du contact' },
      { status: 500 }
    )
  }
}
