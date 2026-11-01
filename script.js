
    const questions = [
      {
        category: "Navigation systems",
        prompt: "Which planet is home to the largest volcano in our solar system?",
        answers: ["Venus", "Mars", "Jupiter", "Mercury"],
        correct: 1,
        fact: "Olympus Mons on Mars is nearly 22 km (13.6 miles) high."
      },
      {
        category: "Moon missions",
        prompt: "What was the name of the first crewed mission to land on the Moon?",
        answers: ["Apollo 8", "Gemini 4", "Apollo 11", "Luna 9"],
        correct: 2,
        fact: "Apollo 11 landed Neil Armstrong and Buzz Aldrin on the Moon in July 1969."
      },
      {
        category: "Stellar science",
        prompt: "What is the closest star to Earth, other than the Sun?",
        answers: ["Sirius", "Proxima Centauri", "Betelgeuse", "Vega"],
        correct: 1,
        fact: "Proxima Centauri is about 4.24 light-years away."
      },
      {
        category: "Planetary geology",
        prompt: "Which planet has a day that lasts longer than its year?",
        answers: ["Saturn", "Venus", "Neptune", "Mars"],
        correct: 1,
        fact: "Venus rotates so slowly that one spin takes longer than one trip around the Sun."
      },
      {
        category: "Robotic explorers",
        prompt: "Which spacecraft became the first to travel through interstellar space?",
        answers: ["Voyager 1", "Pioneer 10", "New Horizons", "Cassini"],
        correct: 0,
        fact: "Voyager 1 crossed the heliopause in 2012, entering interstellar space."
      },
      {
        category: "Cosmic neighbors",
        prompt: "What is the name of the galaxy that is on a collision course with the Milky Way?",
        answers: ["Whirlpool Galaxy", "Sombrero Galaxy", "Andromeda Galaxy", "Triangulum Galaxy"],
        correct: 2,
        fact: "The Andromeda Galaxy and Milky Way are expected to merge billions of years from now."
      },
      {
        category: "Life in orbit",
        prompt: "What keeps the International Space Station in orbit around Earth?",
        answers: ["Earth's gravity and its forward motion", "Magnetic fields from the poles", "Constant thrust from its engines", "The Moon's gravity alone"],
        correct: 0,
        fact: "The station is continually falling toward Earth, but its sideways speed keeps it in orbit."
      },
      {
        category: "Exoplanet search",
        prompt: "How do astronomers often detect an exoplanet using the transit method?",
        answers: ["They listen for radio messages", "They spot a tiny dip in a star's brightness", "They measure its ocean tides", "They watch it emit visible light"],
        correct: 1,
        fact: "A planet passing in front of its star blocks a small, measurable amount of starlight."
      },
      {
        category: "Space telescopes",
        prompt: "The James Webb Space Telescope primarily observes the universe in which kind of light?",
        answers: ["Infrared", "X-ray", "Radio", "Ultraviolet"],
        correct: 0,
        fact: "Webb's infrared vision helps reveal cool, distant, and dust-obscured objects."
      },
      {
        category: "The outer planets",
        prompt: "Which planet has the most extensive ring system?",
        answers: ["Uranus", "Neptune", "Jupiter", "Saturn"],
        correct: 3,
        fact: "Saturn's rings stretch hundreds of thousands of kilometers, though they are remarkably thin."
      }
    ];

    const categoryScreen = document.querySelector("#category-screen");
    const categoryTitle = document.querySelector("#category-title");
    const categoryOptions = document.querySelector("#category-options");
    const categoryFeedback = document.querySelector("#category-feedback");
    const selectAllCategoriesButton = document.querySelector("#select-all-categories");
    const clearCategoriesButton = document.querySelector("#clear-categories");
    const startButton = document.querySelector("#start-button");
    const questionElement = document.querySelector("#question");
    const questionCountElement = document.querySelector("#question-count");
    const questionKickerElement = document.querySelector("#question-kicker");
    const answersElement = document.querySelector("#answers");
    const feedbackElement = document.querySelector("#feedback");
    const scoreElement = document.querySelector("#score");
    const totalCountElement = document.querySelector("#total-count");
    const bestScoreElement = document.querySelector("#best-score");
    const progressWrap = document.querySelector("#progress-wrap");
    const progressTrack = document.querySelector("#progress-track");
    const progressFill = document.querySelector("#progress-fill");
    const progressLabel = document.querySelector("#progress-label");
    const nextButton = document.querySelector("#next-button");
    const quizContent = document.querySelector("#quiz-content");
    const resultsElement = document.querySelector("#results");
    const reviewScreen = document.querySelector("#review-screen");
    const reviewList = document.querySelector("#review-list");
    const resultScoreElement = document.querySelector("#result-score");
    const resultMessageElement = document.querySelector("#result-message");
    const reviewButton = document.querySelector("#review-button");
    const restartButton = document.querySelector("#restart-button");
    const changeCategoriesButton = document.querySelector("#change-categories-button");
    const backToResultsButton = document.querySelector("#back-to-results-button");
    const reviewChangeCategoriesButton = document.querySelector("#review-change-categories-button");
    const reviewRestartButton = document.querySelector("#review-restart-button");

    const bestScoreStorageKey = "orbit-academy-best-score";
    const categoryNames = [...new Set(questions.map((question) => question.category))];
    let activeQuestions = [];
    let selectedCategoryNames = [...categoryNames];
    let questionIndex = 0;
    let score = 0;
    let selectedAnswers = [];
    let bestScore = null;

    function renderBestScore() {
      bestScoreElement.textContent = bestScore
        ? `Best: ${bestScore.score} / ${bestScore.total}`
        : "Best: not set";
    }

    function loadBestScore() {
      try {
        const savedBestScore = window.localStorage.getItem(bestScoreStorageKey);
        if (savedBestScore === null) {
          renderBestScore();
          return;
        }

        const parsedBestScore = JSON.parse(savedBestScore);
        if (
          !parsedBestScore ||
          !Number.isInteger(parsedBestScore.score) ||
          !Number.isInteger(parsedBestScore.total) ||
          parsedBestScore.total < 1 ||
          parsedBestScore.score < 0 ||
          parsedBestScore.score > parsedBestScore.total
        ) {
          throw new Error("Saved best score has an invalid format.");
        }

        bestScore = parsedBestScore;
        renderBestScore();
      } catch (error) {
        bestScoreElement.textContent = "Best score unavailable";
        console.error("Could not load the saved best score.", error);
      }
    }

    function saveBestScore() {
      if (bestScore && score * bestScore.total <= bestScore.score * activeQuestions.length) {
        renderBestScore();
        return;
      }

      const newBestScore = { score, total: activeQuestions.length };
      try {
        window.localStorage.setItem(bestScoreStorageKey, JSON.stringify(newBestScore));
        bestScore = newBestScore;
        renderBestScore();
      } catch (error) {
        bestScoreElement.textContent = "Best score could not be saved";
        console.error("Could not save the best score.", error);
      }
    }

    function updateCategorySelection() {
      const selectedInputs = categoryOptions.querySelectorAll("input");
      selectedCategoryNames = selectedInputs
        .filter((input) => input.checked)
        .map((input) => input.value);
      startButton.disabled = selectedCategoryNames.length === 0;
      categoryFeedback.textContent = selectedCategoryNames.length === 0
        ? "Choose at least one category to start."
        : `${selectedCategoryNames.length} ${selectedCategoryNames.length === 1 ? "category" : "categories"} selected.`;
    }

    function renderCategoryOptions() {
      categoryOptions.replaceChildren();

      categoryNames.forEach((category) => {
        const label = document.createElement("label");
        label.className = "category-option is-selected";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "category-checkbox";
        checkbox.name = "category";
        checkbox.value = category;
        checkbox.checked = true;
        checkbox.addEventListener("change", () => {
          label.classList.toggle("is-selected", checkbox.checked);
          updateCategorySelection();
        });

        const text = document.createElement("span");
        text.textContent = category;
        label.append(checkbox, text);
        categoryOptions.append(label);
      });

      updateCategorySelection();
    }

    function shuffle(items) {
      const shuffled = [...items];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
      return shuffled;
    }

    function createQuizQuestions(categories) {
      const selectedQuestions = questions.filter((question) => categories.includes(question.category));
      return shuffle(selectedQuestions).map((question) => {
        const answerOrder = shuffle(question.answers.map((_, index) => index));
        return {
          ...question,
          answers: answerOrder.map((index) => question.answers[index]),
          correct: answerOrder.indexOf(question.correct)
        };
      });
    }

    function renderQuestion() {
      const current = activeQuestions[questionIndex];
      const completed = questionIndex;
      const total = activeQuestions.length;
      const percent = Math.round((completed / total) * 100);

      questionKickerElement.textContent = current.category;
      questionElement.textContent = current.prompt;
      questionCountElement.textContent = `Question ${questionIndex + 1} of ${total}`;
      totalCountElement.textContent = String(total);
      progressTrack.setAttribute("aria-valuemax", String(total));
      progressLabel.textContent = `${percent}% complete`;
      progressTrack.setAttribute("aria-valuenow", String(completed));
      progressTrack.setAttribute("aria-valuetext", `${completed} of ${total} questions answered`);
      progressFill.style.width = `${percent}%`;
      feedbackElement.textContent = "";
      feedbackElement.className = "feedback";
      nextButton.hidden = true;
      answersElement.replaceChildren();

      current.answers.forEach((answer, answerIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer";
        button.setAttribute("aria-label", `${String.fromCharCode(65 + answerIndex)}: ${answer}`);

        const letter = document.createElement("span");
        letter.className = "answer-letter";
        letter.setAttribute("aria-hidden", "true");
        letter.textContent = String.fromCharCode(65 + answerIndex);

        const text = document.createElement("span");
        text.className = "answer-text";
        text.textContent = answer;

        button.append(letter, text);
        button.addEventListener("click", () => chooseAnswer(answerIndex));
        answersElement.append(button);
      });
    }

    function renderReview() {
      reviewList.replaceChildren();

      activeQuestions.forEach((question, index) => {
        const listItem = document.createElement("li");
        listItem.className = "review-item";

        const questionLabel = document.createElement("p");
        questionLabel.className = "review-question";
        questionLabel.textContent = `Question ${index + 1} · ${question.category}`;

        const prompt = document.createElement("h3");
        prompt.className = "review-prompt";
        prompt.textContent = question.prompt;

        const answerRow = document.createElement("div");
        answerRow.className = "review-answer-row";

        const yourAnswer = document.createElement("p");
        const chosenIndex = selectedAnswers[index];
        const chosenAnswer = chosenIndex === null || chosenIndex === undefined ? "No answer selected" : question.answers[chosenIndex];
        yourAnswer.textContent = `Your answer: ${chosenAnswer}`;

        const correctAnswer = document.createElement("p");
        correctAnswer.textContent = `Correct answer: ${question.answers[question.correct]}`;

        const fact = document.createElement("p");
        fact.textContent = question.fact;

        const status = document.createElement("span");
        const isCorrect = chosenIndex === question.correct;
        status.className = `review-status ${isCorrect ? "is-correct" : "is-wrong"}`;
        status.textContent = isCorrect ? "Correct" : "Incorrect";

        answerRow.append(yourAnswer, correctAnswer, fact);
        listItem.append(questionLabel, prompt, status, answerRow);
        reviewList.append(listItem);
      });
    }

    function chooseAnswer(selectedIndex) {
      const current = activeQuestions[questionIndex];
      const answerButtons = [...answersElement.querySelectorAll("button")];
      const isCorrect = selectedIndex === current.correct;

      selectedAnswers[questionIndex] = selectedIndex;

      answerButtons.forEach((button, index) => {
        button.disabled = true;
        if (index === current.correct) button.classList.add("is-correct");
        if (index === selectedIndex && !isCorrect) button.classList.add("is-wrong");
      });

      if (isCorrect) {
        score += 1;
        scoreElement.textContent = String(score);
        feedbackElement.textContent = `Correct! ${current.fact}`;
        feedbackElement.classList.add("good");
      } else {
        feedbackElement.textContent = `Not quite. ${current.fact}`;
        feedbackElement.classList.add("bad");
      }

      nextButton.textContent = questionIndex === activeQuestions.length - 1 ? "See my results" : "Next question";
      nextButton.hidden = false;
      nextButton.focus();
    }

    function showCategorySelection() {
      quizContent.hidden = true;
      resultsElement.hidden = true;
      reviewScreen.hidden = true;
      categoryScreen.hidden = false;
      progressWrap.hidden = true;
      updateCategorySelection();
      categoryTitle.focus();
    }

    function startQuiz(categories = selectedCategoryNames) {
      if (categories.length === 0) {
        categoryFeedback.textContent = "Choose at least one category to start.";
        startButton.disabled = true;
        categoryTitle.focus();
        return;
      }

      selectedCategoryNames = [...categories];
      activeQuestions = createQuizQuestions(selectedCategoryNames);
      selectedAnswers = Array(activeQuestions.length).fill(null);
      questionIndex = 0;
      score = 0;
      scoreElement.textContent = "0";
      totalCountElement.textContent = String(activeQuestions.length);
      progressTrack.setAttribute("aria-valuemax", String(activeQuestions.length));
      categoryScreen.hidden = true;
      resultsElement.hidden = true;
      reviewScreen.hidden = true;
      progressWrap.hidden = false;
      quizContent.hidden = false;
      renderQuestion();
      questionElement.focus();
    }

    function showReview() {
      quizContent.hidden = true;
      resultsElement.hidden = true;
      reviewScreen.hidden = false;
      renderReview();
      document.querySelector("#review-title").focus();
    }

    function showResults() {
      const total = activeQuestions.length;
      const percentage = Math.round((score / total) * 100);
      quizContent.hidden = true;
      reviewScreen.hidden = true;
      progressTrack.setAttribute("aria-valuenow", String(total));
      progressTrack.setAttribute("aria-valuetext", `${total} of ${total} questions answered`);
      progressFill.style.width = "100%";
      progressLabel.textContent = "100% complete";
      questionCountElement.textContent = "Mission complete";
      resultScoreElement.textContent = `${score} / ${total}`;
      saveBestScore();

      if (score === total) {
        resultMessageElement.textContent = `Stellar work! You scored ${percentage}% and know your way around the cosmos.`;
      } else if (percentage >= 70) {
        resultMessageElement.textContent = `Excellent exploring. You scored ${percentage}% and have a great handle on the cosmos.`;
      } else if (percentage >= 40) {
        resultMessageElement.textContent = `Nice discoveries. You scored ${percentage}%. There's always more universe to explore.`;
      } else {
        resultMessageElement.textContent = `You scored ${percentage}%. Every great explorer starts with a first mission.`;
      }

      resultsElement.hidden = false;
      restartButton.focus();
    }

    function changeCategories() {
      categoryOptions.querySelectorAll("input").forEach((input) => {
        input.checked = selectedCategoryNames.includes(input.value);
      });
      showCategorySelection();
    }

    nextButton.addEventListener("click", () => {
      if (questionIndex === activeQuestions.length - 1) {
        showResults();
        return;
      }
      questionIndex += 1;
      renderQuestion();
      questionElement.focus();
    });

    selectAllCategoriesButton.addEventListener("click", () => {
      categoryOptions.querySelectorAll("input").forEach((input) => {
        input.checked = true;
        input.parentElement.classList.add("is-selected");
      });
      updateCategorySelection();
    });

    clearCategoriesButton.addEventListener("click", () => {
      categoryOptions.querySelectorAll("input").forEach((input) => {
        input.checked = false;
        input.parentElement.classList.remove("is-selected");
      });
      updateCategorySelection();
    });

    startButton.addEventListener("click", () => startQuiz());
    reviewButton.addEventListener("click", showReview);
    backToResultsButton.addEventListener("click", () => {
      reviewScreen.hidden = true;
      resultsElement.hidden = false;
      restartButton.focus();
    });
    changeCategoriesButton.addEventListener("click", changeCategories);
    reviewChangeCategoriesButton.addEventListener("click", changeCategories);
    restartButton.addEventListener("click", () => startQuiz());
    reviewRestartButton.addEventListener("click", () => startQuiz());

    renderCategoryOptions();
    loadBestScore();
  