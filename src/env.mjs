import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    PAYSTACK_SECRET_KEY: z.string().min(1),
  },
  client: {
    // Nothing here just yet
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  },
});