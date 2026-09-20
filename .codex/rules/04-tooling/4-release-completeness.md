# Complete tagged releases

- Publish every new tag completely.
- Attach package and checksum assets.
- Update every version-bearing artifact.
- When `SCHEMA_RELEASE_TAG` changes, run `npm run gen` and commit the regenerated schema IDs under both `schemas/v1/` and `schemas/`.
- Verify the downloadable archive contents.
- Pin consumers to exact release.
