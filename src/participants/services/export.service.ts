import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createObjectCsvWriter } from 'csv-writer';
import { Participant } from '../schemas/participant.schema';
import * as path from 'path';
import * as fs from 'fs';
import { UPLOAD_PATH } from '../../common/constants/paths.constant';

@Injectable()
export class ExportService {
  constructor() {
    if (!fs.existsSync(UPLOAD_PATH)) {
      fs.mkdirSync(UPLOAD_PATH, { recursive: true });
    }
  }

  async exportParticipantsToCSV(
    participants: Participant[],
    eventId: string,
  ): Promise<string> {
    if (!participants || participants.length === 0) {
      throw new InternalServerErrorException('Aucun participant à exporter');
    }

    try {
      const fileName = `event-${eventId}-participants-${Date.now()}.csv`;
      const filePath = path.join(UPLOAD_PATH, fileName);

      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'firstName', title: 'Prénom' },
          { id: 'lastName', title: 'Nom' },
          { id: 'email', title: 'Email' },
          { id: 'phone', title: 'Téléphone' },
          { id: 'organization', title: 'Organisation' },
          { id: 'age', title: 'Âge' },
          { id: 'gender', title: 'Genre' },
          { id: 'registrationDate', title: 'Date d\'inscription' },
        ],
        encoding: 'utf8',
      });

      const records = participants.map((participant) => ({
        firstName: participant.firstName || 'N/A',
        lastName: participant.lastName || 'N/A',
        email: participant.email || 'N/A',
        phone: participant.phone || 'N/A',
        organization: participant.organization || 'N/A',
        age: participant.age?.toString() || 'N/A',
        gender: participant.gender || 'N/A',
        registrationDate: participant.createdAt 
          ? new Date(participant.createdAt).toLocaleDateString('fr-FR')
          : 'N/A',
      }));

      await csvWriter.writeRecords(records);

      if (!fs.existsSync(filePath)) {
        throw new InternalServerErrorException('Échec de la création du fichier CSV');
      }

      return filePath;
    } catch (error) {
      const tempFile = path.join(UPLOAD_PATH, `event-${eventId}-participants-*.csv`);
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignorer les erreurs de suppression
      }

      throw new InternalServerErrorException(
        `Erreur lors de la génération du fichier CSV: ${error.message}`,
      );
    }
  }

  async cleanupTempFiles(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier temporaire ${filePath}:`, error);
    }
  }
}
