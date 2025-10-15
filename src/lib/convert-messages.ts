import type { JSONValue, UIMessage, UITools } from 'ai';

 
export type MyUIMessage = UIMessage<never, { custom: JSONValue }, UITools>;

/**
 * This function is a no-op. It's a placeholder from the v4->v5 migration
 * that is no longer needed. It's kept to avoid breaking imports.
 * @param msg The message to convert.
 * @returns The message, unchanged.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertV4MessageToV5(msg: MyUIMessage | any): MyUIMessage {
  return msg as MyUIMessage;
}

/**
 * This function is a no-op. It's a placeholder from the v4->v5 migration
 * that is no longer needed. It's kept to avoid breaking imports.
 * @param msg The message to convert.
 * @returns The message, unchanged, cast to `any`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertV5MessageToV4(msg: MyUIMessage): any {
  return msg;
}
