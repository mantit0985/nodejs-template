# [Project Name] - Service Starter Guide

![CI](https://github.com/mantit0985/nodejs-template/actions/workflows/ci.yml/badge.svg) ![CD](https://github.com/mantit0985/nodejs-template/actions/workflows/cd.yml/badge.svg) ![Node](https://img.shields.io/badge/node-22-blue) ![License](https://img.shields.io/github/license/mantit0985/nodejs-template)

A professional, production-ready Node.js service designed for scalability, maintainability, and high developer velocity.

## Compliance & Standards

- **Styling**: Adheres to [ESLint](https://eslint.org/) rules via custom configuration.
- **Typing**: Implements TypeScript typing.
- **Security**: Verified against OWASP Top 10 using Semgrep SAST (if configured).

## Release process

Releases are made by pushing an annotated GPG-signed tag (`git tag -a vX.Y.Z -m "release vX.Y.Z" && git push origin vX.Y.Z`). A pre-push hook (release-gate.sh) validates the tag at push time:

1. tag name matches the VERSION file at that commit
2. tagged commit is origin/main tip
3. latest CI run for that commit is green
4. tag signature verifies

On success the hub release workflow publishes the GitHub Release with SHA256SUMS and its detached signature. Enable the hook in your clone with:
`git config core.hooksPath <hub-repo-clone>/.github/hooks`
