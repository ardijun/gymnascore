import { jsPDF } from 'jspdf';
import { CertificateTemplate } from '../types';

export const generateDefaultCertificateTemplate = (): CertificateTemplate => ({
  id: 'template-default',
  name: 'Default Elegant',
  title: 'E-CERTIFICATE OF PARTICIPATION',
  subtitle: 'Jakarta International Gymnastics Open 2026',
  bodyText: 'This is to certify that',
  footerText: 'Official Gymnastics Scoring Center',
  backgroundColor: '#f0f9ff',
  borderColor: '#0369a1',
  accentColor: '#0284c7',
  includeScore: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const generateCertificatePDF = (
  athleteName: string,
  club: string,
  competitionName: string,
  competitionDate: string,
  totalScore: number | null,
  template: CertificateTemplate
): jsPDF => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background color
  doc.setFillColor(
    parseInt(template.backgroundColor.slice(1, 3), 16),
    parseInt(template.backgroundColor.slice(3, 5), 16),
    parseInt(template.backgroundColor.slice(5, 7), 16)
  );
  doc.rect(0, 0, width, height, 'F');

  // Border
  doc.setDrawColor(
    parseInt(template.borderColor.slice(1, 3), 16),
    parseInt(template.borderColor.slice(3, 5), 16),
    parseInt(template.borderColor.slice(5, 7), 16)
  );
  doc.setLineWidth(3);
  doc.rect(8, 8, width - 16, height - 16);

  doc.setLineWidth(1.5);
  doc.rect(10, 10, width - 20, height - 20);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(
    parseInt(template.accentColor.slice(1, 3), 16),
    parseInt(template.accentColor.slice(3, 5), 16),
    parseInt(template.accentColor.slice(5, 7), 16)
  );
  doc.text(template.title, width / 2, 30, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(template.subtitle, width / 2, 40, { align: 'center' });

  // Body text
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(template.bodyText, width / 2, 65, { align: 'center' });

  // Athlete name (highlighted)
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(
    parseInt(template.accentColor.slice(1, 3), 16),
    parseInt(template.accentColor.slice(3, 5), 16),
    parseInt(template.accentColor.slice(5, 7), 16)
  );
  doc.text(athleteName, width / 2, 80, { align: 'center' });

  // Club and details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Club: ${club}`, width / 2, 92, { align: 'center' });

  // Competition info
  doc.setFontSize(10);
  doc.text(`Competition: ${competitionName}`, width / 2, 102, { align: 'center' });
  doc.text(`Date: ${competitionDate}`, width / 2, 110, { align: 'center' });

  // Score if applicable
  if (template.includeScore && totalScore !== null) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(
      parseInt(template.accentColor.slice(1, 3), 16),
      parseInt(template.accentColor.slice(3, 5), 16),
      parseInt(template.accentColor.slice(5, 7), 16)
    );
    doc.text(`Total Score: ${totalScore.toFixed(3)}`, width / 2, 122, { align: 'center' });
  }

  // Footer text
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(template.footerText, width / 2, height - 15, { align: 'center' });

  // Issued date
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(8);
  doc.text(`Issued: ${today}`, width / 2, height - 8, { align: 'center' });

  return doc;
};
