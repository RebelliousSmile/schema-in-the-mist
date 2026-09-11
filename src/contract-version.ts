export const CONTRACT_VERSION = 1 as const;
export const SCHEMA_RELEASE_TAG = "v1.0.0" as const;
export const TOML_VERSION = "1.0.0" as const;

export function assertCompatiblePackageVersion(packageVersion: string): void {
  const major = Number.parseInt(packageVersion.split(".", 1)[0] ?? "", 10);
  if (!Number.isSafeInteger(major) || major !== CONTRACT_VERSION) {
    throw new Error(
      `Package version ${packageVersion} is incompatible with Mist Engine contract v${CONTRACT_VERSION}`,
    );
  }
}
