import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface WarrantyData {
  customerName: string;
  address: string;
  city: string;
  postalCode: string;
  installationDate: string;
}

/**
 * Generate a warranty certificate PDF
 */
export async function generateWarrantyPDF(data: WarrantyData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Colors
  const darkGray = rgb(0.2, 0.2, 0.2);
  const green = rgb(0.22, 0.55, 0.24); // Euro Metal green
  const lightGray = rgb(0.5, 0.5, 0.5);

  // Format dates
  const installDate = formatDate(data.installationDate);
  const issueDate = formatDate(new Date().toISOString());
  const fullAddress = `${data.address}, ${data.city}, ${data.postalCode}`;

  // ========== PAGE 1: Certificate ==========
  const page1 = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page1.getSize();
  
  let y = height - 60;

  // Header - Company name
  page1.drawText('EURO METAL ROOFING', {
    x: 50,
    y,
    size: 24,
    font: helveticaBold,
    color: green,
  });
  
  y -= 30;
  page1.drawText('WARRANTY CERTIFICATE', {
    x: 50,
    y,
    size: 16,
    font: helveticaBold,
    color: darkGray,
  });

  // Decorative line
  y -= 20;
  page1.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 2,
    color: green,
  });

  // Certificate content
  y -= 50;
  
  // PURCHASER
  page1.drawText('PURCHASER', {
    x: 50,
    y,
    size: 10,
    font: helveticaBold,
    color: lightGray,
  });
  y -= 18;
  page1.drawText(data.customerName, {
    x: 50,
    y,
    size: 14,
    font: helveticaBold,
    color: darkGray,
  });

  y -= 40;
  
  // INSTALLATION ADDRESS
  page1.drawText('INSTALLATION ADDRESS', {
    x: 50,
    y,
    size: 10,
    font: helveticaBold,
    color: lightGray,
  });
  y -= 18;
  page1.drawText(fullAddress, {
    x: 50,
    y,
    size: 14,
    font: helveticaBold,
    color: darkGray,
  });

  y -= 40;
  
  // DATE OF INSTALLATION
  page1.drawText('DATE OF INSTALLATION', {
    x: 50,
    y,
    size: 10,
    font: helveticaBold,
    color: lightGray,
  });
  y -= 18;
  page1.drawText(installDate, {
    x: 50,
    y,
    size: 14,
    font: helveticaBold,
    color: darkGray,
  });

  y -= 40;
  
  // COMPLETED BY
  page1.drawText('COMPLETED BY', {
    x: 50,
    y,
    size: 10,
    font: helveticaBold,
    color: lightGray,
  });
  y -= 18;
  page1.drawText('Euro Metal Roofing', {
    x: 50,
    y,
    size: 14,
    font: helveticaBold,
    color: darkGray,
  });

  // Verification statement
  y -= 60;
  page1.drawRectangle({
    x: 50,
    y: y - 40,
    width: width - 100,
    height: 50,
    color: rgb(0.95, 0.97, 0.95),
    borderColor: green,
    borderWidth: 1,
  });
  
  const verificationText = 'This certificate verifies that the above property has been issued a 50-Year Limited Warranty by Euro Metal Roofing.';
  page1.drawText(verificationText, {
    x: 60,
    y: y - 22,
    size: 11,
    font: helvetica,
    color: darkGray,
    maxWidth: width - 120,
  });

  y -= 100;

  // AUTHORIZED SIGNATURE
  page1.drawText('AUTHORIZED SIGNATURE', {
    x: 50,
    y,
    size: 10,
    font: helveticaBold,
    color: lightGray,
  });
  y -= 30;
  page1.drawLine({
    start: { x: 50, y },
    end: { x: 250, y },
    thickness: 1,
    color: darkGray,
  });

  // DATE ISSUED (right side)
  page1.drawText('DATE ISSUED', {
    x: 350,
    y: y + 30,
    size: 10,
    font: helveticaBold,
    color: lightGray,
  });
  page1.drawText(issueDate, {
    x: 350,
    y: y + 12,
    size: 14,
    font: helveticaBold,
    color: darkGray,
  });

  // Footer
  page1.drawLine({
    start: { x: 50, y: 60 },
    end: { x: width - 50, y: 60 },
    thickness: 1,
    color: green,
  });
  
  page1.drawText('Euro Metal Roofing • Warranty Certificate', {
    x: 50,
    y: 40,
    size: 10,
    font: helvetica,
    color: lightGray,
  });

  // ========== PAGE 2: Terms & Conditions ==========
  const page2 = pdfDoc.addPage([612, 792]);
  
  y = height - 60;

  // Header
  page2.drawText('WARRANTY TERMS & CONDITIONS', {
    x: 50,
    y,
    size: 16,
    font: helveticaBold,
    color: green,
  });

  y -= 15;
  page2.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: green,
  });

  y -= 30;

  // Warranty text
  const warrantyText = `Euro Metal Roofing provides 50 years Limited Warranty for steel substrate from the date of completion hereby warrants against rust perforation and leakage, manufacturing defects and wind damage in wind forces up to 140 km/hour. The coating will not peel, crack, chalk or flake to the extent that all the conditions listed below are/were met and adhered to

Euro Metal Roofing warrants: (i) the services will be performed in a good and workmanlike manner, and defects in workmanship solely attributable to the services will be repaired by Euro Metal Roofing at no additional charge within 10 years of Euro Metal Roofing providing the services, and (ii) the product will remain free from manufacturing defects and will not perforate by rust corrosion for 50 years from the date of installation. "Perforate by rust" means a large hole that completely or significantly penetrates through the product, caused by corrosion from the inside or underside of the sheets, which results in a leak. The warranty is void on any roof areas that are less than 2-1/2 /12 pitches. Any unauthorized use of this product other than what is intended automatically voids this warranty. The warranty doesn't include any damages caused by snow and ice falling off the roof whether it is on the buyer's property or on neighboring and adjoining property. Euro metal roofing will not be held liable for damage caused by moisture due to heat loss from poorly insulated attic space causing ice dams, ice cones building up/falling or general condensation. Euro Metal Roofing will not be held responsible for any growth and or spread of fungi or mold due to damage caused by moisture due to heat loss from poorly insulated attic causing ice dams, ice cones, and build up/falling or general condensation. The warranty doesn't apply to the deterioration of the surface coating, including fading standing or discoloration caused by (Abnormal Atmospheric Conditions). Abnormal Atmospheric Conditions may include but are not limited to, ultraviolet rays, pollution, hail, exposure to salt, high-pressure water spray, corrosive or harmful chemicals, (whether soil, liquids or gasses), animal excrement or airborne contaminants. The warranty doesn't cover damages arising from, or owning to; the following: areas subject to water run-off from lead or copper flashing or areas with metallic contact with copper or lead, areas sheltered from periodic rainfall washings such as underside of soffit, circumstances where corrosive fumes and condensates are generated and released in dwelling /building. Failure to provide free drainage of water, including internal condensation, failure to remove debris from roofing areas, overlaps, sheets, panels and all other areas. Damage due to acts of God including but not exclusive to lightning strikes, tornados, hurricanes, extreme hail, earthquakes, falling objects, etc. The conditions which can develop between coating and the metal which can/will/did cause the coating to degrade. Miscellaneous damage including but not exclusive to work being performed by other contractors, homeowners, abuse, vandalism, fire, war and structural settling or movement of the building/dwelling. Claims must be applied for defective products without delay after they are discovered, or after such a period they have been discovered. Claims must be received in writing, together with a copy of the original invoice (proof of payment) and copy of warranty certificate`;

  // Draw text with word wrapping
  const lines = wrapText(warrantyText, helvetica, 9, width - 100);
  const lineHeight = 12;
  
  for (const line of lines) {
    if (y < 60) {
      // Would need another page, but for now we'll make it fit
      break;
    }
    page2.drawText(line, {
      x: 50,
      y,
      size: 9,
      font: helvetica,
      color: darkGray,
    });
    y -= lineHeight;
  }

  // Footer
  page2.drawLine({
    start: { x: 50, y: 60 },
    end: { x: width - 50, y: 60 },
    thickness: 1,
    color: green,
  });
  
  page2.drawText('Euro Metal Roofing • Warranty Certificate • Page 2', {
    x: 50,
    y: 40,
    size: 10,
    font: helvetica,
    color: lightGray,
  });

  // Serialize to buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Format date string to readable format
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Wrap text to fit within a given width
 */
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    // Approximate width calculation (rough estimate)
    const testWidth = testLine.length * fontSize * 0.5;
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
