import { useState, useEffect, useRef } from 'react';
import {PFlex,
    PHeading,
    PText,
    PButton,
    PSpinner,
    PIcon,
    PInlineNotification} from '@porsche-design-system/components-react';
import ReactMarkdown from 'react-markdown';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { api as crawlerApi } from '../sourcing/api';
import { bidDecisionApi } from './api';
import type { Tender } from '../../components/GenericTenderTable.types';
import { GenericTenderFilter, type WebsiteOption } from '../../components/GenericTenderFilter';
import { RatingFilter } from './RatingFilter';
import { api as ratingApi } from '../rating/api';

const FILTER_WEBSITES: WebsiteOption[] = [
    { label: 'All Sources', value: '' },
    { label: 'Bund.de', value: 'Bund.de' },
    { label: 'TED Austria', value: 'TED Austria' },
    { label: 'TED Germany', value: 'TED Germany' },
    { label: 'TED Switzerland', value: 'TED Switzerland' },
    { label: 'Deutsche Bahn', value: 'Deutsche Bahn' },
    { label: 'Vergabe24', value: 'Vergabe24' },
];

export const BidReviewView = () => {
    // State
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // Filter State
    const [searchText, setSearchText] = useState('');
    const [selectedWebsite, setSelectedWebsite] = useState('');
    const [filterBy, setFilterBy] = useState<'crawl' | 'published' | 'enriched'>('crawl');
    const [dateMode, setDateMode] = useState<'single' | 'range'>('range');
    const getLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = getLocalDateString(new Date());
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [selectedDate, setSelectedDate] = useState(today);
    const [rangeStart, setRangeStart] = useState(getLocalDateString(sevenDaysAgo));
    const [rangeEnd, setRangeEnd] = useState(today);

    // Rating Filter State
    const [ratingMin, setRatingMin] = useState<number | null>(null);
    const [typeFilter, setTypeFilter] = useState('');
    const [subTypeFilter, setSubTypeFilter] = useState('');
    const [keywordTree, setKeywordTree] = useState<Record<string, string[]>>({});

    // Fetch Logic
    const fetchTenders = async () => {
        setLoading(true);
        try {
            let since = undefined;
            let until = undefined;

            if (dateMode === 'single' && selectedDate) {
                since = `${selectedDate}T00:00:00`;
                until = `${selectedDate}T23:59:59`;
            } else {
                if (rangeStart) since = `${rangeStart}T00:00:00`;
                if (rangeEnd) until = `${rangeEnd}T23:59:59`;
            }

            const searchParams: Record<string, unknown> = {
                limit: 100,
                sort_by: 'rating_total',
                sort_dir: 'desc',
                has_enrichment: true,
                search: searchText || undefined,
                website: selectedWebsite || undefined,
                rating_min: ratingMin || undefined,
                rating_type: typeFilter || undefined,
                rating_subtype: subTypeFilter || undefined
            };

            if (filterBy === 'published') {
                searchParams.published_min = since;
                searchParams.published_max = until;
            } else if (filterBy === 'enriched') {
                if (dateMode === 'single' && selectedDate) {
                    searchParams.enriched_date = selectedDate;
                }
            } else {
                searchParams.crawled_since = since;
                searchParams.crawled_until = until;
            }

            // Fetch: Strict Enrichment + Sort by Rating High -> Low
            const data = await crawlerApi.searchTenders(searchParams);

            // Filter: Fully Enriched (Strict Check)
            const validTenders = [];
            for (const tender of data) {
                // Strict Enrichment Check
                if (!tender.enrichment) continue;

                const { ai_bid_onepager, ai_summary, ai_short_summary } = tender.enrichment;

                if (!ai_bid_onepager || !ai_summary || !ai_short_summary) {
                    continue;
                }

                validTenders.push(tender);
            }
            setTenders(validTenders);
            setCurrentIndex(0); // Reset index on filter change
        } catch (err) {
            console.error("Failed to load review queue", err);
            setError("Could not load tenders. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    // Initial Fetch & Filter Updates
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTenders();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText, selectedWebsite, ratingMin, typeFilter, subTypeFilter, filterBy, dateMode, selectedDate, rangeStart, rangeEnd]);

    // Initial load: Keyword Tree
    useEffect(() => {
        const loadTree = async () => {
            try {
                const tree = await ratingApi.getKeywordTree();
                setKeywordTree(tree);
            } catch (e) {
                console.error("Failed to load keyword tree", e);
            }
        };
        loadTree();
    }, []);

    // Navigation handlers
    const handleNext = () => {
        if (currentIndex < tenders.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrevious();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, tenders]);

    // Decision Handler
    const handleDecision = async (decision: 'BID' | 'NO_BID' | 'WATCH') => {
        if (!tenders[currentIndex]) return;
        setProcessing(true);
        try {
            await bidDecisionApi.createDecision({
                tender_id: tenders[currentIndex].id,
                decision: decision === 'BID' ? 'bid' : decision === 'NO_BID' ? 'no_bid' : 'defer',
                notes: "Quick review from Stream View",
                reason_codes: ["strategic_fit"]
            });

            // Auto-advance logic
            // Ideally we just splice the array. The next item slides into place.
            const newTenders = [...tenders];
            newTenders.splice(currentIndex, 1);
            setTenders(newTenders);

            // If we were at last item, move back
            if (currentIndex >= newTenders.length) {
                setCurrentIndex(Math.max(0, newTenders.length - 1));
            }

        } catch (err) {
            console.error("Decision failed", err);
        } finally {
            setProcessing(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!printRef.current || !tenders[currentIndex]) return;
        setPdfGenerating(true);
        try {
            const element = printRef.current;
            const canvas = await html2canvas(element, {
                scale: 2, // Improve quality
                useCORS: true,
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Handle multi-page if content is too long for one A4 page
            // For now, simpler implementation: if it's too long, it fits on one page scaled, 
            // or we could split. But the current design is fixed A4-ish size.
            // If the content overflows the A4-ish div, it might need splitting.
            // Given the design uses "printable-page" with hardcoded dimensions, it should fit.

            const filename = `tender-review-${tenders[currentIndex].id}.pdf`;
            pdf.save(filename);

        } catch (err) {
            console.error("PDF generation failed", err);
            setError("Failed to generate PDF. Please try again.");
        } finally {
            setPdfGenerating(false);
        }
    };

    const currentTender = tenders[currentIndex];
    const aiProfiles = currentTender?.ai_required_profiles?.length
        ? currentTender.ai_required_profiles
        : currentTender?.ai_profiles || [];
    const aiReferences = currentTender?.ai_required_references?.length
        ? currentTender.ai_required_references
        : currentTender?.ai_references || [];

    const shortenLinkText = (value: string, maxLength: number = 64) => {
        if (!value) return '';
        if (value.length <= maxLength) return value;
        const keep = Math.max(16, Math.floor((maxLength - 3) / 2));
        return `${value.slice(0, keep)}...${value.slice(-keep)}`;
    };

    const linkifyPlainUrls = (text: string) => {
        if (!text) return text;
        const urlRegex = /\bhttps?:\/\/[^\s<>()]+/g;
        return text.replace(urlRegex, (rawUrl, offset) => {
            const prevChar = text[offset - 1];
            if (prevChar === '(' || prevChar === '<') {
                return rawUrl;
            }
            const trailingMatch = rawUrl.match(/[).,;:!?]+$/);
            const trailing = trailingMatch ? trailingMatch[0] : '';
            const cleanUrl = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;
            return `<${cleanUrl}>${trailing}`;
        });
    };

    const markdownSource = linkifyPlainUrls(currentTender?.enrichment?.ai_bid_onepager || '');

    const renderRequirementList = (title: string, items: string[], emptyText: string) => (
        <div style={{ flex: 1, minWidth: '260px' }}>
            <PHeading size="small" style={{ marginBottom: '8px' }}>{title}</PHeading>
            {items.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {items.map((item, idx) => (
                        <li key={`${title}-${idx}`} style={{ marginBottom: '6px', fontSize: '12px', lineHeight: '1.5' }}>
                            {item}
                        </li>
                    ))}
                </ul>
            ) : (
                <PText size="small" color="contrast-medium">{emptyText}</PText>
            )}
        </div>
    );

    // Rendering Helpers
    const renderNoData = () => (
        <div className="p-content-wrapper">
            <PFlex direction="column" alignItems="center" style={{ gap: '32px', marginTop: '32px' }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    width: '100%',
                    maxWidth: '800px'
                }}>
                    <GenericTenderFilter
                        variant="crawling"
                        searchText={searchText}
                        onSearchChange={setSearchText}
                        selectedWebsite={selectedWebsite}
                        onWebsiteChange={setSelectedWebsite}
                        websites={FILTER_WEBSITES}
                        filterBy={filterBy}
                        onFilterByChange={setFilterBy}
                        dateMode={dateMode}
                        onDateModeChange={setDateMode}
                        selectedDate={selectedDate}
                        onSelectedDateChange={setSelectedDate}
                        rangeStart={rangeStart}
                        onRangeStartChange={setRangeStart}
                        rangeEnd={rangeEnd}
                        onRangeEndChange={setRangeEnd}
                    />
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                        <RatingFilter
                            ratingMin={ratingMin}
                            onRatingMinChange={setRatingMin}
                            typeFilter={typeFilter}
                            onTypeChange={setTypeFilter}
                            subTypeFilter={subTypeFilter}
                            onSubTypeChange={setSubTypeFilter}
                            keywordTree={keywordTree}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '20px' }}>
                    <PIcon name="check" size="large" color="notification-success" />
                    <PHeading>All caught up!</PHeading>
                    <PText align="center">No unreviewed, fully enriched tenders found matching your filters.<br />Try adjusting the filters or check back later.</PText>
                </div>
            </PFlex>
        </div>
    );

    if (loading && tenders.length === 0) {
        return (
            <PFlex justifyContent="center" alignItems="center" style={{ height: '80vh' }}>
                <PSpinner />
            </PFlex>
        );
    }

    if (tenders.length === 0) {
        return renderNoData();
    }

    if (!currentTender) return null;

    return (
        <div style={{ backgroundColor: '#e6e6e6', minHeight: '100vh', padding: '40px 0' }}>
            <div className="p-content-wrapper">
                {/* Dashboard Controls (Hidden on Print) */}
                <div className="no-print">
                    <PFlex direction="column" style={{ marginBottom: '32px', gap: '24px', maxWidth: '800px', margin: '0 auto 32px auto' }}>
                        {/* Filter Bar */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <GenericTenderFilter
                                variant="crawling"
                                searchText={searchText}
                                onSearchChange={setSearchText}
                                selectedWebsite={selectedWebsite}
                                onWebsiteChange={setSelectedWebsite}
                                websites={FILTER_WEBSITES}
                                filterBy={filterBy}
                                onFilterByChange={setFilterBy}
                                dateMode={dateMode}
                                onDateModeChange={setDateMode}
                                selectedDate={selectedDate}
                                onSelectedDateChange={setSelectedDate}
                                rangeStart={rangeStart}
                                onRangeStartChange={setRangeStart}
                                rangeEnd={rangeEnd}
                                onRangeEndChange={setRangeEnd}
                            />
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                                <RatingFilter
                                    ratingMin={ratingMin}
                                    onRatingMinChange={setRatingMin}
                                    typeFilter={typeFilter}
                                    onTypeChange={setTypeFilter}
                                    subTypeFilter={subTypeFilter}
                                    onSubTypeChange={setSubTypeFilter}
                                    keywordTree={keywordTree}
                                />
                            </div>
                        </div>

                        {/* Navigation & Tools */}
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            padding: '10px 20px',
                            borderRadius: '30px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            backdropFilter: 'blur(5px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '20px'
                        }}>
                            <PFlex alignItems="center" style={{ gap: '10px' }}>
                                <PButton
                                    variant="ghost"
                                    icon="arrow-left"
                                    hideLabel
                                    disabled={currentIndex === 0}
                                    onClick={handlePrevious}
                                >Prev</PButton>
                                <PText size="small" color="contrast-medium">
                                    {currentIndex + 1} / {tenders.length}
                                </PText>
                                <PButton
                                    variant="ghost"
                                    icon="arrow-right"
                                    hideLabel
                                    disabled={currentIndex === tenders.length - 1}
                                    onClick={handleNext}
                                >Next</PButton>
                            </PFlex>

                            <PFlex alignItems="center" style={{ gap: '10px' }}>
                                <PButton
                                    variant="secondary"
                                    icon="download"
                                    loading={pdfGenerating}
                                    onClick={handleDownloadPDF}
                                >
                                    {pdfGenerating ? 'Generating...' : 'Download PDF'}
                                </PButton>
                                {currentTender.url && (
                                    <a href={currentTender.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                        <PButton variant="tertiary">Original Source</PButton>
                                    </a>
                                )}
                            </PFlex>
                        </div>
                    </PFlex>
                </div>

                {error && <PInlineNotification state="error" heading="Error" description={error} />}

                {/* Main Document Page (A4-ish) */}
                <div
                    ref={printRef}
                    className="printable-page"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        maxWidth: '100%',
                        backgroundColor: 'white',
                        margin: '0 auto',
                        padding: '25mm',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        position: 'relative',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                    <div style={{ position: 'relative' }}>
                        {/* Progress Bar (Hidden on Print) */}
                        <div className="no-print" style={{ position: 'absolute', top: '-25mm', left: '-25mm', width: '210mm', height: '4px', backgroundColor: '#f0f0f0' }}>
                            <div style={{
                                width: `${((currentIndex + 1) / tenders.length) * 100}%`,
                                height: '100%',
                                backgroundColor: 'var(--tf-accent)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>

                        <div className="markdown-body" style={{ lineHeight: '1.6' }}>
                            <ReactMarkdown
                                components={{
                                    a: ({ href, children }) => {
                                        const text = Array.isArray(children) ? children.join('') : String(children ?? '');
                                        const label = shortenLinkText(text || href || '');
                                        return (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: 'var(--tf-accent)', textDecoration: 'none', overflowWrap: 'anywhere' }}
                                                title={text || href}
                                            >
                                                {label}
                                            </a>
                                        );
                                    }
                                }}
                            >
                                {markdownSource}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* AI Requirements (Profiles & References) */}
                    <div style={{
                        marginTop: '32px',
                        paddingTop: '16px',
                        borderTop: '1px solid #eee',
                        pageBreakInside: 'avoid'
                    }}>
                        <PHeading size="small" style={{ marginBottom: '12px' }}>AI Requirements</PHeading>
                        <PFlex alignItems="flex-start" style={{ gap: '24px', flexWrap: 'wrap' }}>
                            {renderRequirementList('Required Profiles', aiProfiles, 'No profile requirements found.')}
                            {renderRequirementList('Required References', aiReferences, 'No reference requirements found.')}
                        </PFlex>
                    </div>

                    {/* Footer with Link and QR Code */}
                    <div style={{
                        marginTop: '40px',
                        paddingTop: '20px',
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        pageBreakInside: 'avoid'
                    }}>
                        <div style={{ maxWidth: '75%' }}>
                            <PText size="x-small" color="contrast-medium" style={{ marginBottom: '4px' }}>Original Tender Source:</PText>
                            <a
                                href={currentTender.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'var(--tf-accent)',
                                    textDecoration: 'none',
                                    fontSize: '11px',
                                    wordBreak: 'break-all',
                                    fontFamily: 'monospace',
                                    display: 'block',
                                    lineHeight: '1.4'
                                }}
                            >
                                {shortenLinkText(currentTender.url || '')}
                            </a>
                            <PText size="x-small" color="contrast-low" style={{ marginTop: '12px' }}>
                                Generated by Tender Finder AI • {new Date().toLocaleDateString()}
                            </PText>
                        </div>

                        {currentTender.url && (
                            <div style={{
                                padding: '8px',
                                backgroundColor: 'white',
                                border: '1px solid #eee',
                                borderRadius: '4px'
                            }}>
                                <QRCodeSVG value={currentTender.url} size={84} level="M" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Action Dock (Hidden on Print) */}
                <div className="no-print" style={{
                    position: 'fixed',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100
                }}>
                    <div style={{
                        backgroundColor: 'rgba(30,30,30,0.9)',
                        padding: '12px 24px',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center'
                    }}>
                        <PButton variant="primary" disabled={processing} onClick={() => handleDecision('NO_BID')}>
                            No-Bid
                        </PButton>
                        <PButton variant="secondary" disabled={processing} onClick={() => handleDecision('WATCH')}>
                            Watch
                        </PButton>
                        <PButton variant="primary" disabled={processing} onClick={() => handleDecision('BID')}>
                            Bid Interest
                        </PButton>
                    </div>
                </div>
            </div>

            <style>{`
                .markdown-body { font-family: 'Porsche Next', sans-serif; color: #191919; }
                .markdown-body h1 { font-size: 28px; font-weight: 700; margin-bottom: 24px; border-bottom: 2px solid var(--tf-accent); padding-bottom: 8px; }
                .markdown-body h2 { font-size: 22px; font-weight: 600; margin-top: 32px; margin-bottom: 16px; color: #333; }
                .markdown-body h3 { font-size: 18px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; }
                .markdown-body p { margin-bottom: 16px; font-size: 16px; leading-height: 1.6; }
                .markdown-body ul { padding-left: 24px; margin-bottom: 16px; }
                .markdown-body li { margin-bottom: 8px; }
                .markdown-body strong { font-weight: 700; color: #000; }
                .markdown-body blockquote { border-left: 4px solid var(--tf-accent); padding-left: 16px; margin: 20px 0; color: #555; background: var(--tf-accent-bg); padding: 16px; }
                .markdown-body a { overflow-wrap: anywhere; word-break: break-word; }

                @media print {
                    .no-print { display: none !important; }
                    body { background-color: white !important; }
                    .printable-page { 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        width: 100% !important;
                        min-height: auto !important;
                    }
                    /* Ensure headers break pages nicely if needed */
                    h1, h2, .markdown-body h1, .markdown-body h2 { page-break-after: avoid; }
                    
                    /* Hide browser header/footer if possible (standard styles) */
                    @page { margin: 20mm; }
                }
            `}</style>
        </div>
    );
};
