import axios from 'axios'
import type {
    Reference,
    ReferenceCreate,
    ReferenceFilters,
    Profile,
    ProfileCreate,
    ProfileFilters,
    ProfileType
} from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export const referenceProfileApi = {
    // ==================== Reference APIs ====================

    createReferenceWithUpload: async (file: File): Promise<Reference> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await axios.post<Reference>(
            `${API_URL}/references/upload-new`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        return response.data
    },

    getReferences: async (filters?: ReferenceFilters): Promise<Reference[]> => {
        const params = new URLSearchParams()
        if (filters?.sector) params.append('sector', filters.sector)
        if (filters?.service) params.append('service', filters.service)
        if (filters?.capability) params.append('capability', filters.capability)
        if (filters?.team_id) params.append('team_id', filters.team_id)
        if (filters?.limit) params.append('limit', filters.limit.toString())
        if (filters?.offset) params.append('offset', filters.offset.toString())

        const response = await axios.get<Reference[]>(
            `${API_URL}/references/?${params.toString()}`
        )
        return response.data
    },

    getReference: async (id: string): Promise<Reference> => {
        const response = await axios.get<Reference>(`${API_URL}/references/${id}`)
        return response.data
    },

    createReference: async (data: ReferenceCreate): Promise<Reference> => {
        const response = await axios.post<Reference>(`${API_URL}/references/`, data)
        return response.data
    },

    updateReference: async (id: string, data: ReferenceCreate): Promise<Reference> => {
        const response = await axios.put<Reference>(`${API_URL}/references/${id}`, data)
        return response.data
    },

    deleteReference: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/references/${id}`)
    },

    uploadReferenceFile: async (id: string, file: File): Promise<Reference> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await axios.post<Reference>(
            `${API_URL}/references/${id}/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        return response.data
    },

    downloadReferenceFile: async (id: string, fileName: string): Promise<void> => {
        const response = await axios.get(
            `${API_URL}/references/${id}/download`,
            { responseType: 'blob' }
        )

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    },

    retryMarkdownExtraction: async (id: string): Promise<Reference> => {
        const response = await axios.post<Reference>(`${API_URL}/references/${id}/extract`)
        return response.data
    },

    // ==================== Profile APIs ====================
    createProfileWithUpload: async (file: File): Promise<Profile> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await axios.post<Profile>(
            `${API_URL}/references/profiles/upload-new`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        return response.data
    },

    getProfiles: async (filters?: ProfileFilters): Promise<Profile[]> => {
        const params = new URLSearchParams()
        if (filters?.profile_type) params.append('profile_type', filters.profile_type)
        if (filters?.capability) params.append('capability', filters.capability)
        if (filters?.limit) params.append('limit', filters.limit.toString())
        if (filters?.offset) params.append('offset', filters.offset.toString())

        const response = await axios.get<Profile[]>(
            `${API_URL}/references/profiles/?${params.toString()}`
        )
        return response.data
    },

    getProfile: async (id: string, profileType: ProfileType): Promise<Profile> => {
        const response = await axios.get<Profile>(
            `${API_URL}/references/profiles/${id}?profile_type=${profileType}`
        )
        return response.data
    },

    createProfile: async (data: ProfileCreate): Promise<Profile> => {
        const response = await axios.post<Profile>(`${API_URL}/references/profiles/`, data)
        return response.data
    },

    updateProfile: async (id: string, profileType: ProfileType, data: ProfileCreate): Promise<Profile> => {
        const response = await axios.put<Profile>(
            `${API_URL}/references/profiles/${id}?profile_type=${profileType}`,
            data
        )
        return response.data
    },

    deleteProfile: async (id: string, profileType: ProfileType): Promise<void> => {
        await axios.delete(`${API_URL}/references/profiles/${id}?profile_type=${profileType}`)
    },

    uploadProfileFile: async (id: string, profileType: ProfileType, file: File): Promise<Profile> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await axios.post<Profile>(
            `${API_URL}/references/profiles/${id}/upload?profile_type=${profileType}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        return response.data
    },

    downloadProfileFile: async (id: string, profileType: ProfileType, fileName: string): Promise<void> => {
        const response = await axios.get(
            `${API_URL}/references/profiles/${id}/download?profile_type=${profileType}`,
            { responseType: 'blob' }
        )

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    },

    retryProfileMarkdownExtraction: async (id: string, profileType: ProfileType): Promise<Profile> => {
        const response = await axios.post<Profile>(
            `${API_URL}/references/profiles/${id}/extract?profile_type=${profileType}`
        )
        return response.data
    }
}
