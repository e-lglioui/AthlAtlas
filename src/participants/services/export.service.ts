import { Injectable, Logger } from '@nestjs/common';
import { ExportFormat } from '../../common/enums/export-format.enum';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Participant } from '../schemas/participant.schema';

@Injectable()
export class ExportService {
  private readonly UPLOAD_PATH = 'uploads';
  private readonly logger = new Logger(ExportService.name);

  constructor() {
    // Créer le dossier uploads s'il n'existe pas
    if (!fs.existsSync(this.UPLOAD_PATH)) {
      fs.mkdirSync(this.UPLOAD_PATH);
    }
  }

  async exportParticipants(
    participants: Participant[], 
    eventId: string,
    format: ExportFormat
  ): Promise<string> {
    this.logger.debug(`Starting export for event ${eventId} in ${format} format`);
    
    try {
      let filePath: string;
      switch (format) {
        case ExportFormat.CSV:
          filePath = await this.exportToCSV(participants, eventId);
          break;
        case ExportFormat.PDF:
          filePath = await this.exportToPDF(participants, eventId);
          break;
        case ExportFormat.EXCEL:
          filePath = await this.exportToExcel(participants, eventId);
          break;
        default:
          throw new Error('Format non supporté');
      }

      this.logger.debug(`Export completed: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`Export failed: ${error.message}`);
      throw error;
    }
  }

  private async exportToCSV(participants: Participant[], eventId: string): Promise<string> {
    const filePath = path.join(this.UPLOAD_PATH, `event-${eventId}-participants.csv`);
    const headers = 'Prénom,Nom,Email,Téléphone\n';
    
    const csvContent = participants.map(p => 
      `${p.firstName},${p.lastName},${p.email},${p.phone}`
    ).join('\n');

    fs.writeFileSync(filePath, headers + csvContent);
    return filePath;
  }

  private async exportToPDF(participants: Participant[], eventId: string): Promise<string> {
    const filePath = path.join(this.UPLOAD_PATH, `event-${eventId}-participants.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.fontSize(16).text('Liste des participants', { align: 'center' });
    doc.moveDown();

    participants.forEach(p => {
      doc.fontSize(12).text(`${p.firstName} ${p.lastName}`);
      doc.fontSize(10).text(`Email: ${p.email}`);
      doc.fontSize(10).text(`Téléphone: ${p.phone}`);
      doc.moveDown();
    });

    doc.end();

    return new Promise((resolve) => {
      stream.on('finish', () => resolve(filePath));
    });
  }

  private async exportToExcel(participants: Participant[], eventId: string): Promise<string> {
    const filePath = path.join(this.UPLOAD_PATH, `event-${eventId}-participants.xlsx`);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participants');

    worksheet.columns = [
      { header: 'Prénom', key: 'firstName', width: 20 },
      { header: 'Nom', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Téléphone', key: 'phone', width: 15 }
    ];

    participants.forEach(p => {
      worksheet.addRow({
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone
      });
    });

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }
}
