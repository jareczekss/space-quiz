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
    this.disabled = false;
    this.hidden = false;
    this._textContent = "";
    this._className = "";
    this.classList = {
      add: (...classNames) => {
        const names = new Set(this._className.split(/\s+/).filter(Boolean));
        classNames.forEach((className) => names.add(className));
        this._className = [...names].join(" ");
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
    this.children.push(...elements);
  }

  replaceChildren(...elements) {
    this._textContent = "";
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
    if (selector === "button") {
      return this.children.filter((child) => child.tagName === "BUTTON");
    }
    return [];
  }
}

function createQuiz() {
  const ids = [
    "question",
    "question-count",
    "question-kicker",
    "answers",
    "feedback",
    "score",
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
    "back-to-results-button",
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

  Object.values(elements).forEach((element) => {
    element.ownerDocument = document;
  });
  elements.score.textContent = "0";
  elements.results.hidden = true;
  elements["review-screen"].hidden = true;

  const scriptPath = path.join(__dirname, "..", "script.js");
  const script = fs.readFileSync(scriptPath, "utf8");
  vm.runInNewContext(script, { document });

  return elements;
}

function answerCurrentQuestion(elements, answerIndex) {
  elements.answers.querySelectorAll("button")[answerIndex].click();
}

function advance(elements) {
  elements["next-button"].click();
}

test("renders the first question and its four answer buttons", () => {
  const elements = createQuiz();

  assert.equal(elements.question.textContent, "Which planet is home to the largest volcano in our solar system?");
  assert.equal(elements["question-count"].textContent, "Question 1 of 10");
  assert.equal(elements.answers.querySelectorAll("button").length, 4);
  assert.equal(elements["next-button"].hidden, true);
});

test("scores correct answers, displays feedback, and locks answers", () => {
  const elements = createQuiz();

  answerCurrentQuestion(elements, 1);

  assert.equal(elements.score.textContent, "1");
  assert.match(elements.feedback.textContent, /^Correct!/);
  assert.ok(elements.answers.querySelectorAll("button").every((button) => button.disabled));
  assert.equal(elements["next-button"].hidden, false);
  assert.equal(elements["next-button"].textContent, "Next question");
});

test("reports an incorrect answer and advances to the next question", () => {
  const elements = createQuiz();

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
  assert.equal(elements["review-title"].ownerDocument.focusedElement, elements["review-title"]);
});

test("returns from review to results and restart clears quiz state", () => {
  const elements = createQuiz();

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
