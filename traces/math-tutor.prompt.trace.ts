import 'dotenv/config';
import { Puzzlet } from "@puzzlet/sdk";
import { createTemplateRunner, ModelPluginRegistry } from "@puzzlet/agentmark";
import AllModels from "@puzzlet/all-models";

// Debug: Log environment variables to verify they're loaded
console.log("Environment variables loaded:");
console.log("- PUZZLET_API_KEY exists:", !!process.env.PUZZLET_API_KEY);
console.log("- PUZZLET_APP_ID exists:", !!process.env.PUZZLET_APP_ID);
console.log("- OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);

const puzzletClient = new Puzzlet({
  apiKey: process.env.PUZZLET_API_KEY!,
  appId: process.env.PUZZLET_APP_ID!
}, createTemplateRunner);
const tracer = puzzletClient.initTracing();

// Register relevant plugins for AgentMark: OpenAI, Anthropic, etc.
ModelPluginRegistry.registerAll(AllModels);

async function run() {
  try {
    console.log("Fetching prompt...");
    const prompt = await puzzletClient.fetchPrompt("math-tutor.prompt.mdx");
    console.log("Prompt fetched successfully");
    
    const props = { userMessage: 'When was the end of the second to last ice age?' };
    const telemetry = {
      isEnabled: true,
      functionId: 'math-tutor',
      metadata: { userId: 'example-user-id' }
    };
    
    console.log("Running prompt...");
    return await prompt.run(props, { telemetry });
  } catch (error) {
    console.error("Error in run function:");
    console.error(error);
    throw error; // Re-throw to maintain the same behavior but with logging
  }
}

run()
  .then(result => {
    console.log("Run successful, result:");
    console.log(result);
  })
  .catch(error => {
    console.error("Error running the application:", error);
  })
  .finally(() => {
    console.log("Shutting down tracer...");
    return tracer.shutdown();
  })
  .then(() => {
    console.log("Exiting process");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error during shutdown:", error);
    process.exit(1);
  });