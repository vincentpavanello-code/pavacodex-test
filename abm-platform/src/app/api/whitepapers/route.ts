import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const whitepaperSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  fileUrl: z.string().url('URL invalide'),
  fileName: z.string().optional(),
})

// GET - Liste des livres blancs
export async function GET() {
  try {
    const whitepapers = await db.whitepaper.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(whitepapers)
  } catch (error) {
    console.error('Erreur GET whitepapers:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des livres blancs' },
      { status: 500 }
    )
  }
}

// POST - Créer un livre blanc
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = whitepaperSchema.parse(body)

    const whitepaper = await db.whitepaper.create({
      data: {
        title: data.title,
        description: data.description || null,
        fileUrl: data.fileUrl,
        fileName: data.fileName || data.title.toLowerCase().replace(/\s+/g, '-') + '.pdf',
      },
    })

    return NextResponse.json(whitepaper, { status: 201 })
  } catch (error) {
    console.error('Erreur POST whitepaper:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de la création du livre blanc' },
      { status: 500 }
    )
  }
}
