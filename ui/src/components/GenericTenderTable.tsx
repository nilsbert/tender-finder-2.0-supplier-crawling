import React, { useMemo, useRef, useEffect } from 'react';
import {PButton,
    PTag,
    PIcon,
    PText,
    PSpinner,
    PPopover} from '@porsche-design-system/components-react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
} from '@tanstack/react-table';
import type { Tender } from './GenericTenderTable.types';

const columnHelper = createColumnHelper<Tender>();

export type TenderColumn = 'published' | 'website' | 'headline' | 'rating_total' | 'due' | 'nearest_office' | 'actions' | 'enriched_date' | 'est_volume' | 'pdfs';

const defaultCrawlerColors: Record<string, string> = {
    'TED Europe': '#003399',
    'Austria USP': '#ED2939',
    'Bund.de': '#000000',
    'SIMAP': '#FF0000',
    'Tender24': '#FF9900',
    'e-Vergabe': '#00AA00',
    'Öffentliche Vergabe': '#0066CC',
};

interface GenericTenderTableProps {
    data: Tender[];
    loading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onRowClick?: (tender: Tender) => void;
    sorting?: SortingState;
    onSortingChange?: (updater: any) => void;
    visibleColumns?: TenderColumn[];
    crawlerColors?: Record<string, string>;
}

