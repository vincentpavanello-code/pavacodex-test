import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Détails d'un livre blanc
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const whitepaper = await db.whitepaper.findUnique({
      where: { id: params.id },
      include: {
        campaigns: true
      }
    })

    if (!whitepaper) {
      return NextResponse.json(
        { message: 'Livre blanc non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(whitepaper)
  } catch (error) {
    console.error('Erreur GET whitepaper:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du livre blanc' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un livre blanc
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.whitepaper.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE whitepaper:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du livre blanc' },
      { status: 500 }
    )
  }
}

// PATCH - Incrémenter le compteur de téléchargements
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const whitepaper = await db.whitepaper.update({
      where: { id: params.id },
      data: {
        downloads: { increment: 1 }
      }
    })

    return NextResponse.json(whitepaper)
  } catch (error) {
    console.error('Erreur PATCH whitepaper:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
