// Reference & Profile Library Types

export interface FileMetadata {
    id: string
    file_name: string
    content_type: string
    size_bytes: number
    storage_path: string
    uploaded_at: string
}

export interface ReferenceBase {
    title: string
    summary: string
    sector_tags: string[]
    service_tags: string[]
    capability_tags: string[]
    team_ids: string[]
}

export interface Reference extends ReferenceBase {
    id: string
    markdown?: string
    markdown_status?: 'pending' | 'processing' | 'completed' | 'failed'
    document?: FileMetadata
    created_at: string
    updated_at: string
}

export interface ReferenceCreate extends ReferenceBase { }

export type ProfileType = 'team' | 'expert' | 'department'

export interface ProfileBase {
    name: string
    first_name?: string
    last_name?: string
    position?: string
    practice?: string
    cluster?: string
    type: ProfileType
    summary: string
    full_summary?: string
    capability_tags: string[]
    certifications: string[]
}

export interface Profile extends ProfileBase {
    id: string
    markdown?: string
    markdown_status?: 'pending' | 'processing' | 'completed' | 'failed'
    document?: FileMetadata
    created_at: string
    updated_at: string
}

export interface ProfileCreate extends ProfileBase { }

// Filter types
export interface ReferenceFilters {
    sector?: string
    service?: string
    capability?: string
    team_id?: string
    limit?: number
    offset?: number
}

export interface ProfileFilters {
    profile_type?: ProfileType
    capability?: string
    limit?: number
    offset?: number
}