export const GenericTenderTable: React.FC<GenericTenderTableProps> = ({
    data,
    loading,
    hasMore,
    onLoadMore,
    onRowClick,
    sorting = [],
    onSortingChange,
    visibleColumns = ['published', 'website', 'headline', 'due', 'actions'],
    crawlerColors = defaultCrawlerColors,
}) => {
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && onLoadMore) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, onLoadMore]);

    const columns = useMemo(() => {
        const allColumns = [
            columnHelper.accessor('published', {
                id: 'published',
                header: 'Published',
                cell: info => info.getValue() ? new Date(info.getValue()!).toLocaleDateString('de-DE') : 'N/A',
                enableSorting: true,
            }),
            columnHelper.accessor('ai_enriched_at', {
                id: 'enriched_date',
                header: 'Enriched',
                cell: info => info.getValue() ? new Date(info.getValue()!).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : '-',
                enableSorting: true,
            }),
            columnHelper.accessor('name_website', {
                id: 'website',
                header: 'Source',
                cell: info => (
                    <PTag
                        color="background-surface"
                        style={{
                            border: `1px solid ${crawlerColors[info.getValue()] || '#ccc'}`,
                            fontSize: '10px'
                        }}
                    >
                        {info.getValue()}
                    </PTag>
                ),
                enableSorting: true,
            }),
            columnHelper.accessor('headline', {
                id: 'headline',
                header: 'Tender Detail',
                cell: info => {
                    const row = info.row.original;
                    // Support multiple locations for summary data
                    let aiShortSummary = row.enrichment?.ai_short_summary || row.enrichment_summary;
                    const aiFullSummary = row.enrichment?.ai_summary;

                    // Fallback: Try to parse from OnePager markdown if available
                    if (!aiShortSummary && row.enrichment?.ai_bid_onepager) {
                        const match = row.enrichment.ai_bid_onepager.match(/\*\*Kurzzusammenfassung\*\*:\s*(.*?)(?=\n\n|\n\*\*|$)/s);
                        if (match && match[1]) {
                            aiShortSummary = match[1].trim();
                            if (aiShortSummary.length > 300) aiShortSummary = aiShortSummary.substring(0, 300) + '...';
                        }
                    }

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* Headline & Popover */}
                            {aiFullSummary ? (
                                <PPopover direction="right" aria={{ 'aria-label': 'View Full AI Summary' }}>
                                    <div slot="anchor" style={{ cursor: 'help' }}>
                                        <div style={{ fontWeight: '700', fontSize: '16px', color: '#111', lineHeight: '1.4' }}>{row.headline}</div>
                                    </div>
                                    <div style={{ width: '400px', padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Full AI Summary</div>
                                        <div style={{ fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                            {aiFullSummary}
                                        </div>
                                    </div>
                                </PPopover>
                            ) : (
                                <div style={{ fontWeight: '700', fontSize: '16px', color: '#111', lineHeight: '1.4' }}>{row.headline}</div>
                            )}

                            {/* Caller */}
                            <div style={{
                                color: '#555',
                                fontSize: '13px',
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <PIcon name="work" size="inherit" color="state-disabled" />
                                {row.caller || 'Unknown Caller'}
                            </div>

                            {/* AI Short Summary */}
                            {aiShortSummary && (
                                <div style={{
                                    color: '#333',
                                    fontSize: '13px',
                                    marginTop: '4px',
                                    lineHeight: '1.5',
                                    paddingLeft: '10px',
                                    borderLeft: '3px solid var(--tf-accent)',
                                    backgroundColor: '#f9f9f9',
                                    padding: '8px 12px',
                                    borderRadius: '0 4px 4px 0'
                                }}>
                                    {aiShortSummary}
                                </div>
                            )}

                            {/* Tags logic */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                {row.matched_keywords && row.matched_keywords.length > 0 && (
                                    <>
                                        {row.matched_keywords.slice(0, 3).map((k, idx) => (
                                            <PTag key={idx} color="background-surface" style={{ fontSize: '11px', padding: '2px 6px' }}>
                                                {typeof k === 'string' ? k : k.term}
                                            </PTag>
                                        ))}
                                        {row.matched_keywords.length > 3 && (
                                            <PText size="x-small" color="contrast-low">+{row.matched_keywords.length - 3}</PText>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                },
                enableSorting: true,
            }),
            columnHelper.accessor('rating_total', {
                id: 'rating_total',
                header: 'Scoring',
                cell: info => {
                    const val = info.getValue() || 0;
                    const color = val > 50 ? '#1b7e28' : val < 0 ? 'var(--tf-danger)' : '#333';
                    return (
                        <div style={{ fontWeight: '900', fontSize: '18px', color, fontFamily: 'Porsche Next' }}>
                            {val.toFixed(0)}
                        </div>
                    );
                },
                enableSorting: true,
            }),
            columnHelper.accessor('due', {
                id: 'due',
                header: 'Due Date',
                cell: info => info.getValue() ? (
                    <div style={{ color: new Date(info.getValue()!) < new Date() ? 'var(--tf-danger)' : 'inherit' }}>
                        {new Date(info.getValue()!).toLocaleDateString('de-DE')}
                    </div>
                ) : 'N/A',
                enableSorting: true,
            }),
            columnHelper.accessor('enrichment.nearest_office' as any, {
                id: 'nearest_office',
                header: 'Nearest Office',
                cell: info => {
                    const office = info.getValue() as string;
                    return office ? (
                        <PTag color="notification-info-soft" style={{ fontSize: '11px' }}>
                            {office}
                        </PTag>
                    ) : (
                        <PText color="contrast-low" size="small">N/A</PText>
                    );
                },
                enableSorting: false,
            }),
            columnHelper.accessor('est_volume', {
                id: 'est_volume',
                header: 'Est. Revenue',
                cell: info => {
                    const row = info.row.original;
                    const val = row.est_volume || row.est_volume_ai;
                    return val ? (
                        <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#333' }}>
                            {val}
                        </div>
                    ) : <span style={{ color: '#ccc' }}>-</span>;
                },
                enableSorting: true,
            }),
            columnHelper.accessor('id', {
                id: 'pdfs',
                header: 'PDFs',
                cell: info => {
                    const row = info.row.original;
                    const links = [];
                    // Check main URL
                    if (row.url && row.url.toLowerCase().endsWith('.pdf')) {
                        links.push({ url: row.url, label: 'Main PDF' });
                    }
                    // Check additional links
                    if (row.additional_links) {
                        row.additional_links.forEach((l, idx) => {
                            if (typeof l === 'string' && l.toLowerCase().endsWith('.pdf')) {
                                links.push({ url: l, label: `Doc ${idx + 1}` });
                            }
                        });
                    }

                    if (links.length === 0) return <span style={{ color: '#ccc' }}>-</span>;

                    return (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {links.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    title={link.label}
                                    style={{ color: 'var(--tf-accent)', display: 'flex', alignItems: 'center' }}
                                >
                                    <PIcon name="document" size="inherit" color="primary" />
                                </a>
                            ))}
                        </div>
                    );
                },
                enableSorting: false,
            }),
            columnHelper.accessor('id', {
                id: 'actions',
                header: 'Actions',
                cell: info => (
                    <div style={{ textAlign: 'right' }}>
                        <PButton
                            variant="tertiary"
                            icon="arrow-right"
                            hideLabel
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(info.row.original.url, '_blank');
                            }}
                        >
                            Open
                        </PButton>
                    </div>
                ),
                enableSorting: false,
            }),
        ];

        // Filter based on visibleColumns prop
        return allColumns.filter(col => visibleColumns.includes(col.id as TenderColumn));
    }, [visibleColumns, crawlerColors]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        state: {
            sorting,
        },
        onSortingChange,
    });

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#fcfcfc', borderBottom: '2px solid #eee' }}>
                    {table.getHeaderGroups().map(hg => (
                        <tr key={hg.id}>
                            {hg.headers.map(header => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={{
                                        padding: '16px',
                                        textAlign: (header.id === 'actions' || header.id === 'due' || header.id === 'rating_total') ? 'right' : 'left',
                                        fontWeight: '600',
                                        color: '#333',
                                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                        userSelect: 'none'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: (header.id === 'actions' || header.id === 'due' || header.id === 'rating_total') ? 'flex-end' : 'flex-start',
                                        gap: '8px'
                                    }}>
                                        {header.column.getIsSorted() === 'asc' && <PIcon name="sort" size="x-small" style={{ transform: 'rotate(180deg)' }} />}
                                        {header.column.getIsSorted() === 'desc' && <PIcon name="sort" size="x-small" />}
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {data.map(tender => (
                        <tr
                            key={tender.id}
                            onClick={() => onRowClick?.(tender)}
                            style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f9f9f9'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {table.getRowModel().rows.find(r => r.original.id === tender.id)?.getVisibleCells().map(cell => (
                                <td key={cell.id} style={{ padding: '16px', verticalAlign: 'top' }}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div ref={observerTarget} style={{ padding: '24px', textAlign: 'center' }}>
                {loading && <PSpinner />}
                {!hasMore && data.length > 0 && <PText color="contrast-low" size="x-small">All results loaded</PText>}
            </div>
        </div>
    );
};
