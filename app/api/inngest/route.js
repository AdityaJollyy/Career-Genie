import { inngest } from "@/lib/inngest/client";
import { generateIndustryInsights } from "@/lib/inngest/functions";
// import { helloWorld } from "@/lib/inngest/functions"; // testing
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    // helloWorld, // testing
    generateIndustryInsights,
  ],
});
