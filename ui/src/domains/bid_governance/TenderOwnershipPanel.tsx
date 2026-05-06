import { type FC, useEffect, useState } from 'react';
import {PHeading,
    PText,
    PTag,
    PButton,
    PFlex,
    PFlexItem,
    PInlineNotification} from '@porsche-design-system/components-react';
import { bidGovernanceApi } from './api';
import type { Person, TenderOwnership, TenderComment } from './types';
import { useAuth } from '../auth/AuthProvider';

interface TenderOwnershipPanelProps {
    tenderId: string;
}

const emptyPerson: Person = {
    first_name: '',
    last_name: '',
    email: '',
    department: '',
};

export const TenderOwnershipPanel: FC<TenderOwnershipPanelProps> = ({ tenderId }) => {
    const { identity } = useAuth();
    const [ownership, setOwnership] = useState<TenderOwnership | null>(null);
    const [comments, setComments] = useState<TenderComment[]>([]);

    const defaultPerson: Person = {
        first_name: identity?.firstName || '',
        last_name: identity?.lastName || '',
        email: identity?.email || '',
        department: '',
    };

    const [driverForm, setDriverForm] = useState<Person>(defaultPerson);
    const [coDriverForm, setCoDriverForm] = useState<Person>(defaultPerson);
    const [commentAuthor, setCommentAuthor] = useState<Person>(defaultPerson);
    const [commentBody, setCommentBody] = useState('');
    const [notification, setNotification] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        try {
            const [ownershipData, commentData] = await Promise.all([
                bidGovernanceApi.getOwnership(tenderId),
                bidGovernanceApi.listComments(tenderId),
            ]);
            setOwnership(ownershipData);
            setComments(commentData);
        } catch (e: any) {
            setNotification({ status: 'error', message: e.message || 'Failed to load ownership data.' });
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenderId]);

    useEffect(() => {
        // Update forms if identity changes
        if (identity) {
            const newDefault: Person = {
                first_name: identity.firstName || '',
                last_name: identity.lastName || '',
                email: identity.email || '',
                department: '',
            };
            setDriverForm(prev => ({ ...newDefault, ...prev, email: identity.email }));
        }
    }, [identity]);

    const isPersonValid = (person: Person) => person.email && person.email.trim();

    const handleClaim = async () => {
        if (!isPersonValid(driverForm)) {
            setNotification({ status: 'error', message: 'Email is required to claim a tender.' });
            return;
        }
        setLoading(true);
        try {
            const updated = await bidGovernanceApi.claimTender(tenderId, driverForm);
            setOwnership(updated);
            setNotification({ status: 'success', message: 'Tender claimed successfully.' });
        } catch (e: any) {
            setNotification({ status: 'error', message: e.message || 'Failed to claim tender.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async () => {
        setLoading(true);
        try {
            const updated = await bidGovernanceApi.releaseTender(tenderId);
            setOwnership(updated);
            setNotification({ status: 'success', message: 'Tender released.' });
        } catch (e: any) {
            setNotification({ status: 'error', message: e.message || 'Failed to release tender.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddCoDriver = async () => {
        if (!isPersonValid(coDriverForm)) {
            setNotification({ status: 'error', message: 'Email is required to add a co-driver.' });
            return;
        }
        setLoading(true);
        try {
            const updated = await bidGovernanceApi.addCoDriver(tenderId, coDriverForm);
            setOwnership(updated);
            setCoDriverForm({
                first_name: '',
                last_name: '',
                email: '',
                department: ''
            });
            setNotification({ status: 'success', message: 'Co-driver added.' });
        } catch (e: any) {
            setNotification({ status: 'error', message: e.message || 'Failed to add co-driver.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCoDriver = async (email: string) => {
        setLoading(true);
        try {
            const updated = await bidGovernanceApi.removeCoDriver(tenderId, email);
            setOwnership(updated);
        } catch (e: any) {
            setNotification({ status: 'error', message: e.message || 'Failed to remove co-driver.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!isPersonValid(commentAuthor) || !commentBody.trim()) {
            setNotification({ status: 'error', message: 'Add author details and a comment.' });
            return;
        }
        setLoading(true);
        try {
            const newComment = await bidGovernanceApi.addComment(tenderId, commentAuthor, commentBody.trim());
            setComments(prev => [...prev, newComment]);
            setCommentBody('');
            setNotification({ status: 'success', message: 'Comment added.' });
        } catch (e: any) {
            setNotification({ status: 'error', message: e.message || 'Failed to add comment.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '16px 0' }}>
            <PHeading size="small" style={{ marginBottom: '12px' }}>Tender Ownership</PHeading>

            {notification && (
                <div style={{ marginBottom: '12px' }}>
                    <PInlineNotification
                        state={notification.status}
                        heading={notification.status === 'success' ? 'Success' : 'Error'}
                        description={notification.message}
                    />
                </div>
            )}

            <div style={{ marginBottom: '16px' }}>
                <PFlex alignItems="center" style={{ gap: '8px', flexWrap: 'wrap' }}>
                    <PText weight="semi-bold">Status:</PText>
                    <PTag color={ownership?.status === 'CLAIMED' ? 'notification-success' : 'background-base'}>
                        {ownership?.status || 'UNCLAIMED'}
                    </PTag>
                </PFlex>
            </div>

            {ownership?.driver ? (
                <div style={{ marginBottom: '16px' }}>
                    <PText weight="semi-bold">Driver</PText>
                    <PText size="small">
                        {ownership.driver.first_name} {ownership.driver.last_name} • {ownership.driver.email} • {ownership.driver.department}
                    </PText>
                    <div style={{ marginTop: '8px' }}>
                        <PButton variant="secondary" onClick={handleRelease} disabled={loading}>
                            Release Tender
                        </PButton>
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: '16px' }}>
                    <PText size="small" color="contrast-low">Unclaimed. Claim to become the driver.</PText>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                        <input
                            placeholder="First name"
                            value={driverForm.first_name}
                            onChange={(e) => setDriverForm({ ...driverForm, first_name: e.target.value })}
                        />
                        <input
                            placeholder="Last name"
                            value={driverForm.last_name}
                            onChange={(e) => setDriverForm({ ...driverForm, last_name: e.target.value })}
                        />
                        <input
                            placeholder="Email"
                            value={driverForm.email}
                            onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                        />
                        <input
                            placeholder="Department"
                            value={driverForm.department}
                            onChange={(e) => setDriverForm({ ...driverForm, department: e.target.value })}
                        />
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <PButton onClick={handleClaim} disabled={loading}>Claim Tender</PButton>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '16px' }}>
                <PText weight="semi-bold">Co-Drivers</PText>
                {ownership?.co_drivers?.length ? (
                    <div style={{ marginTop: '8px' }}>
                        {ownership.co_drivers.map((person) => (
                            <PFlex key={person.email} alignItems="center" style={{ gap: '8px', marginBottom: '6px' }}>
                                <PFlexItem>
                                    <PText size="small">
                                        {person.first_name} {person.last_name} • {person.email} • {person.department}
                                    </PText>
                                </PFlexItem>
                                <PFlexItem>
                                    <PButton
                                        variant="tertiary"
                                        onClick={() => handleRemoveCoDriver(person.email)}
                                        disabled={loading}
                                    >
                                        Remove
                                    </PButton>
                                </PFlexItem>
                            </PFlex>
                        ))}
                    </div>
                ) : (
                    <PText size="small" color="contrast-low">No co-drivers assigned.</PText>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                    <input
                        placeholder="First name"
                        value={coDriverForm.first_name}
                        onChange={(e) => setCoDriverForm({ ...coDriverForm, first_name: e.target.value })}
                        disabled={ownership?.status !== 'CLAIMED'}
                    />
                    <input
                        placeholder="Last name"
                        value={coDriverForm.last_name}
                        onChange={(e) => setCoDriverForm({ ...coDriverForm, last_name: e.target.value })}
                        disabled={ownership?.status !== 'CLAIMED'}
                    />
                    <input
                        placeholder="Email"
                        value={coDriverForm.email}
                        onChange={(e) => setCoDriverForm({ ...coDriverForm, email: e.target.value })}
                        disabled={ownership?.status !== 'CLAIMED'}
                    />
                    <input
                        placeholder="Department"
                        value={coDriverForm.department}
                        onChange={(e) => setCoDriverForm({ ...coDriverForm, department: e.target.value })}
                        disabled={ownership?.status !== 'CLAIMED'}
                    />
                </div>
                <div style={{ marginTop: '12px' }}>
                    <PButton
                        variant="secondary"
                        onClick={handleAddCoDriver}
                        disabled={loading || ownership?.status !== 'CLAIMED'}
                    >
                        Add Co-Driver
                    </PButton>
                </div>
            </div>

            <div>
                <PHeading size="small" style={{ marginBottom: '8px' }}>Comments</PHeading>
                {comments.length === 0 ? (
                    <PText size="small" color="contrast-low">No comments yet.</PText>
                ) : (
                    <div style={{ marginBottom: '12px' }}>
                        {comments.map((comment) => (
                            <div key={comment.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                <PText size="small" weight="semi-bold">
                                    {comment.author.first_name} {comment.author.last_name} • {comment.author.department}
                                    <span style={{ color: '#888', marginLeft: '8px' }}>
                                        {new Date(comment.created_at).toLocaleString()}
                                    </span>
                                </PText>
                                <PText size="small">{comment.body}</PText>
                            </div>
                        ))}
                    </div>
                )}

                <PText size="small" weight="semi-bold" style={{ marginBottom: '8px' }}>Add comment</PText>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                        placeholder="First name"
                        value={commentAuthor.first_name}
                        onChange={(e) => setCommentAuthor({ ...commentAuthor, first_name: e.target.value })}
                    />
                    <input
                        placeholder="Last name"
                        value={commentAuthor.last_name}
                        onChange={(e) => setCommentAuthor({ ...commentAuthor, last_name: e.target.value })}
                    />
                    <input
                        placeholder="Email"
                        value={commentAuthor.email}
                        onChange={(e) => setCommentAuthor({ ...commentAuthor, email: e.target.value })}
                    />
                    <input
                        placeholder="Department"
                        value={commentAuthor.department}
                        onChange={(e) => setCommentAuthor({ ...commentAuthor, department: e.target.value })}
                    />
                </div>
                <textarea
                    placeholder="Write a comment..."
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    rows={3}
                    style={{ width: '100%', marginTop: '8px' }}
                />
                <div style={{ marginTop: '8px' }}>
                    <PButton variant="secondary" onClick={handleAddComment} disabled={loading}>
                        Add Comment
                    </PButton>
                </div>
            </div>
        </div>
    );
};
