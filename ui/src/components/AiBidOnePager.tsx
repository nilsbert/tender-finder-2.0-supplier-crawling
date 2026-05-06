import { type FC, useMemo, useRef, useState } from 'react';
import {PButton} from '@porsche-design-system/components-react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

type AiBidOnePagerProps = {
  markdown: string;
  tenderUrl?: string | null;
  pdfFileName?: string;
  onDownloadZip?: () => void;
  isZipping?: boolean;
};

export const AiBidOnePager: FC<AiBidOnePagerProps> = ({ markdown, tenderUrl, pdfFileName, onDownloadZip, isZipping }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
      if (prevChar === '(' || prevChar === '<') return rawUrl;
      const trailingMatch = rawUrl.match(/[).,;:!?]+$/);
      const trailing = trailingMatch ? trailingMatch[0] : '';
      const cleanUrl = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;
      return `<${cleanUrl}>${trailing}`;
    });
  };

  const markdownSource = useMemo(() => linkifyPlainUrls(markdown || ''), [markdown]);
  const safeTenderUrl = tenderUrl || undefined;

  const handleDownloadPDF = async () => {
    if (!containerRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const element = containerRef.current;
      const elementRect = element.getBoundingClientRect();
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let position = 0;
      let heightLeft = pdfHeight;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      // Overlay clickable link annotations on top of the rasterized PDF.
      // This keeps links clickable even though the content itself is an image.
      const anchors = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href]'));
      if (anchors.length > 0) {
        const mmPerCanvasPx = pdfWidth / canvas.width;
        const scaleX = canvas.width / elementRect.width;
        const scaleY = canvas.height / elementRect.height;

        const pageCount = pdf.getNumberOfPages();
        for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
          // Image for page N is drawn with y offset of -pageHeight * N
          const imageOffsetYmm = -pageHeight * pageIndex;
          pdf.setPage(pageIndex + 1);

          for (const a of anchors) {
            const href = a.getAttribute('href');
            if (!href) continue;

            const r = a.getBoundingClientRect();
            const xCanvas = (r.left - elementRect.left) * scaleX;
            const yCanvas = (r.top - elementRect.top) * scaleY;
            const wCanvas = r.width * scaleX;
            const hCanvas = r.height * scaleY;

            const xMm = xCanvas * mmPerCanvasPx;
            const yMm = yCanvas * mmPerCanvasPx + imageOffsetYmm;
            const wMm = wCanvas * mmPerCanvasPx;
            const hMm = hCanvas * mmPerCanvasPx;

            // Only add the clickable area if it overlaps this page.
            const yStart = Math.max(0, yMm);
            const yEnd = Math.min(pageHeight, yMm + hMm);
            if (yEnd <= yStart) continue;

            // Some anchors can be split across pages (rare); clip to the visible part.
            const clippedHeight = yEnd - yStart;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (pdf as any).link(xMm, yStart, wMm, clippedHeight, { url: href });
          }
        }
      }

      pdf.save(pdfFileName || 'ai-bid-onepager.pdf');
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <PButton
          variant="secondary"
          icon="download"
          loading={isDownloading}
          onClick={handleDownloadPDF}
        >
          Download PDF
        </PButton>
        {onDownloadZip && (
          <div style={{ marginLeft: '12px' }}>
            <PButton
              variant="primary"
              icon="download"
              loading={isZipping}
              onClick={onDownloadZip}
            >
              Download Documents (ZIP)
            </PButton>
          </div>
        )}
      </div>

      <div ref={containerRef} className="pdf-document-container">
        <div className="markdown-content">
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

        <div className="onepager-footer">
          <div className="onepager-footer-left">
            <div>Confidential - For Internal Use Only</div>
            {safeTenderUrl && (
              <div>
                Original tender:{' '}
                <a href={safeTenderUrl} target="_blank" rel="noopener noreferrer">
                  {shortenLinkText(safeTenderUrl, 80)}
                </a>
              </div>
            )}
          </div>

          <div className="onepager-footer-right">
            <div>Generated via AI Enrichment</div>
            {safeTenderUrl && (
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <a href={safeTenderUrl} target="_blank" rel="noopener noreferrer" title={safeTenderUrl}>
                  <QRCodeCanvas value={safeTenderUrl} size={84} includeMargin />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
