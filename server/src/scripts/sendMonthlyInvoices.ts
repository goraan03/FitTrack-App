import { BillingRepository } from "../Database/repositories/billing/BillingRepository";
import { calculateInvoiceMeta, htmlToPdfBuffer, renderInvoiceHtml } from "../Services/billing/BillingService";
import { EmailService } from "../Services/email/EmailService";



async function main() {
    const emailService = new EmailService();
    await emailService.verifyConnection();

    const billingRepo = new BillingRepository();
    const trainers = await billingRepo.getTrainersWithClientCount();

    if(!trainers.length) {
        console.log("Nema trenera sa klijentima za slanje faktura.");
        return;
    }

    const now = new Date();
    const meta = calculateInvoiceMeta(now);

    for(const trainer of trainers) {
        try {
            const html = renderInvoiceHtml(trainer, meta);
            const pdfBuffer = await htmlToPdfBuffer(html);
            const filename = 'Racun_${meta.period.replace("/", "-")}_trainer-${trainer.trainerId}.pdf';

            await emailService.sendInvoiceEmail(
                trainer.trainerEmail,
                `Račun za korišćenje platforme - ${meta.period}`,
                "U prilogu se nalazi vaš mesečni račun za korišćenje platforme.",
                pdfBuffer,
                filename
            );

            console.log(`Poslat račun treneru ID=${trainer.trainerId}, email=${trainer.trainerEmail}, klijenata=${trainer.clientCount}`);
        } catch(error) {
            console.error(`Greška pri slanju računa treneru ID=${trainer.trainerId}`,
            error);
        }
    }
}

main().catch((error) =>{
    console.error("Greska u sendMonthlyInvoices skripti", error);
    process.exit(1);
});