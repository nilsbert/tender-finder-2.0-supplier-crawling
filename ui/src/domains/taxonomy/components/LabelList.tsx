import React, { useEffect, useState } from 'react';
import {PButton,
    PTable,
    PTableHead,
    PTableBody,
    PTableRow,
    PTableHeadCell,
    PTableCell,
    PText,
    PTag,
    PInlineNotification,
    PModal,
    PIcon} from '@porsche-design-system/components-react';
import { taxonomyApi, Label } from '../taxonomyApi';

interface Props {
    onEdit: (label: Label) => void;
    refreshTrigger: number;
}

export const LabelList: React.FC<Props> = ({ onEdit, refreshTrigger }) => {
    const [labels, setLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLabels = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await taxonomyApi.getLabels();
            // Sort by Type then Name
            data.sort((a, b) => {
                if (a.type !== b.type) return a.type.localeCompare(b.type);
                return a.name.localeCompare(b.name);
            });
            setLabels(data);
        } catch (e) {
            setError("Failed to load labels");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabels();
    }, [refreshTrigger]);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

    const confirmDelete = (id: string) => {
        setSelectedLabelId(id);
        setDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!selectedLabelId) return;
        try {
            await taxonomyApi.deleteLabel(selectedLabelId);
            fetchLabels();
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Failed to delete label");
        } finally {
            setDeleteModalOpen(false);
            setSelectedLabelId(null);
        }
    };

    if (loading && labels.length === 0) return <PText>Loading...</PText>;

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

            <PTable caption="Taxonomy Labels (Sectors, Services, Custom)">
                <PTableHead>
                    <PTableRow>
                        <PTableHeadCell>Name</PTableHeadCell>
                        <PTableHeadCell>Type</PTableHeadCell>
                        <PTableHeadCell>Active</PTableHeadCell>
                        <PTableHeadCell>System</PTableHeadCell>
                        <PTableHeadCell>Description</PTableHeadCell>
                        <PTableHeadCell>Actions</PTableHeadCell>
                    </PTableRow>
                </PTableHead>
                <PTableBody>
                    {labels.map((l) => (
                        <PTableRow key={l.id}>
                            <PTableCell>
                                <PText weight="semi-bold">{l.name}</PText>
                            </PTableCell>
                            <PTableCell>
                                <PTag color={l.type === 'CUSTOM' ? 'notification-info-soft' : 'primary'}>{l.type}</PTag>
                            </PTableCell>
                            <PTableCell>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={l.active}
                                        onChange={async () => {
                                            try {
                                                await taxonomyApi.updateLabel(l.id, { active: !l.active });
                                                fetchLabels();
                                            } catch (e) {
                                                console.error("Failed to toggle label status", e);
                                            }
                                        }}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </PTableCell>
                            <PTableCell>
                                {l.is_system ? <PIcon name="check" size="small" color="notification-success" /> : <PText size="small">-</PText>}
                            </PTableCell>
                            <PTableCell>
                                <PText size="small" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.description}>
                                    {l.description || '-'}
                                </PText>
                            </PTableCell>
                            <PTableCell>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <PButton variant="ghost" compact={true} icon="edit" onClick={() => onEdit(l)}>Edit</PButton>
                                    {!l.is_system && (
                                        <PButton variant="ghost" compact={true} icon="delete" onClick={() => confirmDelete(l.id)}>Delete</PButton>
                                    )}
                                </div>
                            </PTableCell>
                        </PTableRow>
                    ))}
                </PTableBody>
            </PTable>

            <PModal
                open={deleteModalOpen}
                onDismiss={() => setDeleteModalOpen(false)}
                aria={{ 'aria-label': 'Delete Label Modal' }}
            >
                <PHeading size="large" slot="header">Delete Label</PHeading>
                <div style={{ padding: '0 0 24px 0' }}>
                    <PText>Are you sure you want to delete this custom label?</PText>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'flex-end' }}>
                        <PButton variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</PButton>
                        <PButton variant="primary" onClick={executeDelete}>Delete</PButton>
                    </div>
                </div>
            </PModal>
        </div>
    );
};
