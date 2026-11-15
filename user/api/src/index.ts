import { createApp } from "./app.ts";
import { PORT } from "./config/env.ts";
import { verifyMail } from "./services/mail.ts";

createApp().listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  console.log("Admin panel: http://localhost:3000/admin");
  void verifyMail();
});
