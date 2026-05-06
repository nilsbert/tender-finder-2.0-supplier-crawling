import React, { useEffect, useState } from 'react';
import {PButton,
    PTable,
    PTableHead,
    PTableBody,
    PTableRow,
    PTableHeadCell,
    PTableCell,
    PText,
    PInlineNotification,
    PModal} from '@porsche-design-system/components-react';
import { distributingApi, DistributionOffice } from '../api/distributingApi';

interface Props {
    onEdit: (office: DistributionOffice) => void;
    refreshTrigger: number;
}

export const DistributionOfficeList: React.FC<Props> = ({ onEdit, refreshTrigger }) => {
    const [offices, setOffices] = useState<DistributionOffice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOffices = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await distributingApi.getOffices();
            setOffices(data);
        } catch (e) {
            setError("Failed to load offices");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffices();
    }, [refreshTrigger]);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);

    const confirmDelete = (id: string) => {
        setSelectedOfficeId(id);
        setDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!selectedOfficeId) return;
        try {
            await distributingApi.deleteOffice(selectedOfficeId);
            fetchOffices();
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Failed to delete office");
        } finally {
            setDeleteModalOpen(false);
            setSelectedOfficeId(null);
        }
    };

    if (loading && offices.length === 0) return <PText>Loading...</PText>;

    return (
        <div className="space-y-4 mt-6">
            <style>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #d5001c;
                    transition: .3s;
                    border-radius: 24px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .3s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: #1b7e28;
                }
                input:checked + .slider:before {
                    transform: translateX(24px);
                }
            `}</style>

            {error && <PInlineNotification state="error" heading="Error" description={error} />}

            <PTable caption="Offices (Locations)">
                <PTableHead>
                    <PTableRow>
                        <PTableHeadCell>Name</PTableHeadCell>
                        <PTableHeadCell>Active</PTableHeadCell>
                        <PTableHeadCell>Location</PTableHeadCell>
                        <PTableHeadCell>Description</PTableHeadCell>
                        <PTableHeadCell>Actions</PTableHeadCell>
                    </PTableRow>
                </PTableHead>
                <PTableBody>
                    {offices.map((o) => (
                        <PTableRow key={o.id}>
                            <PTableCell>
                                <PText weight="semi-bold">{o.name}</PText>
                            </PTableCell>
                            <PTableCell>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={o.active}
                                        onChange={async () => {
                                            try {
                                                await distributingApi.updateOffice(o.id, { active: !o.active });
                                                fetchOffices();
                                            } catch (e) {
                                                console.error("Failed to toggle office status", e);
                                            }
                                        }}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </PTableCell>
                            <PTableCell>
                                <PText size="small">
                                    {[o.city, o.state, o.country].filter(Boolean).join(', ') || '-'}
                                </PText>
                            </PTableCell>
                            <PTableCell>
                                <PText size="small" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.description}>
                                    {o.description || '-'}
                                </PText>
                            </PTableCell>
                            <PTableCell>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <PButton variant="ghost" compact={true} icon="edit" onClick={() => onEdit(o)}>Edit</PButton>
                                    <PButton variant="ghost" compact={true} icon="delete" onClick={() => confirmDelete(o.id)}>Delete</PButton>
                                </div>
                            </PTableCell>
                        </PTableRow>
                    ))}
                </PTableBody>
            </PTable>

            <PModal
                open={deleteModalOpen}
                onDismiss={() => setDeleteModalOpen(false)}
                aria={{ 'aria-label': 'Delete Office Modal' }}
            >
                <PHeading size="large" slot="header">Delete Office</PHeading>
                <div style={{ padding: '0 0 24px 0' }}>
                    <PText>Are you sure you want to delete this office?</PText>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'flex-end' }}>
                        <PButton variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</PButton>
                        <PButton variant="primary" onClick={executeDelete}>Delete</PButton>
                    </div>
                </div>
            </PModal>
        </div>
    );
};
