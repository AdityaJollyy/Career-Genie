import prisma from "@/lib/prisma";
import { inngest } from "./client";

// Example function, uncomment to test
// export const helloWorld = inngest.createFunction(
//   { id: "hello-world" },
//   { event: "test/hello.world" },
//   async ({ event, step }) => {
//     await step.sleep("wait-a-moment", "1s");
//     return { message: `Hello ${event.data.email}!` };
//   },
// );

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // every Sunday midnight
  async ({ step }) => {
    // 1. Fetch industries
    const industries = await step.run("Fetch industries", async () => {
      return prisma.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
        Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
        {
          "salaryRanges": [
            { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
          ],
          "growthRate": number,
          "demandLevel": "HIGH" | "MEDIUM" | "LOW",
          "topSkills": ["skill1", "skill2"],
          "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
          "keyTrends": ["trend1", "trend2"],
          "recommendedSkills": ["skill1", "skill2"]
        }

        IMPORTANT: Return ONLY JSON.
        Include at least 5 roles, skills, and trends.
      `;

      // 2. AI call using infer (NO SDK needed)
      const response = await step.ai.infer(
        `Generate insights for ${industry}`,
        {
          model: step.ai.models.gemini({
            model: "gemini-3.1-flash-lite-preview",
          }),
          body: {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          },
        },
      );

      // 3. Extract + parse JSON
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!text) throw new Error("Empty AI response");

      const cleaned = text.replace(/```json|```/g, "").trim();

      let insights;
      try {
        insights = JSON.parse(cleaned);
      } catch {
        throw new Error(`Invalid JSON from AI for ${industry}`);
      }

      // 4. Update DB
      await step.run(`Update ${industry} insights`, async () => {
        await prisma.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  },
);
