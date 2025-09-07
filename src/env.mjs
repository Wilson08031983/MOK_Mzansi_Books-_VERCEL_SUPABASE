import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    PAYSTACK_SECRET_KEY: z.string().min(1),
    PAYSTACK_SECRET_KEY_TEST: z.string().optional(),
    PAYSTACK_CALLBACK_URL: z.string().url().optional(),
    PAYSTACK_WEBHOOK_URL: z.string().url().optional(),
  },
  client: {
    // Nothing here just yet
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    PAYSTACK_SECRET_KEY_TEST: process.env.PAYSTACK_SECRET_KEY_TEST,
    PAYSTACK_CALLBACK_URL: process.env.PAYSTACK_CALLBACK_URL,
    PAYSTACK_WEBHOOK_URL: process.env.PAYSTACK_WEBHOOK_URL,
  },
});