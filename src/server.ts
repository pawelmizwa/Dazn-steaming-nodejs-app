import { createServer } from "http";
import { addApiRoutes } from "./setup/router";
import { createApp } from "./setup/app";

async function main() {
  const httpPort = 3456;
  const app = await createApp("local server", addApiRoutes);
  const server = createServer(app);
  server.listen(httpPort, () => {
    console.log(`Server is running at http://localhost:${httpPort}`);
  });
}

main()
  .then(() => console.log("Server running"))
  .catch(err => {
    console.error("Server failed", err);
    process.exit(1);
  });
