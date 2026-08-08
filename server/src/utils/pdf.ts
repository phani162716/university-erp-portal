import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export async function generateHallTicketPDF(student: any, exam: any, hallTicketNo: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header Banner
      doc.rect(40, 40, 515, 60).fill('#1E3A8A');
      doc.fillColor('#FFFFFF').fontSize(18).text('UNIVERSITY ERP PORTAL', 50, 52, { align: 'center' });
      doc.fontSize(12).text('OFFICIAL EXAMINATION HALL TICKET', 50, 75, { align: 'center' });

      // Student Info Box
      doc.fillColor('#000000').fontSize(10);
      doc.rect(40, 115, 515, 110).stroke('#CBD5E1');

      doc.text(`Student Name: ${student.user.name}`, 55, 130);
      doc.text(`Register No: ${student.registerNo}`, 55, 150);
      doc.text(`Program: ${student.program?.name || 'B.Tech ECE'}`, 55, 170);
      doc.text(`Semester: ${student.semester}`, 55, 190);

      doc.text(`Hall Ticket No: ${hallTicketNo}`, 320, 130);
      doc.text(`Exam Name: ${exam.name}`, 320, 150);
      doc.text(`Date & Time: ${exam.date} (${exam.time})`, 320, 170);
      doc.text(`Venue: ${exam.venue}`, 320, 190);

      // QR Code Generation
      const verifyUrl = `http://localhost:5173/verify/${hallTicketNo}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl);
      const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

      doc.image(qrImageBuffer, 460, 130, { width: 85 });
      doc.fontSize(8).fillColor('#64748B').text('Scan to Verify', 470, 218);

      // Instructions
      doc.fontSize(11).fillColor('#1E3A8A').text('EXAMINATION RULES & INSTRUCTIONS', 40, 245);
      doc.fontSize(9).fillColor('#334155');
      doc.text('1. Candidate must bring this Hall Ticket along with University ID card to the exam hall.', 40, 265);
      doc.text('2. Mobile phones, smartwatches, and programmable calculators are strictly prohibited.', 40, 280);
      doc.text('3. Candidates will not be admitted 30 minutes after the commencement of the exam.', 40, 295);

      // Signatures
      doc.text('_______________________', 60, 360);
      doc.text('Student Signature', 75, 380);

      doc.text('_______________________', 380, 360);
      doc.text('Controller of Examinations', 380, 380);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateFeeReceiptPDF(student: any, fee: any, payment: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.rect(40, 40, 515, 60).fill('#0F172A');
      doc.fillColor('#FFFFFF').fontSize(18).text('UNIVERSITY ERP FINANCE OFFICE', 50, 52, { align: 'center' });
      doc.fontSize(12).text('FEE PAYMENT RECEIPT', 50, 75, { align: 'center' });

      doc.fillColor('#000000').fontSize(10);
      doc.rect(40, 115, 515, 140).stroke('#E2E8F0');

      doc.text(`Receipt No: REC-${payment.transactionId.substring(3, 11)}`, 55, 130);
      doc.text(`Transaction ID: ${payment.transactionId}`, 55, 150);
      doc.text(`Payment Date: ${new Date(payment.paidAt).toLocaleString()}`, 55, 170);
      doc.text(`Payment Method: ${payment.paymentMethod}`, 55, 190);

      doc.text(`Student Name: ${student.user.name}`, 320, 130);
      doc.text(`Register No: ${student.registerNo}`, 320, 150);
      doc.text(`Fee Category: ${fee.category}`, 320, 170);
      doc.text(`Description: ${fee.description}`, 320, 190);

      doc.rect(55, 220, 485, 25).fill('#F1F5F9');
      doc.fillColor('#0F172A').fontSize(11).text(`Amount Paid: ₹${payment.amount.toLocaleString()} (SUCCESS)`, 65, 227);

      const verifyUrl = `http://localhost:5173/verify/${payment.transactionId}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl);
      const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      doc.image(qrImageBuffer, 460, 270, { width: 85 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateBonafidePDF(student: any, docType = 'Bonafide Certificate'): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const docId = `DOC-${Date.now().toString(36).toUpperCase()}`;

      doc.rect(40, 40, 515, 60).fill('#1E3A8A');
      doc.fillColor('#FFFFFF').fontSize(18).text('UNIVERSITY ERP PORTAL', 50, 52, { align: 'center' });
      doc.fontSize(12).text(docType.toUpperCase(), 50, 75, { align: 'center' });

      doc.fillColor('#000000').fontSize(11);
      doc.text(`Document ID: ${docId}`, 50, 120);
      doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 350, 120);

      doc.fontSize(11).text(
        `This is to certify that ${student.user.name} (Register No: ${student.registerNo}) is a bonafide student of ${student.school || 'the University'}, enrolled in ${student.program?.name || student.specialization || 'the academic program'} for the academic year ${student.academicYear}.`,
        50,
        160,
        { width: 495, align: 'justify', lineGap: 4 }
      );

      doc.text(`Semester: ${student.semester}`, 50, 230);
      doc.text(`Section: ${student.section}`, 50, 250);
      doc.text(`Specialization: ${student.specialization}`, 50, 270);

      doc.text('_______________________', 50, 360);
      doc.text('Registrar / Academic Office', 50, 380);

      const verifyUrl = `http://localhost:5173/verify/${docId}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl);
      const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      doc.image(qrImageBuffer, 450, 340, { width: 85 });
      doc.fontSize(8).fillColor('#64748B').text('Scan to Verify', 460, 430);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function generateResultPDF(student: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.rect(40, 40, 515, 60).fill('#0F172A');
      doc.fillColor('#FFFFFF').fontSize(18).text('UNIVERSITY ERP PORTAL', 50, 52, { align: 'center' });
      doc.fontSize(12).text('SEMESTER RESULT STATEMENT', 50, 75, { align: 'center' });

      doc.fillColor('#000000').fontSize(10);
      doc.text(`Student: ${student.user.name}`, 50, 120);
      doc.text(`Register No: ${student.registerNo}`, 50, 140);
      doc.text(`Program: ${student.program?.name || 'N/A'}`, 50, 160);
      doc.text(`CGPA: ${student.cgpa}`, 350, 120);

      let y = 200;
      doc.fontSize(9).fillColor('#1E3A8A').text('Course', 50, y);
      doc.text('Credits', 250, y);
      doc.text('Marks', 320, y);
      doc.text('Grade', 390, y);
      doc.text('Result', 460, y);
      y += 20;
      doc.fillColor('#000000');

      const results = student.examResults || [];
      for (const r of results) {
        doc.text(r.exam?.course?.code || '—', 50, y);
        doc.text(String(r.exam?.course?.credits || '—'), 250, y);
        doc.text(String(r.marksObtained), 320, y);
        doc.text(r.grade, 390, y);
        doc.text(r.result, 460, y);
        y += 18;
      }

      const verifyUrl = `http://localhost:5173/verify/RESULT-${student.registerNo}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl);
      const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      doc.image(qrImageBuffer, 450, y + 30, { width: 85 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

