import React, { useState } from 'react';
import {PModal,
    PHeading,
    PText,
    PButton,
    PFlex,
    PTabs,
    PTabsItem,
    PTextarea} from '@porsche-design-system/components-react';

/**
 * Predefined prompt templates for common use cases
 */
const PROMPT_TEMPLATES = {
    field_enrichment: [
        {
            name: 'Standard German Tenders',
            description: 'Optimized for German public procurement with EU references',
            prompt: `Du bist ein KI-Assistent zur Vervollständigung von Ausschreibungsdaten.

Analysiere die bereitgestellten Ausschreibungsdaten und ergänze ALLE fehlenden Felder basierend auf dem vorhandenen Kontext. 
Nutze alle verfügbaren Informationen (Titel, Beschreibung, Volltext, etc.) um intelligente Ableitungen zu treffen.

Gib ein JSON-Objekt zurück mit folgenden Feldern (nur wenn du sicher bist):
- headline: optimierter/vervollständigter Titel
- description: optimierte/vervollständigte Beschreibung  
- caller: Name der ausschreibenden Stelle (z.B. "Stadt München", "Bundesministerium...")
- location: Ort der Leistungserbringung (z.B. "München", "Berlin")
- published: Veröffentlichungsdatum (ISO format YYYY-MM-DD)
- due: Abgabefrist (ISO format YYYY-MM-DD)
- category: Kategorie/Branche (z.B. "IT", "Bau", "Beratung")
- tender_type: Art der Ausschreibung (z.B. "Öffentliche Ausschreibung", "Verhandlungsverfahren")
- est_volume: Geschätztes Volumen (z.B. "500.000€", "1-3 Mio€", "Gering/Mittel/Hoch")

Fülle nur Felder, die du mit hoher Sicherheit ableiten kannst. Bei Unsicherheit lass das Feld leer.`,
        },
        {
            name: 'International Tenders',
            description: 'For multi-language tenders with global focus',
            prompt: `You are an AI assistant for completing tender data fields.

Analyze the provided tender data and fill ALL missing fields based on available context.
Use all available information (title, description, full text, etc.) to make intelligent inferences.

Return a JSON object with the following fields (only if confident):
- headline: optimized/completed title
- description: enhanced description
- caller: Name of contracting authority
- location: Service delivery location (city, region, country)
- published: Publication date (ISO format YYYY-MM-DD)
- due: Submission deadline (ISO format YYYY-MM-DD)
- category: Category/Sector (e.g., "IT", "Construction", "Consulting")
- tender_type: Type of procurement (e.g., "Open Procedure", "Negotiated Procedure")
- est_volume: Estimated volume (e.g., "€500k", "€1-3M", "Low/Medium/High")

Only fill fields you can infer with high confidence.`,
        },
    ],
    summary_generation: [
        {
            name: 'Executive Summary',
            description: 'Brief summaries for executive-level decision makers',
            prompt: `Du bist ein KI-Assistent zur Erstellung von Ausschreibungs-Zusammenfassungen für Management-Entscheidungen.

Erstelle ZWEI Zusammenfassungen im JSON-Format:

1. "short_summary": 1 prägnanter Satz für die Tabellenansicht (max. 120 Zeichen)
   → Fokus: Was wird gesucht? Wer ist der Auftraggeber?
   
2. "full_summary": Executive Summary (2-3 Absätze) mit:
   - Überblick: Was ist das Vorhaben? (1-2 Sätze)
   - Strategische Relevanz: Warum ist das wichtig? (1-2 Sätze)
   - Hauptanforderungen: Was wird erwartet? (Stichpunkte)
   - Business Case: Volumen, Laufzeit, Chancen

Gib zurück: {"short_summary": "...", "full_summary": "..."}`,
        },
        {
            name: 'Technical Detail',
            description: 'Detailed technical summaries for technical teams',
            prompt: `Du bist ein KI-Assistent zur Erstellung technischer Ausschreibungs-Analysen.

Erstelle ZWEI Zusammenfassungen im JSON-Format:

1. "short_summary": Technische Kurzbeschreibung (max. 150 Zeichen)
   → Fokus: Welche Technologien/Systeme sind gefordert?
   
2. "full_summary": Technische Detailanalyse (3-4 Absätze) mit:
   - Technischer Scope: Systeme, Architekturen, Plattformen
   - Infrastruktur-Anforderungen: Server, Cloud, Netzwerk
   - Integrationen: APIs, Schnittstellen, Datenformate  
   - Compliance & Standards: ISO, DSGVO, IT-Sicherheit
   - Gefragte Skills: Programmiersprachen, Frameworks, Zertifizierungen

Gib zurück: {"short_summary": "...", "full_summary": "..."}`,
        },
    ],
    bid_onepager: [
        {
            name: 'Standard Bid Brief',
            description: 'Comprehensive one-pager for bid decision meetings',
            prompt: `Du bist Bid Manager in einer Management- und IT-Beratung. 

Erstelle einen kompakten One-Pager im Markdown-Format für das Bid-Team. 

Struktur:
- **Titel**: Prägnanter Titel der Ausschreibung
- **Kurzzusammenfassung**: 2-3 Sätze Executive Summary
- **Zusammenfassung**: Detaillierte Beschreibung des Vorhabens (3-4 Absätze)
- **Typ**: Art der Ausschreibung  
- **Auftraggeber**: Mit Kontaktdaten und Link
- **Ort der Leistung**: Geografische Details
- **Fristen**:  
  - Angebotsfrist: [Datum]
  - Bindefrist: [Datum falls bekannt]
  - Leistungszeitraum: [Zeitraum falls bekannt]
- **Geschätztes Volumen**: Mit Begründung (Gering/Mittel/Hoch oder konkrete Summe)
- **Bewertungskriterien**: Zuschlagskriterien und Gewichtung
- **Geforderte Referenzen**: Nachweise und Eignungskriterien
- **Benötigte Rollen & Skills**: Erforderliche Kompetenzen  
- **Besondere Hinweise**: 
  - Chancen: Was spricht für uns?
  - Risiken: Was könnte problematisch sein?
  - Compliance: Besondere Anforderungen

Gib nur Markdown zurück.`,
        },
        {
            name: 'Quick Win Analysis',
            description: 'Focus on speed and win probability',
            prompt: `Du bist Bid Manager mit Fokus auf Quick Wins.

Erstelle einen schlanken One-Pager im Markdown-Format mit Entscheidungshilfe.

Struktur:
- **Titel & Auftraggeber**: [Name] - [Contracting Authority]
- **Quick Facts**:
  - Volumen: [Schätzung]
  - Deadline: [Datum]
  - Ort: [Location]
  - Typ: [Procurement Type]
  
- **Go/No-Go Faktoren**:
  - ✅ **PRO (Chancen)**:
    - Bestehende Referenzen
    - Passende Skills vorhanden
    - Geografische Nähe
    - [weitere Vorteile]
  - ⚠️ **CONTRA (Risiken)**:
    - Fehlende Qualifikationen
    - Zeitdruck
    - Starker Wettbewerb
    - [weitere Risiken]

- **Aufwand-Schätzung**: 
  - Angebotserstellung: [Personentage]
  - Benötigte Ressourcen: [Skills/Rollen]
  
- **Win Probability**: [Hoch/Mittel/Niedrig] - [Begründung]

- **Empfehlung**: [BID / NO-BID / EVALUATE] - [Kurze Erklärung]

Gib nur Markdown zurück.`,
        },
    ],
    label_matching: [
        {
            name: 'Strict Semantic Matching',
            description: 'Emphasis on description vs keyword matching (Parity with Office Matching)',
            prompt: `Du bist ein KI-Assistent zur Klassifizierung von Ausschreibungen.

Analysiere die Ausschreibung und identifiziere die passenden Labels aus der folgenden Liste.
Verlasse dich NICHT nur auf Keywords, sondern nutze die semantische Bedeutung der Beschreibungen.

### Verfügbare Labels
{labels_list}

Regeln:
- Wähle das Label, das am besten zur inhaltlichen Beschreibung der Ausschreibung passt.
- Wenn mehrere Labels passen, liste sie nach Relevanz.
- Antworte mit einem JSON-Objekt.

Gib ein JSON-Objekt zurück mit dem Schlüssel "matches", das eine Liste von Objekten enthält.
Jedes Objekt muss folgende Felder haben:
- label_id: Die UUID des Labels (exakt aus der Liste übernehmen)
- label_name: Name des Labels
- score: Score (0-100)
- reasoning: Kurze Begründung (optional)`,
        },
        {
            name: 'Industry Focus (Sector/Service)',
            description: 'Optimized for distinguishing between broad sectors and specific services',
            prompt: `Du bist ein Experte für Branchen-Klassifizierung (Taxonomie).

Ordne die Ausschreibung den passenden Sektoren und Services zu.

### Verfügbare Labels
{labels_list}

WICHTIG: Unterscheide strikt zwischen den Sektoren (Branchen) und den Services (Dienstleistungen). Nutze die bereitgestellten Beschreibungen für eine präzise Zuordnung.

Antworte im JSON-Format:
{
  "matches": [
    {"label_id": "...", "label_name": "...", "score": 100, "reasoning": "..."}
  ]
}`,
        },
    ],
};

