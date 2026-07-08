import { CorePlugin } from "@/plugins";
import { createClient } from "@/sdk";

const client = createClient({
  url: "",
  plugins: [new CorePlugin()],
});
