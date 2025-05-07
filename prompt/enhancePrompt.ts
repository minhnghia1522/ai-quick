export function createEnhancePrompt(userInput: string): string {
  return `Generate an improved and more detailed version of this prompt (respond exclusively with the enhanced prompt—do not include conversation, explanations, introductions, bullet points, placeholders, or any surrounding quotation marks):

${userInput}
`;
}