interface PromptTemplateLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (promptType: keyof typeof PROMPT_TEMPLATES, template: string) => void;
}

export const PromptTemplateLibrary: React.FC<PromptTemplateLibraryProps> = ({
    isOpen,
    onClose,
    onSelectTemplate,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedPromptType, setSelectedPromptType] = useState<keyof typeof PROMPT_TEMPLATES>('field_enrichment');
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

    const handleTabChange = (index: number) => {
        setActiveTab(index);
        const types = Object.keys(PROMPT_TEMPLATES) as Array<keyof typeof PROMPT_TEMPLATES>;
        setSelectedPromptType(types[index]);
        setSelectedTemplateIndex(0);
    };

    const handleSelectTemplate = () => {
        const template = PROMPT_TEMPLATES[selectedPromptType][selectedTemplateIndex];
        onSelectTemplate(selectedPromptType, template.prompt);
        onClose();
    };

    return (
        <PModal
            open={isOpen}
            onDismiss={onClose}
            dismissButton={true}
            aria={{ 'aria-label': 'Prompt Template Library' }}
        >
            <div style={{ padding: '24px', maxWidth: '800px' }}>
                <PHeading size="large" style={{ marginBottom: '16px' }}>
                    Prompt Template Library
                </PHeading>
                <PText style={{ marginBottom: '24px' }}>
                    Choose from predefined templates optimized for common use cases.
                </PText>

                <PTabs activeTabIndex={activeTab} onTabChange={(e: any) => handleTabChange(e.detail.activeTabIndex)}>
                    <PTabsItem label="Field Enrichment">
                        <div style={{ padding: '16px 0' }}>
                            {PROMPT_TEMPLATES.field_enrichment.map((template, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedTemplateIndex(idx)}
                                    style={{
                                        padding: '12px',
                                        marginBottom: '12px',
                                        border: selectedTemplateIndex === idx ? '2px solid #0066cc' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        backgroundColor: selectedTemplateIndex === idx ? '#f0f7ff' : '#fff',
                                    }}
                                >
                                    <strong>{template.name}</strong>
                                    <PText size="small" style={{ marginTop: '4px' }}>
                                        {template.description}
                                    </PText>
                                </div>
                            ))}
                        </div>
                    </PTabsItem>

                    <PTabsItem label="Summary Generation">
                        <div style={{ padding: '16px 0' }}>
                            {PROMPT_TEMPLATES.summary_generation.map((template, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedTemplateIndex(idx)}
                                    style={{
                                        padding: '12px',
                                        marginBottom: '12px',
                                        border: selectedTemplateIndex === idx ? '2px solid #0066cc' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        backgroundColor: selectedTemplateIndex === idx ? '#f0f7ff' : '#fff',
                                    }}
                                >
                                    <strong>{template.name}</strong>
                                    <PText size="small" style={{ marginTop: '4px' }}>
                                        {template.description}
                                    </PText>
                                </div>
                            ))}
                        </div>
                    </PTabsItem>

                    <PTabsItem label="Bid Onepager">
                        <div style={{ padding: '16px 0' }}>
                            {PROMPT_TEMPLATES.bid_onepager.map((template, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedTemplateIndex(idx)}
                                    style={{
                                        padding: '12px',
                                        marginBottom: '12px',
                                        border: selectedTemplateIndex === idx ? '2px solid #0066cc' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        backgroundColor: selectedTemplateIndex === idx ? '#f0f7ff' : '#fff',
                                    }}
                                >
                                    <strong>{template.name}</strong>
                                    <PText size="small" style={{ marginTop: '4px' }}>
                                        {template.description}
                                    </PText>
                                </div>
                            ))}
                        </div>
                    </PTabsItem>

                    <PTabsItem label="Label Matching">
                        <div style={{ padding: '16px 0' }}>
                            {PROMPT_TEMPLATES.label_matching.map((template, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedTemplateIndex(idx)}
                                    style={{
                                        padding: '12px',
                                        marginBottom: '12px',
                                        border: selectedTemplateIndex === idx ? '2px solid #0066cc' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        backgroundColor: selectedTemplateIndex === idx ? '#f0f7ff' : '#fff',
                                    }}
                                >
                                    <strong>{template.name}</strong>
                                    <PText size="small" style={{ marginTop: '4px' }}>
                                        {template.description}
                                    </PText>
                                </div>
                            ))}
                        </div>
                    </PTabsItem>
                </PTabs>

                {/* Preview */}
                <div style={{ marginTop: '24px' }}>
                    <PHeading size="small" style={{ marginBottom: '8px' }}>
                        Preview
                    </PHeading>
                    <PTextarea
                        name="templatePreview"
                        value={PROMPT_TEMPLATES[selectedPromptType][selectedTemplateIndex].prompt}
                        readOnly
                        rows={10}
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                </div>

                {/* Actions */}
                <PFlex style={{ gap: '12px', marginTop: '24px' }} justifyContent="flex-end">
                    <PButton variant="tertiary" onClick={onClose}>
                        Cancel
                    </PButton>
                    <PButton variant="primary" onClick={handleSelectTemplate}>
                        Use This Template
                    </PButton>
                </PFlex>
            </div>
        </PModal>
    );
};
