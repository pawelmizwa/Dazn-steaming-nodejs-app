export function createEnvReader(envs: { [key: string]: string | undefined }) {
  return Object.freeze({
    readRequiredString(variable: string): string {
      const value = envs[variable];
      if (value === undefined) {
        throw new Error(`Missing environment env: ${variable}`);
      }
      return value;
    },
  });
}
