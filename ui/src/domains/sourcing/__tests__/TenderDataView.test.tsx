import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TenderDataView from '../TenderDataView'
import { api } from '../api'

// Mock the API
vi.mock('../api', () => ({
    api: {
        searchTenders: vi.fn(),
        getTenderStats: vi.fn(),
    }
}))

describe('TenderDataView', () => {
    const mockTenders = [
        {
            id: '1',
            internal_id: 'TED-123456-2024',
            headline: 'Test Tender 1',
            caller: 'Test Caller 1',
            published: '2024-01-01',
            name_website: 'TED Europe',
            url: 'https://example.com/1'
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(api.searchTenders).mockResolvedValue(mockTenders)
        vi.mocked(api.getTenderStats).mockResolvedValue({ total: 100, by_website: {} })
    })

    it('renders correctly and loads tenders', async () => {
        render(<TenderDataView dbMode="cosmos" />)

        expect(screen.getByText('Tender Data')).toBeDefined()

        await waitFor(() => {
            expect(screen.getByText('Test Tender 1')).toBeDefined()
            expect(screen.getByText('Test Caller 1')).toBeDefined()
        })
    })

    it('shows disconnected message when dbMode is disconnected', () => {
        render(<TenderDataView dbMode="disconnected" />)
        expect(screen.getByText('Database Disconnected')).toBeDefined()
        expect(screen.getByText(/Please connect to Cosmos DB/i)).toBeDefined()
    })
})
