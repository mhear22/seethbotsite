import { prisma } from '../lib/prisma';

/**
 * Parse dependencies from ticket description
 * Looks for patterns like "depends on #123", "requires #123", "blocked by #123"
 * Supports multiple ticket IDs like "depends on #123 and #124" or "requires #123, #124"
 * Returns array of ticket IDs
 */
export function parseDependencies(description: string | null): number[] {
  if (!description) return [];

  const dependencies: number[] = [];

  // Find all sections that contain dependency phrases
  const dependencyPhrases = [
    /depends\s+on\s+([^\n.]+)/gi,
    /requires\s+([^\n.]+)/gi,
    /blocked\s+by\s+([^\n.]+)/gi
  ];

  for (const phrasePattern of dependencyPhrases) {
    phrasePattern.lastIndex = 0; // Reset regex state
    let phraseMatch;
    while ((phraseMatch = phrasePattern.exec(description)) !== null) {
      // Extract the text after the dependency phrase
      const phraseText = phraseMatch[1];

      // Find all ticket IDs in this phrase (with or without # prefix)
      const ticketIds = phraseText.match(/#?(\d+)/g);
      if (ticketIds) {
        for (const idWithHash of ticketIds) {
          const ticketId = parseInt(idWithHash.replace('#', ''), 10);
          if (!isNaN(ticketId) && !dependencies.includes(ticketId)) {
            dependencies.push(ticketId);
          }
        }
      }
    }
  }

  return dependencies.sort((a, b) => a - b);
}

/**
 * Safely parse JSON string
 * Returns the parsed value if valid, or null if invalid
 */
export function safeJsonParse<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) {
    return defaultValue;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return defaultValue;
  }
}

/**
 * Check if a ticket is blocked based on its dependencies
 * A ticket is blocked if any of its dependencies are not completed
 */
export async function isTicketBlocked(dependencies: number[]): Promise<boolean> {
  if (!dependencies || dependencies.length === 0) return false;

  // Check if all dependency tickets are completed or declined
  for (const depId of dependencies) {
    const depTicket = await prisma.ticket.findUnique({
      where: { id: depId },
      select: { status: true }
    });

    // If dependency doesn't exist or is not completed/declined, ticket is blocked
    if (!depTicket || !['completed', 'declined'].includes(depTicket.status)) {
      return true;
    }
  }

  return false;
}

/**
 * Settings helpers
 */
export async function getIgnoreMode(): Promise<boolean> {
  const setting = await prisma.setting.findUnique({
    where: { key: 'ignore_mode' }
  });
  return setting?.value === 'true';
}

export async function setIgnoreMode(enabled: boolean): Promise<void> {
  await prisma.setting.upsert({
    where: { key: 'ignore_mode' },
    create: {
      key: 'ignore_mode',
      value: String(enabled)
    },
    update: {
      value: String(enabled),
      updated_at: new Date()
    }
  });
}
