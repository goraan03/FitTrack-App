import { BillingRepository } from "../../Database/repositories/billing/BillingRepository";
import { calculateInvoiceMeta, htmlToPdfBuffer, renderInvoiceHtml, savePdfToDisk } from "../billing/BillingService";
import { EmailService } from "../email/EmailService";
import cron from "node-cron";
import { InvoicesRepository } from "../../Database/repositories/invoice/InvoicesRepository";

import db from "../../Database/connection/DbConnectionPool";

export function setupMonthlyBillingJob() {
    cron.schedule("0 3 1 * *", async () => {
        const emailService = new EmailService();
        const billingRepo = new BillingRepository();
        const invoiceRepo = new InvoicesRepository();

        try{
            await emailService.verifyConnection();
        } catch(error) {
            console.error("Neuspešna verifikacija SMTP konekcije za slanje faktura:", error);
            return;
        }

        const trainers = await billingRepo.getTrainersWithClientCount();
        if(!trainers.length){
            console.log("Nema trenera sa klijentima za slanje faktura.");
            return;
        }

        const now = new Date();
        const meta = calculateInvoiceMeta(now);

        for(const trainer of trainers) {
            try{
                const html = renderInvoiceHtml(trainer, meta);
                const pdfBuffer = await htmlToPdfBuffer(html);

                const filepath = await savePdfToDisk(
                    pdfBuffer,
                    meta,
                    trainer.trainerName
                );

                const invoiceId = await invoiceRepo.createInvoice({
                    trainerId: trainer.trainerId,
                    period: meta.period,
                    clientCount: trainer.clientCount,
                    amount: trainer.clientCount * 3,
                    pdfPath: filepath,
                });

                const filename = `Racun_${meta.period.replace("/", "-")}_${
                    trainer.trainerId
                }.pdf`;

                await emailService.sendInvoiceEmail(
                    trainer.trainerEmail,
                    `Račun za korišćenje platforme - ${meta.period}`,
                    "U prilogu se nalazi vaš mesečni račun za korišćenje platforme.",
                    pdfBuffer,
                    filename
                );

                console.log(`[Billing] Poslat račun #${invoiceId} treneru ID=${trainer.trainerId}, klijenata=${trainer.clientCount}`);

            }catch(error){
                console.error(`Greška pri slanju računa treneru ID=${trainer.trainerId}`, error);
            };
        }

        // NOVO — push metrika u Backoffice jednom mesečno, posle billing joba
        try {
            const [[trainersRow]] = await db.query<any[]>(
                `SELECT COUNT(*) as cnt FROM users WHERE uloga='trener' AND blokiran=0`
            );
            const [[clientsRow]] = await db.query<any[]>(
                `SELECT COUNT(*) as cnt FROM users WHERE uloga='klijent'`
            );

            await fetch(`${process.env.BACKOFFICE_URL}/api/integrations/metrics`, {
                method:  "POST",
                headers: {
                    "Content-Type":    "application/json",
                    "x-backoffice-key": process.env.BACKOFFICE_API_KEY ?? "",
                },
                body: JSON.stringify({
                    date:        new Date().toISOString().slice(0, 10),
                    activeUsers: trainersRow.cnt + clientsRow.cnt,
                    usersByRole: {
                        trener:  trainersRow.cnt,
                        klijent: clientsRow.cnt,
                    },
                    notes: `Automatski push uz mesečni billing job — ${meta.period}`,
                }),
            });

            console.log("[Billing] Metrike pushnuté u Backoffice.");
        } catch (metricError) {
            // Ne prekidamo execution ako metrike ne uspeju
            console.error("[Billing] Greška pri push metrika:", metricError);
        }

        console.log("[Billing] Mesečni billing job završen.");
    });
}
