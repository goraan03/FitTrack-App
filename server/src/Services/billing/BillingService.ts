import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const PRICE_PER_CLIENT = 3; // EUR po klijentu

export interface TrainerBillingData {
  trainerId: number;
  trainerName: string;
  trainerEmail: string;
  clientCount: number;
}

export interface InvoiceMeta {
  period: string;    // "01/2026"
  issueDate: string; // "09.01.2026."
  dueDate: string;   // "16.01.2026."
}

export function calculateInvoiceMeta(forDate: Date): InvoiceMeta {
  const month = forDate.getMonth() + 1;
  const year = forDate.getFullYear();

  const period = `${month.toString().padStart(2, '0')}/${year}`;
  const issueDate = forDate.toLocaleDateString('sr-RS');

  const due = new Date(forDate);
  due.setDate(due.getDate() + 7);
  const dueDate = due.toLocaleDateString('sr-RS');

  return { period, issueDate, dueDate };
}

export function renderInvoiceHtml(
  billingData: TrainerBillingData,
  meta: InvoiceMeta
): string {
  const templatePath = path.join(
    __dirname,
    '..',
    '..',
    'templates',
    'invoice_template.html'
  );

  let html = fs.readFileSync(templatePath, 'utf8');

  const totalAmount = billingData.clientCount * PRICE_PER_CLIENT;

  const replacements: Record<string, string | number> = {
    '{{companyName}}': 'Moja firma d.o.o.',
    '{{companyAddress}}': 'Ulica bb, Grad',
    '{{companyPib}}': '123456789',
    '{{companyMatric}}': '01234567',
    '{{bankName}}': 'Banka AD',
    '{{iban}}': 'RS35123456789012345678',
    '{{swift}}': 'BANKRSBG',
    '{{trainerName}}': billingData.trainerName,
    '{{trainerEmail}}': billingData.trainerEmail,
    '{{billingPeriod}}': meta.period,
    '{{issueDate}}': meta.issueDate,
    '{{clientCount}}': billingData.clientCount,
    '{{pricePerClient}}': PRICE_PER_CLIENT.toFixed(2),
    '{{totalAmount}}': totalAmount.toFixed(2),
    '{{dueDate}}': meta.dueDate,
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(key, 'g'), String(value));
  }

  return html;
}

export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
  return Buffer.from(buffer);
}

export function getPricePerClient(): number {
  return PRICE_PER_CLIENT;
}