import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { contactId, subject, body, campaignId } = await request.json()

    if (!contactId || !subject || !body) {
      return NextResponse.json(
        { message: 'Contact, sujet et corps du mail sont requis' },
        { status: 400 }
      )
    }

    const sendgridApiKey = process.env.SENDGRID_API_KEY
    const fromEmail = process.env.SENDGRID_FROM_EMAIL

    if (!sendgridApiKey || !fromEmail) {
      return NextResponse.json(
        { message: 'Configuration SendGrid manquante' },
        { status: 500 }
      )
    }

    // Récupérer le contact
    const contact = await db.contact.findUnique({
      where: { id: contactId },
      include: { company: true },
    })

    if (!contact || !contact.email) {
      return NextResponse.json(
        { message: 'Contact non trouvé ou email manquant' },
        { status: 404 }
      )
    }

    // Configurer SendGrid
    sgMail.setApiKey(sendgridApiKey)

    const msg = {
      to: contact.email,
      from: fromEmail,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    }

    // Envoyer l'email
    const [response] = await sgMail.send(msg)

    // Enregistrer dans les logs
    const emailLog = await db.emailLog.create({
      data: {
        contactId,
        subject,
        body,
        sendgridId: response.headers['x-message-id']?.toString() || null,
        status: 'SENT',
        sentAt: new Date(),
        campaignId: campaignId || null,
      },
    })

    // Créer une interaction
    await db.interaction.create({
      data: {
        contactId,
        type: 'EMAIL',
        channel: 'EMAIL',
        subject,
        content: body,
      },
    })

    // Mettre à jour le statut du contact si nécessaire
    if (contact.status === 'NEW' || contact.status === 'TO_CONTACT') {
      await db.contact.update({
        where: { id: contactId },
        data: {
          status: 'CONTACTED',
          engagementScore: { increment: 10 },
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      emailLogId: emailLog.id,
    })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}
