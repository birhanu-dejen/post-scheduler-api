import fs from "fs";
import path from "path";
import handlebars from "handlebars";

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
  const templateSource = fs.readFileSync(filePath, "utf8");
  const template = handlebars.compile(templateSource);
  return template(variables);
}
