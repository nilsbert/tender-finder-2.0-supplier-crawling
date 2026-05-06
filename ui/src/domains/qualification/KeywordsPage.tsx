
import { useState } from 'react'
import {PButton,
    
    PHeading,
    PText,
    PBanner,
    PFlex} from '@porsche-design-system/components-react'
import { StandardPageHeader } from '../../components/StandardPageHeader'

export const KeywordsPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const handleRerateNotEnriched = async () => {
        setIsLoading(true)
        setNotification(null)
        try {
            const response = await fetch('/api/qualification/rerate-not-enriched', { method: 'POST' });

            if (response.ok) {
                setNotification({ type: 'success', message: 'Rerate process started in background.' })
            } else {
                throw new Error('Failed to start rerate process')
            }
        } catch (error) {
            console.error(error)
            setNotification({ type: 'error', message: 'Failed to start rerate process.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-content-wrapper">
            {/* We generally want a container here but since the button is moving to the dashboard, 
            this page might just be for managing keywords now, or we can keep the button here too as a backup.
            The user said "bring back the old qualification section", which usually implies the keyword list.
            Wait, the keyword list IS the qualification section in the codebase (RatingApp).
            I will keep this simple for now as requested.
        */}
            <div style={{ padding: '32px 24px' }}>
                <StandardPageHeader
                    title="Rating Keywords"
                    subtitle="Manage keywords and trigger rating updates."
                />

                <div style={{ marginTop: '24px' }}>
                    {notification && (
                        <div style={{ marginBottom: '16px' }}>
                            <PBanner state={notification.type}>
                                {notification.message}
                            </PBanner>
                        </div>
                    )}

                    <PFlex>
                        <PButton
                            variant="primary"
                            loading={isLoading}
                            onClick={handleRerateNotEnriched}
                        >
                            Rerate All Not Enriched Tenders
                        </PButton>
                    </PFlex>

                    <div style={{ marginTop: '16px' }}>
                        <PText>
                            This action will trigger a background job to rate all tenders that have a score of 0.0 using the current keywords.
                        </PText>
                    </div>
                </div>
            </div>
        </div>
    )
}
// Default export for lazy loading if needed, though we used named import in App.tsx
export default KeywordsPage
