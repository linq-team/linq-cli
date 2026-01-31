# Versioning

`linq-cli` uses [Semantic Versioning](https://semver.org/) for all changes.

## Version Format

Versions follow the `MAJOR.MINOR.PATCH` format:

- **PATCH**: Bug fixes and backwards-compatible changes. Safe to upgrade.
- **MINOR**: New features or minor breaking changes. May require small adjustments.
- **MAJOR**: Significant breaking changes. May require reworking scripts or workflows.

## Support Policy

**Only the current MAJOR version of `linq-cli` is supported.** Bug fixes, security patches, new features, and improvements are applied only to the latest version.

If you're using an older major version, we encourage you to upgrade to receive updates.

## Upgrade Recommendations

We recommend pinning at least the major version in your scripts and CI/CD pipelines:

```bash
# Pin to major version (recommended)
npm install -g @linqapp/cli@^1

# Pin to exact version (most stable)
npm install -g @linqapp/cli@1.2.3
```

## Breaking Changes

We announce breaking changes in advance when possible:

- Breaking changes are documented in the [CHANGELOG](CHANGELOG.md)
- Major version bumps include migration notes in GitHub releases
- Deprecation warnings are added before removing features

## Pre-1.0

While at version `0.x`, the API is considered unstable and breaking changes may occur in minor versions. Once we release `1.0.0`, we will follow strict semver guarantees.
