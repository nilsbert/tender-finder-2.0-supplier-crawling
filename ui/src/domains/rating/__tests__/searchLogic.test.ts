import { describe, it, expect } from 'vitest';

/**
 * Search Logic Tests
 * 
 * These tests verify the search filtering logic used in RatingDashboardView.
 * The actual implementation sends search queries to the backend API, but we test
 * the client-side filtering logic here.
 */

interface Tender {
    id: string;
    headline: string;
    description?: string;
    name_website?: string;
    rating_total?: number;
}

/**
 * Client-side search filter function
 * Matches search query against tender headline and description (case-insensitive)
 */
function filterTendersBySearch(tenders: Tender[], searchQuery: string): Tender[] {
    if (!searchQuery || searchQuery.trim() === '') {
        return tenders;
    }

    const query = searchQuery.toLowerCase().trim();

    return tenders.filter(tender => {
        const headline = (tender.headline || '').toLowerCase();
        const description = (tender.description || '').toLowerCase();

        return headline.includes(query) || description.includes(query);
    });
}

describe('Search Logic', () => {
    const mockTenders: Tender[] = [
        {
            id: '1',
            headline: 'Solar Panel Installation in Vienna',
            description: 'Installation of photovoltaic systems',
            name_website: 'TED Europe',
            rating_total: 85,
        },
        {
            id: '2',
            headline: 'IT Consulting Services',
            description: 'Software development and consulting for solar energy projects',
            name_website: 'Austria USP',
            rating_total: 72,
        },
        {
            id: '3',
            headline: 'Building Renovation',
            description: 'General construction work',
            name_website: 'Bund.de',
            rating_total: 45,
        },
    ];

    it('should return all tenders when search query is empty', () => {
        const result = filterTendersBySearch(mockTenders, '');
        expect(result).toHaveLength(3);
        expect(result).toEqual(mockTenders);
    });

    it('should return all tenders when search query is whitespace', () => {
        const result = filterTendersBySearch(mockTenders, '   ');
        expect(result).toHaveLength(3);
    });

    it('should filter tenders by headline (case-insensitive)', () => {
        const result = filterTendersBySearch(mockTenders, 'vienna');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should filter tenders by description (case-insensitive)', () => {
        const result = filterTendersBySearch(mockTenders, 'photovoltaic');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should match tenders in both headline and description', () => {
        const result = filterTendersBySearch(mockTenders, 'solar');
        expect(result).toHaveLength(2);
        expect(result.map(t => t.id)).toContain('1');
        expect(result.map(t => t.id)).toContain('2');
    });

    it('should handle uppercase search queries', () => {
        const result = filterTendersBySearch(mockTenders, 'VIENNA');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should handle mixed case search queries', () => {
        const result = filterTendersBySearch(mockTenders, 'SoLaR');
        expect(result).toHaveLength(2);
    });

    it('should return empty array when no matches found', () => {
        const result = filterTendersBySearch(mockTenders, 'nonexistent');
        expect(result).toHaveLength(0);
    });

    it('should handle special characters in search query', () => {
        const tendersWithSpecialChars: Tender[] = [
            {
                id: '1',
                headline: 'Project (Phase 1)',
                description: 'Test & Development',
            },
        ];

        const result = filterTendersBySearch(tendersWithSpecialChars, '(Phase');
        expect(result).toHaveLength(1);
    });

    it('should handle partial word matches', () => {
        const result = filterTendersBySearch(mockTenders, 'Consult');
        expect(result).toHaveLength(1); // Matches "Consulting" in headline of tender #2
        expect(result[0].id).toBe('2');
    });

    it('should trim whitespace from search query', () => {
        const result = filterTendersBySearch(mockTenders, '  vienna  ');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should handle tenders with missing description', () => {
        const tendersWithoutDesc: Tender[] = [
            {
                id: '1',
                headline: 'Solar Panel Installation',
            },
        ];

        const result = filterTendersBySearch(tendersWithoutDesc, 'solar');
        expect(result).toHaveLength(1);
    });

    it('should handle tenders with missing headline', () => {
        const tendersWithoutHeadline: Tender[] = [
            {
                id: '1',
                headline: '',
                description: 'Solar energy project',
            },
        ];

        const result = filterTendersBySearch(tendersWithoutHeadline, 'solar');
        expect(result).toHaveLength(1);
    });
});
