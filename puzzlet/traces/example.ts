import 'dotenv/config';

import { Puzzlet } from "@puzzlet/sdk";
import { ModelPluginRegistry, createTemplateRunner } from "@puzzlet/agentmark";
import AllModels from "@puzzlet/all-models";

const apiKey = process.env.PUZZLET_API_KEY!
const appId = process.env.PUZZLET_APP_ID!
const baseUrl = process.env.PUZZLET_BASE_URL!

const puzzletClient = new Puzzlet({
    apiKey,
    appId,
    baseUrl
  }, createTemplateRunner);
const tracer = puzzletClient.initTracing();

console.log('apiKey exists', !!apiKey)
console.log('appId exosts', !!appId)

// Note: Registering all latest models for demo/development purposes. 
// In production, you'll likely want to selectively load these, and pin models.
// See AgentMark docs for more details: https://docs.puzzlet.ai/agentmark/model-providers
ModelPluginRegistry.registerAll(AllModels);

async function run () {
  try {
    console.log('Starting run function');
    console.log('Fetching prompt "example.prompt.mdx"...');





    const basicPrompt = await puzzletClient.fetchPrompt("example.prompt.mdx");
    console.log('Successfully fetched prompt');
    
    const props = { myProp: 'hello' };
    const telemetry = {
      isEnabled: true,
      functionId: 'example-function-id',
      metadata: { userId: 'example-user-id' }
    };
    
    console.log('Running prompt with props:', JSON.stringify(props));
    const result = await basicPrompt.run(props, { telemetry });
    console.log('Prompt run completed successfully');
    return result;
  } catch (error) {
    console.error('Error in run function:', error);
    throw error; // Re-throw so the promise chain knows it failed
  }
}

// Note: You only need to shutdown the tracer for local/short running tasks.
run()
  .then(result => {
    console.log('Run completed successfully, result:', result);
    return tracer.shutdown();
  })
  .then(() => {
    console.log('Tracer shutdown complete');
  })
  .catch(error => {
    console.error('Error occurred during execution:', error);
    tracer.shutdown().catch(err => console.error('Error shutting down tracer:', err));
  });