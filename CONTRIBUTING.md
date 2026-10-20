# Contributing Guidelines

## Commit Messages

We follow **Conventional Commits**. Every commit must start with one of the following types:

- `feat:` A new feature
- `fix:` A bug fix
- `chore:` Maintenance, tooling, or dependency updates
- `docs:` Documentation changes
- `refactor:` Code changes that neither fix a bug nor add a feature
- `test:` Adding missing tests or correcting existing tests

Example: `feat(auth): implement jwt rotation`

## Pull Request Process

1. Create a feature branch from `main`.
2. Ensure all tests pass locally (`pnpm run test`).
3. Ensure linting is clean (`pnpm run lint`).
4. Submit PR with a clear description and test plan.
