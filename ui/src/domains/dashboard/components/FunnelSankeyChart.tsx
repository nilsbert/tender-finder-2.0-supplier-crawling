import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {PHeading, PText} from '@porsche-design-system/components-react';
import { dashboardApi } from '../api';
import type { FunnelResponse } from '../api';
import { ResponsiveContainer, Sankey, Tooltip, Rectangle } from 'recharts';

// Simple custom node to show the real value on each node
const CustomNode = ({ x, y, width, height, payload, containerWidth }: any) => {
    // If this is a dummy/anchor node (no name), render nothing to keep it invisible
    if (!payload.name) {
        return null;
    }
    const isOut = x + width + 100 > containerWidth;
    const isSmall = height < 30;
    const value = payload.realValue !== undefined ? Number(payload.realValue).toFixed(0) : '0';

    // MHP blue accent
    const barColor = payload.color || 'var(--tf-accent)';
    const label = `${value} ${payload.name}`;

    return (
        <g>
            <Rectangle x={x} y={y} width={width} height={Math.max(height, 2)} fill={barColor} fillOpacity={1} />
            {/* Single label: value + name with one space */}
            <text
                x={isOut ? x - 12 : x + width + 6}
                y={isSmall ? y - 12 : y + height / 2}
                textAnchor={isOut ? 'end' : 'start'}
                dominantBaseline="middle"
                fill="#333"
                fontSize="13"
                fontWeight="600"
                style={{ pointerEvents: 'none' }}
            >
                {label}
            </text>
        </g>
    );
};

