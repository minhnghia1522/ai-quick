export function createGenerateDataPrompt(userInput: string): string {
  return `
    Generate SQL INSERT statements to insert exactly rows (by default, 3) that satisfy the conditions of the provided SQL statement. These will represent the rows returned by a SELECT query or affected by an UPDATE/DELETE operation, as applicable. Adhere strictly to the following requirements:

    Use the provided table schema and SQL statement:
    ${userInput}

    Ensure the inserted rows fully satisfy all conditions or filters present in this SQL statement.
    SQL Dialect Consistency: Use syntax and data types appropriate for the SQL dialect of the provided input (ensuring compatibility with MySQL, SQL Server, or PostgreSQL according to the given schema and query structure).
    Meaningful Text Content: For columns defined as character varying, varchar, nvarchar, or any similar text-based type, provide natural, contextually appropriate Japanese text relevant to the table’s business context. (It is not required to use the maximum allowed length; focus on realistic and meaningful content, avoiding any random or nonsensical characters.)
    NOT NULL and Valid Values: Ensure all NOT NULL columns are filled with valid, realistic values that are contextually appropriate and consistent with the table’s implied business logic.
    Respect Constraints: For columns with specific constraints or enumerations (such as date ranges, status codes, foreign keys, etc.), supply values that fully comply with both the table schema’s rules and all conditions or join criteria in the provided SQL statement.
    Referenced Tables: If the SQL statement references additional tables, include the necessary CREATE TABLE statements for those tables and provide corresponding INSERT statements as needed. This ensures referential integrity and that all data is logically consistent, satisfying every constraint and relationship.
    Output Only SQL Statements: Return only the SQL statements. Output them as plain text, each statement properly terminated with a semicolon, and down the line, and do not include any extra formatting, code fences, explanations, or comments.
  `;
}
