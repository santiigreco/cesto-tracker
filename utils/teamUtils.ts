
/**
 * Normalizes a team name for comparison by:
 * 1. Removing accents
 * 2. Trimming whitespace
 * 3. Converting to lowercase
 * 4. Removing common variants like " A", " B", etc. (optional, but keep it for now)
 */
export const normalizeTeamName = (name: string): string => {
    if (!name) return '';
    return name
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, ' '); // Normalize spaces
};

/**
 * Finds the best match for a team name within a list of available teams.
 * Supports partial matches or normalized exact matches.
 */
export const findBestTeamMatch = <T extends { name: string }>(
    targetName: string,
    availableTeams: T[]
): T | null => {
    if (!targetName) return null;

    const normalizedTarget = normalizeTeamName(targetName);

    // 1. Try exact normalized match
    const exactMatch = availableTeams.find(t => normalizeTeamName(t.name) === normalizedTarget);
    if (exactMatch) return exactMatch;

    // 2. Try partial match (target starts with available team name or vice versa)
    // This handles "Ciudad A" matching "Ciudad"
    const partialMatch = availableTeams.find(t => {
        const norm = normalizeTeamName(t.name);
        return normalizedTarget.startsWith(norm) || norm.startsWith(normalizedTarget);
    });

    return partialMatch || null;
};