export const FunnelSankeyChart: FC = () => {
    const [data, setData] = useState<FunnelResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await dashboardApi.getFunnelStats(7);
                setData(result);
            } catch (e) {
                console.error('Failed to fetch funnel stats for Sankey', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <PText>Loading Sankey...</PText>;
    if (!data) return null;

    const { funnel } = data;

    const {
        scraped: rawScraped = 0,
        manual: rawManual = 0,
        rated: rawRated = 0,
        enriched: rawEnriched = 0,
        claimed: rawClaimed = 0,
        bidding: rawBidding = 0,
        won: rawWon = 0,
        lost: rawLost = 0,
        high_value: rawHighValue = 0,
        low_value: rawLowValue = 0,
    } = funnel;

    // Fallback if older API response
    const safeHigh = rawHighValue;
    const safeLow = rawLowValue > 0 ? rawLowValue : Math.max(0, funnel.rated - rawHighValue);

    // Back‑propagation / Adjustment
    const countWon = rawWon;
    const countLost = rawLost;
    const countOutcomes = countWon + countLost;
    const countBidding = Math.max(rawBidding, countOutcomes);
    const countClaimed = Math.max(rawClaimed, countBidding);
    // Enriched usually comes from High Value, but let's treat Enriched as next step of High
    const countEnriched = Math.max(rawEnriched, countClaimed);

    // Total Rated is sum of high/low or raw rated
    const countRated = Math.max(rawRated, safeHigh + safeLow, countEnriched);

    const totalInputRaw = rawScraped + rawManual;
    const countTotal = Math.max(totalInputRaw, countRated);
    const ratioMultiplier = totalInputRaw > 0 ? countTotal / totalInputRaw : 1;
    const countScraped = rawScraped * ratioMultiplier;
    const countManual = rawManual * ratioMultiplier;

    const unrated = Math.max(0, countTotal - countRated);
    // High Value + Low Value should sum to Rated. Adjust if mismatch.
    // We prioritize High Value count from backend, rest is Low.
    const countHigh = Math.max(safeHigh, countEnriched); // Enriched flows from High
    const countLow = Math.max(0, countRated - countHigh);

    const unenriched = Math.max(0, countHigh - countEnriched); // High Value didn't get enriched?
    const unclaimed = Math.max(0, countEnriched - countClaimed);
    const noBid = Math.max(0, countClaimed - countBidding);

    // Nodes
    const nodes = [
        { name: 'Scraped', realValue: countScraped, depth: 0 },       // 0
        { name: 'Manual', realValue: countManual, depth: 0 },         // 1
        { name: 'Total', realValue: countTotal, depth: 1 },           // 2

        // Rating Stage
        { name: 'Rated', realValue: countRated, depth: 2 },           // 3
        { name: 'Unrated', realValue: unrated, depth: 2 },            // 4 (EXIT)

        // Value Split (High / Low)
        { name: 'High Value', realValue: countHigh, depth: 3, color: '#16a34a' },     // 5 (Good)
        { name: 'Low Value', realValue: countLow, depth: 3, color: '#ca8a04' },      // 6 (Bad/Exit-ish)

        // Outcomes of High Value -> Enrichment
        { name: 'Enriched', realValue: countEnriched, depth: 4 },     // 7
        { name: 'Unenriched', realValue: unenriched, depth: 4 },      // 8 (EXIT)

        // Outcomes of Enrichment
        { name: 'Claimed', realValue: countClaimed, depth: 5 },       // 9
        { name: 'Unclaimed', realValue: unclaimed, depth: 5 },        // 10 (EXIT)

        // Bidding
        { name: 'Bidding', realValue: countBidding, depth: 6 },       // 11
        { name: 'No Bid', realValue: noBid, depth: 6 },               // 12 (EXIT)

        // Result
        { name: 'Won', realValue: countWon, depth: 7 },               // 13
        { name: 'Lost', realValue: countLost, depth: 7 },             // 14

        // Dummys
        { name: '', realValue: 0, depth: 3 }, // 15
        { name: '', realValue: 0, depth: 4 }, // 16
        { name: '', realValue: 0, depth: 5 }, // 17
        { name: '', realValue: 0, depth: 6 }, // 18
        { name: '', realValue: 0, depth: 7 }, // 19
    ];

    // Links
    const links = [
        // Inputs -> Total
        { source: 0, target: 2, value: Math.max(countScraped, 1) },
        { source: 1, target: 2, value: Math.max(countManual, 1) },

        // Total -> Rated / Unrated
        { source: 2, target: 3, value: Math.max(countRated, 1) },
        { source: 2, target: 4, value: Math.max(unrated, 1) },

        // Rated -> High / Low
        { source: 3, target: 5, value: Math.max(countHigh, 1) },
        { source: 3, target: 6, value: Math.max(countLow, 1) },

        // High Value -> Enriched / Unenriched
        // (Assuming mainly High Value gets enriched)
        { source: 5, target: 7, value: Math.max(countEnriched, 1) },
        { source: 5, target: 8, value: Math.max(unenriched, 1) },

        // Low Value is technically an endpoint for this View, but we can flow it to dummy if needed
        // For now, it just sits there.

        // Enriched -> Claimed / Unclaimed
        { source: 7, target: 9, value: Math.max(countClaimed, 1) },
        { source: 7, target: 10, value: Math.max(unclaimed, 1) },

        // Claimed -> Bidding / No Bid
        { source: 9, target: 11, value: Math.max(countBidding, 1) },
        { source: 9, target: 12, value: Math.max(noBid, 1) },

        // Bidding -> Won / Lost
        { source: 11, target: 13, value: Math.max(countWon, 1) },
        { source: 11, target: 14, value: Math.max(countLost, 1) },

        // Dummys (keep small - but large enough to render if rest is 1)
        { source: 4, target: 15, value: 1 },
        { source: 6, target: 16, value: 1 },
        { source: 8, target: 17, value: 1 },
        { source: 10, target: 18, value: 1 },
        { source: 12, target: 19, value: 1 },
    ];


    return (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '4px', border: '1px solid #e0e0e0', marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <PHeading size="medium">Performance (letzte 7 Tage)</PHeading>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Numbers of crawled tenders</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{countScraped.toFixed(0)}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Rated</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{countRated.toFixed(0)}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Enriched</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{countEnriched.toFixed(0)}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Claimed</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{countClaimed.toFixed(0)}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Bidding</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{countBidding.toFixed(0)}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Won</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{countWon.toFixed(0)}</span>
                    </div>

                </div>
            </div>
            <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <Sankey
                        data={{ nodes, links }}
                        node={<CustomNode />}
                        nodePadding={20}
                        margin={{ left: 20, right: 140, top: 40, bottom: 20 }}
                        link={{ stroke: '#fdebeb', fill: 'none', strokeOpacity: 0.6 }}
                        iterations={0}
                    >
                        <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                const value = d.realValue !== undefined ? Number(d.realValue).toFixed(0) : (d.value ?? 0);
                                return (
                                    <div style={{ background: '#fff', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{d.name}</p>
                                        <p style={{ margin: 0 }}>Count: {value}</p>
                                    </div>
                                );
                            }
                            return null;
                        }} />
                    </Sankey>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
