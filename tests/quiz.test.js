const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class TestElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.style = {};
    this.parentElement = null;
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this._textContent = "";
    this._className = "";
    this.classList = {
      add: (...classNames) => {
        const names = new Set(this._className.split(/\s+/).filter(Boolean));
        classNames.forEach((className) => names.add(className));
        this._className = [...names].join(" ");
      },
      remove: (...classNames) => {
        const names = this._className.split(/\s+/).filter((className) => !classNames.includes(className));
        this._className = names.join(" ");
      },
      toggle: (className, force) => {
        const hasClass = this._className.split(/\s+/).includes(className);
        const shouldAdd = force === undefined ? !hasClass : force;
        if (shouldAdd) this.classList.add(className);
        else this.classList.remove(className);
        return shouldAdd;
      }
    };
  }

  set className(value) {
    this._className = value;
  }

  get className() {
    return this._className;
  }

  set textContent(value) {
    this._textContent = String(value);
    this.children = [];
  }

  get textContent() {
    return this._textContent + this.children.map((child) => child.textContent).join("");
  }

  append(...elements) {
    elements.forEach((element) => {
      element.parentElement = this;
    });
    this.children.push(...elements);
  }

  replaceChildren(...elements) {
    this._textContent = "";
    elements.forEach((element) => {
      element.parentElement = this;
    });
    this.children = elements;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  click() {
    this.listeners.click?.();
  }

  focus() {
    this.ownerDocument.focusedElement = this;
  }

  querySelectorAll(selector) {
    const tagName = selector.toUpperCase();
    const matches = [];
    const visit = (element) => {
      element.children.forEach((child) => {
        if (child.tagName === tagName) matches.push(child);
        visit(child);
      });
    };
    visit(this);
    return matches;
  }
}

function createQuiz({ random = 0.999999, storage = new Map() } = {}) {
  const ids = [
    "category-screen",
    "category-title",
    "category-options",
    "category-feedback",
    "select-all-categories",
    "clear-categories",
    "start-button",
    "question",
    "question-count",
    "question-kicker",
    "answers",
    "feedback",
    "score",
    "total-count",
    "best-score",
    "progress-wrap",
    "progress-track",
    "progress-fill",
    "progress-label",
    "next-button",
    "quiz-content",
    "results",
    "review-screen",
    "review-list",
    "result-score",
    "result-message",
    "review-button",
    "restart-button",
    "change-categories-button",
    "back-to-results-button",
    "review-change-categories-button",
    "review-restart-button",
    "review-title"
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, new TestElement()]));
  const document = {
    focusedElement: null,
    querySelector(selector) {
      return elements[selector.slice(1)];
    },
    createElement(tagName) {
      const element = new TestElement(tagName);
      element.ownerDocument = document;
      return element;
    }
  };
  const localStorage = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, value);
    }
  };

  Object.values(elements).forEach((element) => {
    element.ownerDocument = document;
  });
  elements.score.textContent = "0";
  elements["quiz-content"].hidden = true;
  elements.results.hidden = true;
  elements["review-screen"].hidden = true;
  elements["progress-wrap"].hidden = true;

  const scriptPath = path.join(__dirname, "..", "script.js");
  const script = fs.readFileSync(scriptPath, "utf8");
  const math = Object.create(Math);
  math.random = () => random;
  vm.runInNewContext(script, { document, window: { localStorage }, Math: math, console });

  return elements;
}

function startQuiz(elements) {
  elements["start-button"].click();
}

function selectCategories(elements, selectedNames) {
  elements["category-options"].querySelectorAll("input").forEach((input) => {
    input.checked = selectedNames.includes(input.value);
    input.listeners.change?.();
  });
}

function answerCurrentQuestion(elements, answerIndex) {
  elements.answers.querySelectorAll("button")[answerIndex].click();
}

function advance(elements) {
  elements["next-button"].click();
}

test("renders selectable categories before the quiz and starts with all questions", () => {
  const elements = createQuiz();

  assert.equal(elements["category-options"].querySelectorAll("input").length, 10);
  assert.ok(elements["category-options"].querySelectorAll("input").every((input) => input.checked));
  assert.equal(elements["quiz-content"].hidden, true);

  startQuiz(elements);

  assert.equal(elements.question.textContent, "Which planet is home to the largest volcano in our solar system?");
  assert.equal(elements["question-count"].textContent, "Question 1 of 10");
  assert.equal(elements.answers.querySelectorAll("button").length, 4);
  assert.equal(elements["progress-wrap"].hidden, false);
  assert.equal(elements["next-button"].hidden, true);
});

test("scores correct answers, displays feedback, and locks answers", () => {
  const elements = createQuiz();

  startQuiz(elements);
  answerCurrentQuestion(elements, 1);

  assert.equal(elements.score.textContent, "1");
  assert.match(elements.feedback.textContent, /^Correct!/);
  assert.ok(elements.answers.querySelectorAll("button").every((button) => button.disabled));
  assert.equal(elements["next-button"].hidden, false);
  assert.equal(elements["next-button"].textContent, "Next question");
});

test("reports an incorrect answer and advances to the next question", () => {
  const elements = createQuiz();

  startQuiz(elements);
  answerCurrentQuestion(elements, 0);

  assert.equal(elements.score.textContent, "0");
  assert.match(elements.feedback.textContent, /^Not quite\./);
  assert.ok(elements.answers.querySelectorAll("button")[0].className.includes("is-wrong"));
  assert.ok(elements.answers.querySelectorAll("button")[1].className.includes("is-correct"));

  advance(elements);

  assert.equal(elements.question.textContent, "What was the name of the first crewed mission to land on the Moon?");
  assert.equal(elements["question-count"].textContent, "Question 2 of 10");
  assert.equal(elements["next-button"].hidden, true);
  assert.equal(elements.question.ownerDocument.focusedElement, elements.question);
});

