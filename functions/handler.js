import { dialogflow, SimpleResponse } from 'actions-on-google';
import openai from 'openai';

// Set up OpenAI API credentials
openai.api_key = process.env.OPENAI_API_KEY;

// Set up the Dialogflow agent
const app = dialogflow();

// Define your Cloud Function
export const handler = async (request, response) => {
  try {
    // Extract the question from the request
    const question = request.body.queryResult.queryText;

    // Pass the question to ChatGPT and get a response
    const result = await openai.Completion.create({
      engine: 'davinci',
      prompt: `Q: ${question}\nA:`,
      maxTokens: 1024,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    // Extract the answer from the response
    const answer = result.choices[0].text.trim();

    // Return the answer to the user
    const text = `Here's what I found: ${answer}`;
    const speech = `<speak>${text}</speak>`;
    response.json({
      fulfillmentMessages: [
        {
          platform: 'ACTIONS_ON_GOOGLE',
          simpleResponses: {
            simpleResponses: [
              {
                textToSpeech: speech,
                displayText: text,
              },
            ],
          },
        },
      ],
    });
  } catch (error) {
    console.error(error);
    // response.status(500).send('Internal Server Error');
  }
};

app.handler = handler;
