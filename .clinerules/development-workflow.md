## Brief overview
Development workflow guidelines for EventTS project to optimize token usage and avoid redundant operations.

## Development server management
- Only run `npm run dev` once at the beginning of the session
- Check if server is already running on localhost:3000 before starting a new instance
- Use `curl -I http://localhost:3000` to verify server status
- Avoid running multiple dev servers simultaneously

## API testing
- Use correct port (localhost:3000, not 3001)
- Test API endpoints with `curl http://localhost:3000/api/events`
- Use `curl -I` for headers-only requests to save bandwidth
- Avoid redundant API calls when server is confirmed working

## Token optimization
- Don't repeat successful operations unnecessarily
- Cache server status information
- Use minimal curl commands for testing
- Avoid running dev server multiple times in same session

## Error handling
- When server is on wrong port, check actual running port first
- Verify package installations before running dev server
- Check for CSS compilation errors in browser console
- Use browser dev tools for debugging instead of repeated curl calls

## Database operations
- Verify database connection once per session
- Don't repeat database migrations unless schema changes
- Use existing database connection for testing
- Check environment variables before database operations
- Always use Supabase MCP server to configure database, run migrations, and manage database operations

## Bug Finding and Fixing Methodology
When addressing bugs in the codebase, follow this systematic approach:

### Step 1: Codebase Analysis & Bug Identification
- Thoroughly examine repository structure, files, and code for logical errors
- Look for unhandled edge cases, incorrect assumptions, or deviations from documented behavior
- Prioritize bugs in critical paths (authentication, payments, data handling) or affecting user experience
- Focus on bugs with clear failure cases and visible impact

### Step 2: Detailed Bug Report
Before implementing any fix, provide:
- File name and specific line numbers where the bug exists
- Clear description of the bug and its potential impact on users or system functionality
- Explanation of the failure case that demonstrates the bug
- Proposed strategy for fixing the issue

### Step 3: Targeted Fix Implementation
- Implement the most direct and clean solution to the identified bug
- Make minimal changes focused only on resolving the specific issue
- Avoid refactoring, style changes, or unrelated modifications
- Follow existing code patterns and conventions
- Consider edge cases and ensure the fix is robust

### Step 4: Verification Through Testing
- Write a new test case that specifically fails before the fix and passes after it
- Run the existing test suite to ensure no regressions are introduced
- Verify that the fix addresses the root cause, not just symptoms
- Maintain backward compatibility where possible

## Test Coverage Improvement Strategy
When improving test coverage, follow this structured approach:

### Step 1: Coverage Analysis
- Scan repository structure to identify source files, functions, or modules with lowest test coverage
- Determine the most critical and currently untested code paths
- Identify business logic, edge cases, and complex functions that lack proper testing
- Look for areas where bugs are more likely to occur due to complexity or critical functionality

### Step 2: Meaningful Test Implementation
- Write new, high-quality tests (unit, integration, or end-to-end as appropriate) to cover identified gaps
- Focus on testing actual business logic, not just function calls
- Include tests for edge cases and error conditions
- Ensure tests verify expected behavior and handle potential failure scenarios
- Create tests that would catch real-world issues, not just trivial code paths

### Step 3: Follow Existing Conventions
- Examine existing test files to understand the project's testing framework, naming conventions, and structure
- Use existing test helpers, mocks, and utilities to maintain consistency
- Follow the same patterns for test organization, assertions, and mock setups
- Ensure new tests integrate seamlessly with the existing test suite

### Step 4: Validation
- Execute all new tests to confirm they pass as expected
- Run the entire existing test suite to ensure no regressions or breaking changes were introduced
- Verify that test coverage metrics have improved in the targeted areas

### Step 5: Summary of Improvements
- Provide a detailed summary of which files were modified or created
- Document what new behaviors, functions, or edge cases are now covered by tests
- Explain how tests improve the overall reliability of the codebase

## Task completion strategies
- Always use Context7 MCP server to resolve library issues and get documentation
- Always use Chrome DevTools MCP server for browser automation and testing
- Always use auto-approve for tool executions to maintain workflow efficiency
- Complete all tasks without stopping until finished
