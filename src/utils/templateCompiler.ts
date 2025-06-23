import fs from "fs";
import path from "path";
import handlebars from "handlebars";
// Compiles a Handlebars template with given variables

export function compileTemplate(
  templateName: string,
  variables: Record<string, any>
) {
  const filePath = path.join(
    __dirname,
    "..",
    "email",
    "templates",
    `${templateName}.hbs`
  );
  // Read and compile the template source
  const templateSource = fs.readFileSync(filePath, "utf8");
  const template = handlebars.compile(templateSource);
  // Return the compiled HTML string
  return template(variables);
}
