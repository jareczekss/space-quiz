# Project Guidelines

## Build and test

- There are no build, lint, or automated test commands configured.
- The app is a standalone page: open `index.html` in a browser to run it.
- For a manual smoke test, answer a question and check its feedback and disabled answers, advance through the quiz to results, then restart. To check a single question, reload and answer the first one.

## Architecture

- The app lives in `index.html`: semantic page markup, styles in a `<style>` block, and quiz data and behavior in an inline `<script>`. It has no runtime dependencies or build step.
- `questions` is the quiz's source of truth. `renderQuestion()` updates the current question and builds answer buttons; `chooseAnswer()` scores and locks the answer and displays feedback; the Next button advances or shows results; Restart resets the quiz.

## Conventions

- Each question has a category, prompt, four answers, a zero-based `correct` answer index, and a feedback fact. Keep this data shape in sync with the quiz rendering and scoring.
- Use the existing DOM IDs and answer state classes (`is-correct`, `is-wrong`) when connecting behavior and styles. Update dynamic text through `textContent`.
- Preserve the existing accessibility patterns: group answers under the question, announce feedback through the live status, and move focus as the quiz advances or changes screens.
- Keep visual changes within the existing CSS custom-property theme, responsive rules, and reduced-motion handling.
