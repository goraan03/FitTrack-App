import 'dotenv/config';
import app from './app';
import { setupMonthlyBillingJob } from './Services/billing_job/BillingJob';

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API sluša na portu ${port}`));
setupMonthlyBillingJob();

export default app;