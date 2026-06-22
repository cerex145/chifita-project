import "./config/env";
import { createApp } from "./app";
import { ensureUploadDirs, uploadConfig } from "./config/uploads";
import { startNewsCron } from "./jobs/newsCron";

const app = createApp();
const port = Number(process.env.PORT ?? 4000);

ensureUploadDirs()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      startNewsCron();
    });
  })
  .catch((error) => {
    console.error("Could not prepare upload directories", error);
    process.exit(1);
  });
