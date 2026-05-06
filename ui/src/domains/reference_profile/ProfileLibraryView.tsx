import { useState, useEffect } from 'react'
import {PButton, PHeading, PText, PTag, PSpinner, PModal} from '@porsche-design-system/components-react'
import type { Profile, ProfileType } from './types'
import { referenceProfileApi } from './api'
import ProfileForm from './components/ProfileForm'
import UploadPanel from './components/UploadPanel'

export default function ProfileLibraryView() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showUploadPanel, setShowUploadPanel] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<ProfileType | ''>('')
    const [capabilityFilter, setCapabilityFilter] = useState('')

    useEffect(() => {
        loadProfiles()
    }, [])

    const loadProfiles = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await referenceProfileApi.getProfiles({
                limit: 100
            })
            setProfiles(data)
        } catch (err: any) {
            setError(err?.message || 'Failed to load profiles')
        } finally {
            setLoading(false)
        }
    }

    const handleUploadComplete = async () => {
        setShowUploadPanel(false)
        await loadProfiles()
    }

    const handleCreate = async (data: any) => {
        try {
            setIsSubmitting(true)
            await referenceProfileApi.createProfile(data)
            setShowCreateModal(false)
            await loadProfiles()
        } catch (err: any) {
            alert(`Failed to create profile: ${err?.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (data: any) => {
        if (!editingProfile) return
        try {
            setIsSubmitting(true)
            await referenceProfileApi.updateProfile(editingProfile.id, editingProfile.type, data)
            setEditingProfile(null)
            await loadProfiles()
        } catch (err: any) {
            alert(`Failed to update profile: ${err?.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, profileType: ProfileType) => {
        if (!confirm('Are you sure you want to delete this profile?')) return

        try {
            await referenceProfileApi.deleteProfile(id, profileType)
            await loadProfiles()
        } catch (err: any) {
            alert(`Delete failed: ${err?.message}`)
        }
    }

    // Filter profiles
    const filteredProfiles = profiles.filter(profile => {
        const matchesSearch = !searchTerm ||
            profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile.summary.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = !typeFilter || profile.type === typeFilter
        const matchesCapability = !capabilityFilter || profile.capability_tags.includes(capabilityFilter)

        return matchesSearch && matchesType && matchesCapability
    })

    // Get unique capabilities for filter
    const allCapabilities = Array.from(new Set(profiles.flatMap(p => p.capability_tags)))

    if (loading) {
        return (
            <div style={{ textAlign: 'center' }}>
                <PSpinner size="large" />
                <PText>Loading profiles...</PText>
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <PHeading size="large">Error</PHeading>
                <PText>{error}</PText>
                <PButton onClick={loadProfiles}>Retry</PButton>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <PHeading size="large">Profiles</PHeading>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <PButton onClick={() => setShowUploadPanel(true)}>
                        📤 Upload Profile
                    </PButton>
                    <PButton variant="secondary" onClick={() => setShowCreateModal(true)}>
                        + Manual Create
                    </PButton>
                </div>
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
                            placeholder="Search by name, position or summary..."
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
                            Type
                        </label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as ProfileType | '')}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        >
                            <option value="">All Types</option>
                            <option value="team">Teams</option>
                            <option value="expert">Experts</option>
                            <option value="department">Departments</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            Capability
                        </label>
                        <select
                            value={capabilityFilter}
                            onChange={(e) => setCapabilityFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        >
                            <option value="">All Capabilities</option>
                            {allCapabilities.map(capability => (
                                <option key={capability} value={capability}>{capability}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {(searchTerm || typeFilter || capabilityFilter) && (
                    <div style={{ marginTop: '1rem' }}>
                        <PButton
                            variant="secondary"
                            onClick={() => {
                                setSearchTerm('')
                                setTypeFilter('')
                                setCapabilityFilter('')
                            }}
                        >
                            Clear Filters
                        </PButton>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <PText style={{ marginBottom: '1rem', color: '#666' }}>
                Showing {filteredProfiles.length} of {profiles.length} profiles
            </PText>

            {/* Profile List - Table Layout */}
            {filteredProfiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <PText>
                        {profiles.length === 0
                            ? 'No profiles found. Upload your first profile to get started.'
                            : 'No profiles match your filters.'}
                    </PText>
                </div>
            ) : (
                <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', backgroundColor: '#f9f9f9' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>First Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Last Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Position</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Practice</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Cluster</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Brief Summary</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProfiles.map(profile => (
                                <tr key={profile.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>{profile.first_name || '-'}</td>
                                    <td style={{ padding: '1rem' }}>{profile.last_name || '-'}</td>
                                    <td style={{ padding: '1rem' }}>{profile.position || '-'}</td>
                                    <td style={{ padding: '1rem' }}>{profile.practice || '-'}</td>
                                    <td style={{ padding: '1rem' }}>{profile.cluster || '-'}</td>
                                    <td style={{ padding: '1rem', maxWidth: '300px' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={profile.summary}>
                                            {profile.summary}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {profile.markdown_status && (
                                            <PTag color={
                                                profile.markdown_status === 'completed' ? 'notification-success-soft' :
                                                    profile.markdown_status === 'failed' ? 'notification-error-soft' :
                                                        'notification-warning-soft'
                                            }>{profile.markdown_status}</PTag>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <PButton
                                                variant="secondary"
                                                icon="edit"
                                                onClick={() => setEditingProfile(profile)}
                                                title="Edit Profile"
                                            >
                                                Edit
                                            </PButton>
                                            <PButton
                                                variant="secondary"
                                                icon="delete"
                                                onClick={() => handleDelete(profile.id, profile.type)}
                                                title="Delete Profile"
                                            >
                                                Del
                                            </PButton>
                                            {profile.document && (
                                                <PButton
                                                    variant="secondary"
                                                    icon="download"
                                                    onClick={() => referenceProfileApi.downloadProfileFile(profile.id, profile.type, profile.document!.file_name)}
                                                    title="Download Original"
                                                >
                                                    DL
                                                </PButton>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Upload Panel Modal */}
            {showUploadPanel && (
                <PModal open={showUploadPanel} onDismiss={() => setShowUploadPanel(false)}>
                    <UploadPanel onUploadComplete={handleUploadComplete} type="profile" />
                </PModal>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <PModal open={showCreateModal} onDismiss={() => setShowCreateModal(false)}>
                    <div style={{ padding: '2rem' }}>
                        <ProfileForm
                            onSubmit={handleCreate}
                            onCancel={() => setShowCreateModal(false)}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </PModal>
            )}

            {/* Edit Modal */}
            {editingProfile && (
                <PModal open={!!editingProfile} onDismiss={() => setEditingProfile(null)}>
                    <div style={{ padding: '2rem' }}>
                        <ProfileForm
                            initialData={{
                                name: editingProfile.name,
                                type: editingProfile.type,
                                summary: editingProfile.summary,
                                capability_tags: editingProfile.capability_tags,
                                certifications: editingProfile.certifications
                            }}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingProfile(null)}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </PModal>
            )}
        </div>
    )
}
