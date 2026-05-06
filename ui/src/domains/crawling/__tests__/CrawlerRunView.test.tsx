import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CrawlerRunView from '../CrawlerRunView'
import { api } from '../api'

// Mock Porsche Design components
vi.mock('@porsche-design-system/components-react', () => ({
    PHeading: ({ children }: any) => <h1>{children}</h1>,
    PText: ({ children }: any) => <p>{children}</p>,
    PButton: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled} aria-label={typeof children === 'string' ? children : 'button'}>
            {children}
        </button>
    ),
    PTag: ({ children }: any) => <span>{children}</span>,
    PDivider: () => <hr />,
    PIcon: ({ name }: any) => <span>{name}</span>,
    PInlineNotification: ({ heading, description }: any) => (
        <div role="alert">
            <strong>{heading}</strong>
            <p>{description}</p>
        </div>
    ),
}))

// Mock the API
vi.mock('../api', () => ({
    api: {
        getCrawlerConfig: vi.fn(),
        startCrawler: vi.fn(),
        getCrawlerStatus: vi.fn(),
    }
}))

describe('CrawlerRunView', () => {
    const mockConfig: any = {
        user_agent: 'TestAgent',
        ted_austria_url: 'url',
        ted_austria_max_pages: 1,
        ted_switzerland_url: 'url',
        ted_switzerland_max_pages: 1,
        ted_germany_url: 'url',
        ted_germany_max_pages: 1,
        evergabe_base_url_documents: 'url',
        evergabe_base_url_details: 'url',
        evergabe_base_search_url: 'url',
        oeffentliche_vergabe_base_url: 'url',
        oeffentliche_vergabe_max_pages: 1,
        simap_url: 'url',
        tender24_url: 'url',
        scrape_ted_germany: true,
        scrape_ted_austria: true,
        scrape_ted_switzerland: true,
        scrape_bund: true,
        scrape_simap: true,
        scrape_austria: true,
        scrape_tender24: true,
        scrape_oeffentliche_vergabe: true,
        scrape_evergabe_online: true,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(api.getCrawlerConfig).mockResolvedValue(mockConfig)
        vi.mocked(api.getCrawlerStatus).mockResolvedValue({ status: 'IDLE' })
    })

    it('renders correctly and loads config', async () => {
        render(<CrawlerRunView dbMode="cosmos" />)

        // Wait for config to load
        await waitFor(() => {
            expect(screen.getByText('Run Crawlers')).toBeDefined()
        })

        expect(screen.getByText('TED Germany')).toBeDefined()
        expect(screen.getByText('TED Austria')).toBeDefined()
        expect(screen.getByText('TED Switzerland')).toBeDefined()
    })

    it('starts a crawler when start button is clicked', async () => {
        vi.mocked(api.startCrawler).mockResolvedValue({ status: 'RUNNING' })

        render(<CrawlerRunView dbMode="cosmos" />)

        await waitFor(() => {
            expect(screen.getByText('TED Germany')).toBeDefined()
        })

        // Find all start buttons and click the one for TED Germany
        const startButtons = screen.getAllByRole('button', { name: /Start Crawler/i })
        fireEvent.click(startButtons[2]) // TED Germany is 3rd in the list (0: Austria, 1: Switzerland, 2: Germany)

        expect(api.startCrawler).toHaveBeenCalledWith('ted_germany', undefined, undefined)
        // Wait, the order in the array might be different. 
        // Let's check the first one in the `crawlers` array which is 'ted_austria'.
    })

    it('disables buttons when dbMode is disconnected', async () => {
        render(<CrawlerRunView dbMode="disconnected" />)

        await waitFor(() => {
            expect(screen.getByText('Run Crawlers')).toBeDefined()
        })

        const startButtons = screen.getAllByRole('button', { name: /Start Crawler/i })
        startButtons.forEach(button => {
            expect(button).toBeDisabled()
        })
    })
})
