
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

    const questionElement = document.querySelector("#question");
    const questionCountElement = document.querySelector("#question-count");
    const questionKickerElement = document.querySelector("#question-kicker");
    const answersElement = document.querySelector("#answers");
    const feedbackElement = document.querySelector("#feedback");
    const scoreElement = document.querySelector("#score");
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
    const backToResultsButton = document.querySelector("#back-to-results-button");
    const reviewRestartButton = document.querySelector("#review-restart-button");

    let questionIndex = 0;
    let score = 0;
    let selectedAnswers = Array(questions.length).fill(null);

    function renderQuestion() {
      const current = questions[questionIndex];
      const completed = questionIndex;
      const percent = Math.round((completed / questions.length) * 100);

      questionKickerElement.textContent = current.category;
      questionElement.textContent = current.prompt;
      questionCountElement.textContent = `Question ${questionIndex + 1} of ${questions.length}`;
      progressLabel.textContent = `${percent}% complete`;
      progressTrack.setAttribute("aria-valuenow", String(completed));
      progressTrack.setAttribute("aria-valuetext", `${completed} of ${questions.length} questions answered`);
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

      questions.forEach((question, index) => {
        const listItem = document.createElement("li");
        listItem.className = "review-item";

        const questionLabel = document.createElement("p");
        questionLabel.className = "review-question";
        questionLabel.textContent = `Question ${index + 1}`;

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

        const status = document.createElement("span");
        const isCorrect = chosenIndex === question.correct;
        status.className = `review-status ${isCorrect ? "is-correct" : "is-wrong"}`;
        status.textContent = isCorrect ? "Correct" : "Incorrect";

        answerRow.append(yourAnswer, correctAnswer);
        listItem.append(questionLabel, prompt, status, answerRow);
        reviewList.append(listItem);
      });
    }

    function chooseAnswer(selectedIndex) {
      const current = questions[questionIndex];
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

      nextButton.textContent = questionIndex === questions.length - 1 ? "See my results" : "Next question";
      nextButton.hidden = false;
      nextButton.focus();
    }

    function showReview() {
      quizContent.hidden = true;
      resultsElement.hidden = true;
      reviewScreen.hidden = false;
      renderReview();
      document.querySelector("#review-title").focus();
    }

    function showResults() {
      const percentage = Math.round((score / questions.length) * 100);
      quizContent.hidden = true;
      reviewScreen.hidden = true;
      progressTrack.setAttribute("aria-valuenow", String(questions.length));
      progressTrack.setAttribute("aria-valuetext", `${questions.length} of ${questions.length} questions answered`);
      progressFill.style.width = "100%";
      progressLabel.textContent = "100% complete";
      questionCountElement.textContent = "Mission complete";
      resultScoreElement.textContent = `${score} / ${questions.length}`;

      if (score === questions.length) {
        resultMessageElement.textContent = `Stellar work! You scored ${percentage}% and know your way around the cosmos.`;
      } else if (score >= 7) {
        resultMessageElement.textContent = `Excellent exploring. You scored ${percentage}% and have a great handle on the cosmos.`;
      } else if (score >= 4) {
        resultMessageElement.textContent = `Nice discoveries. You scored ${percentage}%. There's always more universe to explore.`;
      } else {
        resultMessageElement.textContent = `You scored ${percentage}%. Every great explorer starts with a first mission.`;
      }

      resultsElement.hidden = false;
      restartButton.focus();
    }

    function resetQuiz() {
      questionIndex = 0;
      score = 0;
      selectedAnswers = Array(questions.length).fill(null);
      scoreElement.textContent = "0";
      resultsElement.hidden = true;
      reviewScreen.hidden = true;
      quizContent.hidden = false;
      renderQuestion();
      questionElement.focus();
    }

    nextButton.addEventListener("click", () => {
      if (questionIndex === questions.length - 1) {
        showResults();
        return;
      }
      questionIndex += 1;
      renderQuestion();
      questionElement.focus();
    });

    reviewButton.addEventListener("click", showReview);

    backToResultsButton.addEventListener("click", () => {
      reviewScreen.hidden = true;
      resultsElement.hidden = false;
      restartButton.focus();
    });

    restartButton.addEventListener("click", resetQuiz);
    reviewRestartButton.addEventListener("click", resetQuiz);

    renderQuestion();
  