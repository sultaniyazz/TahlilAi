export function fillTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return Object.entries(vars).reduce(
    (current, [key, value]) => current.replaceAll(`{${key}}`, value),
    template,
  );
}
