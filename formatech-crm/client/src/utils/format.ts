import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: fr })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy HH:mm', { locale: fr })
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: fr })
}

export function formatMonth(dateStr: string): string {
  // dateStr is in format YYYY-MM
  const [year, month] = dateStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return format(date, 'MMM yyyy', { locale: fr })
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatPhone(phone: string): string {
  if (!phone) return ''
  // Format French phone number
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  return phone
}

export function truncate(str: string, length: number): string {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    lead_entrant: 'bg-blue-100 text-blue-800',
    qualification: 'bg-purple-100 text-purple-800',
    demo_rdv: 'bg-indigo-100 text-indigo-800',
    proposition: 'bg-yellow-100 text-yellow-800',
    negociation: 'bg-orange-100 text-orange-800',
    gagne: 'bg-green-100 text-green-800',
    perdu: 'bg-red-100 text-red-800',
  }
  return colors[stage] || 'bg-gray-100 text-gray-800'
}

export function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    appel: 'phone',
    email: 'mail',
    rdv: 'calendar',
    note: 'file-text',
    changement_etape: 'arrow-right',
    modification: 'edit',
  }
  return icons[type] || 'circle'
}
