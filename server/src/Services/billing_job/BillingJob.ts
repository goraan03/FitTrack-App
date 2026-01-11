import { BillingRepository } from "../../Database/repositories/billing/BillingRepository";
import { calculateInvoiceMeta, htmlToPdfBuffer, renderInvoiceHtml, savePdfToDisk } from "../billing/BillingService";
import { EmailService } from "../email/EmailService";
import cron from "node-cron";
import { InvoicesRepository } from "../../Database/repositories/invoice/InvoicesRepository";


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

                // Cuvanje fakture na disku
                const filepath = await savePdfToDisk(
                    pdfBuffer,
                    meta,
                    trainer.trainerName
                );

                // Upis fakture u bazu
                const invoiceId = await invoiceRepo.createInvoice({
                    trainerId: trainer.trainerId,
                    period: meta.period,
                    clientCount: trainer.clientCount,
                    amount: trainer.clientCount * 3,
                    pdfPath: filepath,
                });

                // Slanje maaila
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
        console.log("[Billing] Mesečni billing job završen.");
    });
}