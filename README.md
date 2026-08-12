# AI QUICK

[Tiếng Việt](README.vi.md)

AI QUICK is a community-friendly AI toolkit for language translation, code conversion, prompt improvement, sample-data generation, and PDF chat. It helps learners, developers, and multilingual teams work with their own AI provider API keys.

## Try it

Open the live demo: [AI QUICK](https://help-aiquick.vercel.app/translate/languages).

To get started, open **Settings** from the sidebar, add an OpenAI or Google Gemini API key, save it, and choose an available model. API usage is billed by the provider associated with your key.

Create a key in the [OpenAI Dashboard](https://platform.openai.com/api-keys) or [Google AI Studio](https://aistudio.google.com/app/apikey).

> Never share an API key, commit it to source control, or include it in a public screenshot.

## Privacy and client-side architecture

### Our commitment

AI QUICK has no application backend or server-side database for your content. All feature-related data handling runs in your browser:

- API keys and model preferences are stored in browser local storage.
- Translation history, PDF files, chat history, embeddings, and local cost records are stored in browser storage (local storage or IndexedDB).
- AI QUICK does not send your text, prompts, PDF files, chat content, embeddings, or API keys to an AI QUICK application server, and does not store them on one.

Clearing your browser’s site data can permanently remove this locally stored data.

### Direct requests to AI providers

When you use an AI feature, the required input is sent directly from your browser to the AI provider you selected, such as OpenAI or Google Gemini. That provider’s terms, privacy policy, retention settings, and billing apply to the request. Do not submit sensitive data unless you are comfortable with the provider’s policies.

If a deployment enables Google Analytics, it may transmit technical usage or performance telemetry to Google. It does not receive the content you enter into AI QUICK’s features.

## Features

| Tool | What it does |
| --- | --- |
| **Language translator** | Translates text between Vietnamese, English, and Japanese. You can also paste or upload PNG, JPG, or WebP images to translate their contents. |
| **Code translator** | Converts natural-language instructions into code, explains code in natural language, or translates between programming languages. |
| **Prompt enhancer** | Turns a short request into a clearer, more structured prompt, with an option to translate the improved prompt into English. |
| **Sample-data generator** | Creates sample data from a table schema, SQL query, or data description for testing and development. |
| **Chat with PDF** | Uploads and processes PDF files so that you can ask questions about their contents. |

## How to use AI QUICK

### 1. Translate a language

1. Choose **Language translator** in the sidebar.
2. Select the source language, or choose **Detect language**, then select the target language.
3. Type or paste text, or select an image. Supported image formats are PNG, JPG, and WebP.
4. Select **Translate** and wait for the streamed result.
5. Copy the result as plain text or Markdown, or open the history to revisit recent translations.

For Japanese or English output, turn on **Learning**, select a short passage, and choose **Learn this passage** for pronunciation, meaning, grammar, and vocabulary help.

### 2. Translate code

1. Choose **Code translator**.
2. Select an input language, or **Natural Language**, and the desired output language.
3. Enter an instruction or paste code, then select **Translate**.
4. Review the output before using it in a project and select **Copy output** when ready.

### 3. Improve a prompt

1. Choose **Prompt enhancer**.
2. Enter the initial request, for example: `Write a friendly email confirming a meeting time`.
3. Select **Enhance** to create a more detailed prompt.
4. Optionally select **Translate to English** or copy the result.

### 4. Generate sample data

1. Choose **Generate data**.
2. Paste a SQL statement, table schema, or a description of the fields you need.
3. Select **Generate data**, then review and copy the sample data for testing.

Never use AI-generated data in production without validating its correctness, privacy implications, and business constraints.

### 5. Chat with a PDF

1. Choose **Chat with PDF** and select **Start chat**.
2. Upload one or more PDF files, then select **Process PDF**.
3. Once processing finishes, enter a question about the document and select **Send**.
4. Return to a conversation from the history shown in the sidebar.

## Run locally

### Requirements

- A current Node.js LTS release
- npm
- An OpenAI API key or Google Gemini API key for AI features

### Installation

```bash
git clone <repository-url>
cd ai-code-translator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then add your API key in **Settings**. The UI does not require putting an AI API key in `.env`.

## Contributing

Contributions that make AI QUICK more useful for the community are welcome. Keep each change focused, describe the user problem it solves, and run the project checks available in your local environment before opening a pull request.

---

If AI QUICK helps you, share the [live demo](https://help-aiquick.vercel.app/translate/languages) with the community.
