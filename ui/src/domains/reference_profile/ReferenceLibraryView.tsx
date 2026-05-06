import { useState, useEffect } from 'react'
import {PButton, PHeading, PText, PTag, PSpinner, PModal} from '@porsche-design-system/components-react'
import type { Reference } from './types'
import { referenceProfileApi } from './api'
import ReferenceForm from './components/ReferenceForm'
import UploadPanel from './components/UploadPanel'

export default function ReferenceLibraryView() {
    const [references, setReferences] = useState<Reference[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showUploadPanel, setShowUploadPanel] = useState(false)
    const [editingReference, setEditingReference] = useState<Reference | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [sectorFilter, setSectorFilter] = useState('')
    const [serviceFilter, setServiceFilter] = useState('')

    useEffect(() => {
        loadReferences()
    }, [])

    const loadReferences = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await referenceProfileApi.getReferences({ limit: 100 })
            setReferences(data)
        } catch (err: any) {
            setError(err?.message || 'Failed to load references')
        } finally {
            setLoading(false)
        }
    }

    const handleUploadComplete = async () => {
        setShowUploadPanel(false)
        await loadReferences()
    }

    const handleUpdate = async (data: any) => {
        if (!editingReference) return
        try {
            setIsSubmitting(true)
            await referenceProfileApi.updateReference(editingReference.id, data)
            setEditingReference(null)
            await loadReferences()
        } catch (err: any) {
            alert(`Failed to update reference: ${err?.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileUpload = async (id: string, file: File) => {
        try {
            await referenceProfileApi.uploadReferenceFile(id, file)
            await loadReferences()
        } catch (err: any) {
            alert(`Upload failed: ${err?.message}`)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this reference?')) return

        try {
            await referenceProfileApi.deleteReference(id)
            await loadReferences()
        } catch (err: any) {
            alert(`Delete failed: ${err?.message}`)
        }
    }

    // Filter references
    const filteredReferences = references.filter(ref => {
        const matchesSearch = !searchTerm ||
            ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ref.summary.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesSector = !sectorFilter || ref.sector_tags.includes(sectorFilter)
        const matchesService = !serviceFilter || ref.service_tags.includes(serviceFilter)

        return matchesSearch && matchesSector && matchesService
    })

    // Get unique tags for filters
    const allSectors = Array.from(new Set(references.flatMap(r => r.sector_tags)))
    const allServices = Array.from(new Set(references.flatMap(r => r.service_tags)))

    if (loading) {
        return (
            <div style={{ textAlign: 'center' }}>
                <PSpinner size="large" />
                <PText>Loading references...</PText>
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <PHeading size="large">Error</PHeading>
                <PText>{error}</PText>
                <PButton onClick={loadReferences}>Retry</PButton>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <PHeading size="large">References</PHeading>
                <PButton onClick={() => setShowUploadPanel(true)}>
                    📤 Upload Reference
                </PButton>
            </div>

            {/* Filters */}
            <div style={{
                padding: '1.5rem',
                backgroundColor: '#fff',
                borderRadius: '8px',
                marginBottom: '2rem',
                border: '1px solid #ddd'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by title or summary..."
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            Sector
                        </label>
                        <select
                            value={sectorFilter}
                            onChange={(e) => setSectorFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        >
                            <option value="">All Sectors</option>
                            {allSectors.map(sector => (
                                <option key={sector} value={sector}>{sector}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            Service
                        </label>
                        <select
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        >
                            <option value="">All Services</option>
                            {allServices.map(service => (
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {(searchTerm || sectorFilter || serviceFilter) && (
                    <div style={{ marginTop: '1rem' }}>
                        <PButton
                            variant="secondary"
                            onClick={() => {
                                setSearchTerm('')
                                setSectorFilter('')
                                setServiceFilter('')
                            }}
                        >
                            Clear Filters
                        </PButton>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <PText style={{ marginBottom: '1rem', color: '#666' }}>
                Showing {filteredReferences.length} of {references.length} references
            </PText>

            {/* Reference List */}
            {filteredReferences.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <PText>
                        {references.length === 0
                            ? 'No references found. Upload your first reference to get started.'
                            : 'No references match your filters.'}
                    </PText>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredReferences.map(ref => (
                        <div
                            key={ref.id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                backgroundColor: '#fff'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    <PHeading size="medium" style={{ marginBottom: '0.5rem' }}>
                                        {ref.title}
                                    </PHeading>
                                    <PText style={{ marginBottom: '1rem' }}>{ref.summary}</PText>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        {ref.sector_tags.map(tag => (
                                            <PTag key={tag} color="primary">{tag}</PTag>
                                        ))}
                                        {ref.service_tags.map(tag => (
                                            <PTag key={tag} color="notification-info-soft">{tag}</PTag>
                                        ))}
                                        {ref.capability_tags.map(tag => (
                                            <PTag key={tag} color="notification-success-soft">{tag}</PTag>
                                        ))}
                                    </div>

                                    {ref.document && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                            <PText size="small">
                                                📄 {ref.document.file_name} ({(ref.document.size_bytes / 1024).toFixed(2)} KB)
                                            </PText>
                                            {ref.markdown_status && (
                                                <PText size="small">
                                                    Status: <PTag color={
                                                        ref.markdown_status === 'completed' ? 'notification-success-soft' :
                                                            ref.markdown_status === 'failed' ? 'notification-error-soft' :
                                                                'notification-warning-soft'
                                                    }>{ref.markdown_status}</PTag>
                                                </PText>
                                            )}
                                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                <PButton
                                                    variant="secondary"
                                                    onClick={() => referenceProfileApi.downloadReferenceFile(ref.id, ref.document!.file_name)}
                                                >
                                                    Download
                                                </PButton>
                                                {ref.markdown_status === 'failed' && (
                                                    <PButton
                                                        variant="secondary"
                                                        onClick={async () => {
                                                            await referenceProfileApi.retryMarkdownExtraction(ref.id)
                                                            await loadReferences()
                                                        }}
                                                    >
                                                        Retry Extraction
                                                    </PButton>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <PButton
                                        variant="secondary"
                                        onClick={() => setEditingReference(ref)}
                                    >
                                        Edit
                                    </PButton>
                                    <label>
                                        <PButton variant="secondary">
                                            Upload File
                                        </PButton>
                                        <input
                                            type="file"
                                            accept=".pdf,.docx,.doc,.txt"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleFileUpload(ref.id, file)
                                            }}
                                        />
                                    </label>
                                    <PButton
                                        variant="secondary"
                                        onClick={() => handleDelete(ref.id)}
                                    >
                                        Delete
                                    </PButton>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Panel Modal */}
            {showUploadPanel && (
                <PModal open={showUploadPanel} onDismiss={() => setShowUploadPanel(false)}>
                    <UploadPanel onUploadComplete={handleUploadComplete} type="reference" />
                </PModal>
            )}

            {/* Edit Modal */}
            {editingReference && (
                <PModal open={!!editingReference} onDismiss={() => setEditingReference(null)}>
                    <div style={{ padding: '2rem' }}>
                        <ReferenceForm
                            initialData={{
                                title: editingReference.title,
                                summary: editingReference.summary,
                                sector_tags: editingReference.sector_tags,
                                service_tags: editingReference.service_tags,
                                capability_tags: editingReference.capability_tags,
                                team_ids: editingReference.team_ids
                            }}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingReference(null)}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </PModal>
            )}
        </div>
    )
}
