import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Remplace les variables dans un template
// Ex: "Bonjour {{firstName}}" -> "Bonjour Jean"
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match
  })
}

// Génère les initiales d'un nom
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Statuts avec couleurs
export const companyStatusColors: Record<string, string> = {
  IDENTIFIED: 'bg-gray-100 text-gray-800',
  RESEARCHING: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  ENGAGED: 'bg-purple-100 text-purple-800',
  OPPORTUNITY: 'bg-orange-100 text-orange-800',
  CUSTOMER: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
}

export const companyStatusLabels: Record<string, string> = {
  IDENTIFIED: 'Identifiée',
  RESEARCHING: 'Recherche',
  CONTACTED: 'Contactée',
  ENGAGED: 'Engagée',
  OPPORTUNITY: 'Opportunité',
  CUSTOMER: 'Client',
  LOST: 'Perdu',
}

export const contactStatusColors: Record<string, string> = {
  NEW: 'bg-gray-100 text-gray-800',
  RESEARCHING: 'bg-blue-100 text-blue-800',
  TO_CONTACT: 'bg-yellow-100 text-yellow-800',
  CONTACTED: 'bg-indigo-100 text-indigo-800',
  RESPONDED: 'bg-purple-100 text-purple-800',
  MEETING: 'bg-pink-100 text-pink-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  NOT_INTERESTED: 'bg-red-100 text-red-800',
}

export const contactStatusLabels: Record<string, string> = {
  NEW: 'Nouveau',
  RESEARCHING: 'Recherche',
  TO_CONTACT: 'À contacter',
  CONTACTED: 'Contacté',
  RESPONDED: 'A répondu',
  MEETING: 'RDV',
  QUALIFIED: 'Qualifié',
  NOT_INTERESTED: 'Pas intéressé',
}

export const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  CRITICAL: 'bg-red-100 text-red-600',
}

export const priorityLabels: Record<string, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  CRITICAL: 'Critique',
}
