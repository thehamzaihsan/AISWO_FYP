# Contributing to AISWO Smart Bin Monitoring System

Thank you for your interest in contributing to AISWO! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce the bug
- Provide system information (OS, Node.js version, etc.)
- Include error messages and logs

### Suggesting Features
- Use the GitHub issue tracker
- Describe the feature in detail
- Explain why it would be useful
- Consider implementation complexity

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 Development Guidelines

### Code Style
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages
Use clear, descriptive commit messages:
- `feat: add new bin management feature`
- `fix: resolve email notification issue`
- `docs: update API documentation`
- `test: add unit tests for bin service`

### Pull Request Guidelines
- Provide a clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation as needed
- Keep PRs focused on a single feature/fix

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd aiswo-backend
npm test

# Frontend tests
cd aiswo_frontend
npm test
```

### Test Coverage
- Aim for high test coverage
- Test both success and error cases
- Include integration tests for API endpoints

## 📚 Documentation

### Code Documentation
- Document complex functions and classes
- Use JSDoc for JavaScript functions
- Keep README files updated
- Document API changes

### User Documentation
- Update user guides for new features
- Include screenshots for UI changes
- Keep setup instructions current

## 🐛 Bug Reports

When reporting bugs, please include:

### Required Information
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node.js version, browser version
- **Screenshots**: If applicable

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. Windows 10, macOS, Linux]
- Node.js Version: [e.g. 16.14.0]
- Browser: [e.g. Chrome 91, Firefox 89]
- Project Version: [e.g. 1.0.0]

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

When suggesting features, please include:

### Required Information
- **Feature Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Proposed Solution**: How you think it should work
- **Alternatives**: Other solutions you've considered

### Feature Request Template
```markdown
## Feature Description
Brief description of the feature

## Use Case
Why would this feature be useful?

## Proposed Solution
How should this feature work?

## Alternatives
What other solutions have you considered?

## Additional Context
Any other context or screenshots
```

## 🔒 Security

### Security Issues
- Report security issues privately to maintainers
- Do not create public issues for security vulnerabilities
- Include detailed information about the vulnerability

### Security Guidelines
- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Follow security best practices
- Keep dependencies updated

## 📞 Getting Help

### Community Support
- GitHub Discussions for questions
- GitHub Issues for bugs and features
- Check existing documentation first

### Development Questions
- Check the documentation
- Search existing issues
- Ask in GitHub Discussions
- Contact maintainers if needed

## 🏷️ Release Process

### Version Numbering
We use semantic versioning (SemVer):
- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in a backwards compatible manner
- **PATCH**: Backwards compatible bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version numbers updated
- [ ] Changelog updated
- [ ] Release notes prepared

## 📄 License

By contributing to AISWO, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to AISWO! 🚀