test("shows final results and reviews each selected answer", () => {
  const elements = createQuiz();

  startQuiz(elements);
  for (let questionIndex = 0; questionIndex < 10; questionIndex += 1) {
    const answerIndex = questionIndex === 0 ? 0 : [2, 0, 1, 0, 2, 0, 1, 0, 3][questionIndex - 1];
    answerCurrentQuestion(elements, answerIndex);
    advance(elements);
  }

  assert.equal(elements.results.hidden, false);
  assert.equal(elements["quiz-content"].hidden, true);
  assert.equal(elements["result-score"].textContent, "8 / 10");

  elements["review-button"].click();

  assert.equal(elements["review-screen"].hidden, false);
  assert.equal(elements.results.hidden, true);
  assert.equal(elements["review-list"].children.length, 10);
  assert.match(elements["review-list"].children[0].textContent, /Your answer: Venus/);
  assert.match(elements["review-list"].children[0].textContent, /Correct answer: Mars/);
  assert.match(elements["review-list"].children[0].textContent, /Incorrect/);
  assert.equal(elements["review-list"].children[1].querySelectorAll("button").length, 0);
  assert.match(elements["review-list"].children[0].textContent, /Olympus Mons/);
  assert.equal(elements["review-title"].ownerDocument.focusedElement, elements["review-title"]);
});

test("returns from review to results and restart clears quiz state", () => {
  const elements = createQuiz();

  startQuiz(elements);
  for (let questionIndex = 0; questionIndex < 10; questionIndex += 1) {
    answerCurrentQuestion(elements, 0);
    advance(elements);
  }
  elements["review-button"].click();
  elements["back-to-results-button"].click();

  assert.equal(elements["review-screen"].hidden, true);
  assert.equal(elements.results.hidden, false);
  assert.equal(elements["restart-button"].ownerDocument.focusedElement, elements["restart-button"]);

  elements["restart-button"].click();

  assert.equal(elements.results.hidden, true);
  assert.equal(elements["review-screen"].hidden, true);
  assert.equal(elements["quiz-content"].hidden, false);
  assert.equal(elements.score.textContent, "0");
  assert.equal(elements["question-count"].textContent, "Question 1 of 10");
  assert.equal(elements["review-list"].children.length, 10);
  assert.equal(elements.question.ownerDocument.focusedElement, elements.question);
});

test("requires at least one category and limits the quiz to selected categories", () => {
  const elements = createQuiz();

  elements["clear-categories"].click();
  assert.equal(elements["start-button"].disabled, true);
  assert.match(elements["category-feedback"].textContent, /at least one category/);

  selectCategories(elements, ["Stellar science"]);
  assert.equal(elements["start-button"].disabled, false);
  startQuiz(elements);

  assert.equal(elements.question.textContent, "What is the closest star to Earth, other than the Sun?");
  assert.equal(elements["question-count"].textContent, "Question 1 of 1");
  assert.equal(elements["total-count"].textContent, "1");
});

test("shuffles question and answer order without losing correct-answer scoring", () => {
  const elements = createQuiz({ random: 0 });

  startQuiz(elements);
  assert.equal(elements.question.textContent, "What was the name of the first crewed mission to land on the Moon?");

  const answerButtons = elements.answers.querySelectorAll("button");
  const correctAnswer = answerButtons.find((button) => button.textContent.includes("Apollo 11"));
  assert.ok(correctAnswer);
  correctAnswer.click();

  assert.equal(elements.score.textContent, "1");
  assert.ok(correctAnswer.className.includes("is-correct"));
});

test("saves a persistent best score and only replaces it with a better percentage", () => {
  const storage = new Map();
  const firstQuiz = createQuiz({ storage });

  startQuiz(firstQuiz);
  const correctAnswers = [1, 2, 1, 1, 0, 2, 0, 1, 0, 3];
  for (let questionIndex = 0; questionIndex < 10; questionIndex += 1) {
    answerCurrentQuestion(firstQuiz, correctAnswers[questionIndex]);
    advance(firstQuiz);
  }
  assert.equal(firstQuiz["result-score"].textContent, "10 / 10");
  assert.equal(firstQuiz["best-score"].textContent, "Best: 10 / 10");

  const secondQuiz = createQuiz({ storage });
  assert.equal(secondQuiz["best-score"].textContent, "Best: 10 / 10");
  selectCategories(secondQuiz, ["Stellar science"]);
  startQuiz(secondQuiz);
  answerCurrentQuestion(secondQuiz, 0);
  advance(secondQuiz);

  assert.equal(secondQuiz["result-score"].textContent, "0 / 1");
  assert.equal(secondQuiz["best-score"].textContent, "Best: 10 / 10");
});

test("updates a best score when a later category quiz has a higher percentage", () => {
  const storage = new Map([
    ["orbit-academy-best-score", JSON.stringify({ score: 5, total: 10 })]
  ]);
  const elements = createQuiz({ storage });

  selectCategories(elements, ["Stellar science"]);
  startQuiz(elements);
  answerCurrentQuestion(elements, 1);
  advance(elements);

  assert.equal(elements["best-score"].textContent, "Best: 1 / 1");
  assert.deepEqual(JSON.parse(storage.get("orbit-academy-best-score")), { score: 1, total: 1 });
});
