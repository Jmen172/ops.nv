const stdCode = sessionStorage.getItem("std_code");
const namespace = stdCode ? stdCode + "::" : "";
if (!stdCode) {
  alert("Anda belum login. Silakan login terlebih dahulu.");
  window.location.href = "../index.html";
}

// Ambil data peserta dari localStorage
const vieraData = JSON.parse(localStorage.getItem("vieraData::" + stdCode));
if (!vieraData || !vieraData.std_name) {
  alert("Data peserta tidak ditemukan. Silakan login ulang.");
  window.location.href = "../index.html";
}

// ---------------- GLOBAL TIMER -----------------
const TOTAL_TIME = 5 * 60; // 5 minutes
let remainingTime = parseInt(localStorage.getItem(namespace + "remainingTime")) || TOTAL_TIME;
let timerInterval;

function startGlobalTimer() {
  if (localStorage.getItem(namespace + "examExpired") === "true") {
    window.location.href = "submit.html";
    return;
  }

  updateTimerDisplay(remainingTime);

  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay(remainingTime);
    localStorage.setItem(namespace + "remainingTime", remainingTime);

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      localStorage.removeItem(namespace + "remainingTime");
      localStorage.setItem(namespace + "examExpired", "true");
      alert("⏰ Waktu habis! Mengirim hasil ujian...");
      window.location.href = "submit.html";
    }
  }, 1000);
}

function updateTimerDisplay(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const timerElement = document.getElementById("global-timer");
  if (timerElement) {
    timerElement.textContent = `${minutes}:${secs}`;
  }
}

let currentQuestion = parseInt(localStorage.getItem(namespace + "currentQuestion")) || 0;
document.addEventListener("DOMContentLoaded", function () {
  startGlobalTimer();
  let testData = [];
  let timer;
  let audioElement = new Audio();

  // 🔥 Set 3 soal dalam satu tampilan
  const threeQuestionSets = [
    ["q18", "q19", "q20"],
    ["q21", "q22", "q23"],
    ["q24", "q25", "q26"],
    ["q27", "q28", "q29"],
    ["q30", "q31", "q32"],
    ["q33", "q34", "q35"],
    ["q36", "q37", "q38"],
    ["q39", "q40", "q41"],
    ["q42", "q43", "q44"],
    ["q45", "q46", "q47"],
    ["q48", "q49", "q50"],
  ];

  fetch("../js/test.json")
    .then((response) => response.json())
    .then((data) => {
      testData = data;
      loadQuestion(currentQuestion);
      window.testData = testData;
      window.loadQuestion = loadQuestion;
    })
    .catch((error) => console.error("Gagal memuat soal:", error));

  function loadQuestion(index) {
    if (index >= testData.length) {
      window.location.href = "submit.html";
      return;
    }

    clearTimeout(timer);

    let questionData = testData[index];

    if (questionData.type === "direction") {
      showDirection(questionData.id, questionData.audio);
      return;
    }

    showQuestion(questionData);
  }

  function showDirection(directionId, audioPath) {
    let body = document.body;
    let mainContent = document.querySelector(".main-content");

    let directionMapping = {
      d00: { image: "../assets/image/direction-000.png", hasAudio: false },
      d01: { image: "../assets/image/direction-001.png", hasAudio: false },
      d1: { image: "../assets/image/direction-1.png", hasAudio: true },
      d2: { image: "../assets/image/direction-2.png", hasAudio: true },
      d3: { image: "../assets/image/direction-3.png", hasAudio: true },
      d4: { image: "../assets/image/direction-4.png", hasAudio: true },
      d5: { image: "../assets/image/direction-5.png", hasAudio: false },
      d6: { image: "../assets/image/direction-6.png", hasAudio: false },
      d7: { image: "../assets/image/direction-7.png", hasAudio: false },
    };

    const directionData = directionMapping[directionId];
    if (!directionData) return nextQuestion();

    body.style.backgroundImage = `url('${directionData.image}')`;
    body.style.backgroundSize = "contain";
    body.style.backgroundPosition = "center";
    body.style.backgroundRepeat = "no-repeat";
    mainContent.style.display = "none";

    // 🔁 Untuk d00-d4 (listening) → auto next
    if (
      directionId === "d00" ||
      directionId === "d01" ||
      directionId === "d1" ||
      directionId === "d2" ||
      directionId === "d3" ||
      directionId === "d4"
    ) {
      if (directionData.hasAudio && audioPath) {
        playAudio(audioPath,
          () => {
            resetBackground();
            nextQuestion();
          },
          () => {
            setTimeout(() => {
              resetBackground();
              nextQuestion();
            }, 5000);
          }
        );
      } else {
        setTimeout(() => {
          resetBackground();
          nextQuestion();
        }, 3000);
      }
      return;
    }

    // ✅ Untuk d5, d6, d7 → tampilkan tombol Continue dan Previous
    showContinueButton();
  }

  let currentAudio = null;

  function playAudio(path, onEndedCallback, onErrorCallback) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    const audio = new Audio(path);
    currentAudio = audio;

    audio.load();
    audio.play().catch((e) => {
      console.error("Audio play failed", e);
      if (onErrorCallback) onErrorCallback();
    });

    audio.onended = () => {
      setTimeout(() => {
        if (onEndedCallback) onEndedCallback();
      }, 5000);
    };

    audio.onerror = () => {
      console.error("Audio load error");
      if (onErrorCallback) onErrorCallback();
    };
  }

  function resetBackground() {
    let body = document.body;
    let mainContent = document.querySelector(".main-content");

    body.style.backgroundImage = "url('../assets/image/bg-test.png')";
    mainContent.style.display = "flex";

    let continueButton = document.getElementById("continue-direction");
    if (continueButton) continueButton.remove();
    let directionContainer = document.getElementById(
      "direction-buttons-container"
    );
    if (directionContainer) directionContainer.remove();
  }

  function showContinueButton() {
    let body = document.body;
    let btnContainer = document.getElementById("buttons");
    btnContainer.innerHTML = "";

    if (testData[currentQuestion].type === "reading") {
      // Next button for reading questions; enlarged
      let nextButton = document.createElement("button");
      nextButton.innerText = "Next";
      nextButton.className = "btn btn-primary";
      nextButton.style.padding = "10px 32px"; // enlarged
      nextButton.style.fontSize = "16px"; // enlarged
      nextButton.onclick = nextQuestion;
      btnContainer.appendChild(nextButton);
    }

    // Create a container for the buttons
    let container = document.createElement("div");
    container.id = "direction-buttons-container";
    container.style.position = "fixed";
    container.style.bottom = "62px";
    container.style.left = "45%";
    container.style.transform = "translateX(-50%)";
    container.style.display = "flex";
    container.style.width = "300px";
    container.style.gap = "10px";

    // Center Continue if question id is 'd5', otherwise space-between
    if (testData[currentQuestion].id === "d5") {
      container.style.justifyContent = "center";
    } else {
      container.style.justifyContent = "space-between";
    }

    // Previous button (enlarged) for direction type questions except 'd5'
    if (
      testData[currentQuestion].type === "direction" &&
      testData[currentQuestion].id !== "d5"
    ) {
      let previousButton = document.createElement("button");
      previousButton.innerText = "Previous";
      previousButton.className = "btn btn-secondary";
      previousButton.id = "btn-prev";
      previousButton.style.marginRight = "37px";
      previousButton.style.padding = "5px 13px";
      previousButton.style.fontSize = "10px";
      previousButton.style.fontWeight = "bold";
      previousButton.style.border = "1px solid #ccc";
      previousButton.style.borderRadius = "5px";
      previousButton.style.backgroundColor = "#e9e9e9";
      previousButton.style.color = "#000";
      previousButton.style.cursor = "pointer";
      previousButton.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";
      previousButton.onmouseover = function () {
        previousButton.style.backgroundColor = "#f0f0f0";
      };
      previousButton.onmouseout = function () {
        previousButton.style.backgroundColor = "#e9e9e9";
      };
      previousButton.onclick = function () {
        resetBackground();
        previousQuestion();
      };

      container.appendChild(previousButton);
    }

    // Continue button remains with its original smaller style
    let continueButton = document.createElement("button");
    continueButton.innerText = "Continue";
    continueButton.id = "continue-direction";
    // Hilangkan properti positioning tetap jika d5 agar tombol berada di tengah container
    if (testData[currentQuestion].id === "d5") {
      continueButton.style.bottom = "-11px"; // ganti nilai sesuai kebutuhan untuk d5
    } else {
      continueButton.style.position = "fixed";
      continueButton.style.bottom = "0px";
      continueButton.style.marginLeft = "110px";
    }
    continueButton.style.padding = "5px 13px";
    continueButton.style.fontSize = "10px";
    continueButton.style.fontWeight = "bold";
    continueButton.style.border = "1px solid #ccc";
    continueButton.style.borderRadius = "5px";
    continueButton.style.backgroundColor = "#e9e9e9";
    continueButton.style.color = "#000";
    continueButton.style.cursor = "pointer";
    continueButton.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";
    continueButton.onmouseover = function () {
      continueButton.style.backgroundColor = "#f0f0f0";
    };
    continueButton.onmouseout = function () {
      continueButton.style.backgroundColor = "#e9e9e9";
    };
    continueButton.onclick = resetBackgroundAndContinue;

    container.appendChild(continueButton);
    body.appendChild(container);
  }

  function resetBackgroundAndContinue() {
    resetBackground();
    nextQuestion();
  }

  function showQuestion(questionData) {
    resetBackground();

    const optionsContainer = document.getElementById("options");
    const btnContainer = document.getElementById("buttons");
    const questionText = document.getElementById("question-text");
    const imageElement = document.getElementById("question-image");
    const imageContainer = document.getElementById("question-image-container");

    // 🔥 Reset three-question classes
    imageContainer.classList.remove("active-three-question-image");
    const existingWrapper = document.querySelector(".three-question-layout");
    if (existingWrapper)
      existingWrapper.classList.remove("has-three-question-image");

    questionText.innerText = "";
    optionsContainer.innerHTML = "";
    btnContainer.innerHTML = "";
    imageElement.src = "";
    imageContainer.style.display = "none";

    // ✅ Cek apakah soal ada di dalam 3-set
    const set = threeQuestionSets.find((set) => set.includes(questionData.id));

    if (set) {
      renderCustomThreeLayout(questionData, set);
    } else {
      // 🌟 Default tampilan dengan border
      const questionWrapper = document.createElement("div");
      questionWrapper.className = "single-question-box";

      // Header pertanyaan
      const questionHeader = document.createElement("div");
      questionHeader.className = "question-header";
      questionHeader.innerHTML = `
          <p class="instruction-text"style="border: 2px solid #007bff; background-color: #e0f7ff; padding: 6px; width : 585px; margin-left: -22px; text-indent: 20px;">Choose the correct answer.</p>
          <h3 class="question-title">${questionData.question}</h3>
      `;

      // Container opsi jawaban
      const optionsWrapper = document.createElement("div");
      optionsWrapper.className = "single-options-wrapper";

      // Tambahkan opsi
      questionData.options.forEach((option, i) => {
        const optionId = `option-${i}`;
        const label = document.createElement("label");
        label.className = "option-item d-block";
        label.innerHTML = `
                    <input type="radio" name="answer" value="${option}" id="${optionId}">
                    <span class="option-text">${option}</span>
                `;
        optionsWrapper.appendChild(label);
      });

      // Assembly komponen
      questionWrapper.appendChild(questionHeader);
      questionWrapper.appendChild(optionsWrapper);
      optionsContainer.appendChild(questionWrapper);

      // Tambahkan gambar jika ada
      if (questionData.image) {
        imageElement.src = questionData.image;
        imageContainer.style.display = "block";
      }

      // Load jawaban tersimpan
      const savedAnswer = JSON.parse(localStorage.getItem(namespace + questionData.id));
      if (savedAnswer) {
        const selectedRadio = document.querySelector(
          `input[name="answer"][value="${savedAnswer.answer}"]`
        );
        if (selectedRadio) selectedRadio.checked = true;
      }
    }

    if (questionData.type === "listening") {
      startListeningSession(questionData);
    } else {
      // 🔖 Tambahkan Mark for Review di soal reading
      if (questionData.type === "reading") {
        const btnContainer = document.getElementById("buttons");

        let markLabel = document.createElement("label");
        markLabel.style.marginRight = "20px";
        markLabel.style.display = "inline-flex";
        markLabel.style.alignItems = "center";
        markLabel.style.gap = "8px";

        let markCheckbox = document.createElement("input");
        markCheckbox.type = "checkbox";
        markCheckbox.id = "mark-for-review";

        // Cek status simpanan dari localStorage
        let reviewStatus = localStorage.getItem(namespace + `${questionData.id}-review`);
        if (reviewStatus === "true") {
          markCheckbox.checked = true;
        }

        markCheckbox.addEventListener("change", () => {
          localStorage.setItem(namespace + `${questionData.id}-review`, markCheckbox.checked);
        });

        markLabel.appendChild(markCheckbox);
        markLabel.appendChild(document.createTextNode("Mark for Review"));

        btnContainer.prepend(markLabel);
      }

      updateButtons();
    }
  }

  function renderCustomThreeLayout(currentQuestion, set) {
    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = "";

    // 💡 Wrapper for custom layout
    const questionWrapper = document.createElement("div");
    questionWrapper.className = "three-question-layout";
    questionWrapper.style.display = "flex";
    questionWrapper.style.justifyContent = "space-between";
    questionWrapper.style.gap = "20px";
    questionWrapper.style.width = "100%";

    const imageContainer = document.getElementById("question-image-container");
    const questionImage = document.getElementById("question-image");

    // 🔥 Cache Busting Technique
    const imageKey = Object.keys(currentQuestion).find((key) =>
      key.startsWith("image_three_question_")
    );
    if (imageKey && currentQuestion[imageKey]) {
      // Tambahkan timestamp untuk bypass cache
      const timestamp = new Date().getTime();
      questionImage.src = `${currentQuestion[imageKey]}?t=${timestamp}`;

      // Atur styling via class bukan inline style
      imageContainer.classList.add("active-three-question-image");
      questionWrapper.classList.add("has-three-question-image");
    } else {
      imageContainer.classList.remove("active-three-question-image");
      questionWrapper.classList.remove("has-three-question-image");
      questionImage.src = "";
    }

    // 💡 Loop melalui set soal
    set.forEach((qid) => {
      const isActive = qid === currentQuestion.id;
      const questionData = testData.find((q) => q.id === qid);
      questionWrapper.appendChild(createQuestionBox(questionData, isActive));
    });

    optionsContainer.appendChild(questionWrapper);
  }

  function createQuestionBox(questionData, isActive) {
    const box = document.createElement("div");
    box.classList.add("question-box"); // 💡 Kelas umum untuk semua soal
    if (isActive)
      box.classList.add("active-question"); // 💡 Kelas untuk soal aktif
    else box.classList.add("muted-question"); // 💡 Kelas untuk soal muted

    const isSpecialCase = questionData.id === "q25";
    if (isSpecialCase && isActive) {
      box.style.fontSize = "1.1rem";
    }

    box.style.width = "32%";
    box.style.padding = "20px";
    box.style.border = isActive ? "2px solid #007bff" : "1px solid #ccc";
    box.style.opacity = isActive ? "1" : "0.5";
    box.style.pointerEvents = isActive ? "auto" : "none";
    box.style.margin = "10px 0"; // Tambahkan margin

    const questionHTML = `<p class="instruction-text" style="${isActive
      ? (style =
        "border: 2px solid #007bff; background-color: #e0f7ff; padding: 6px; width: 452px; margin-left: -22px; text-indent: 20px;")
      : ""
      }">Choose the correct answer.</p>
        <p>${questionData.question}</p>`;
    const optionsHTML = questionData.options
      .map((opt) => {
        let cleanedOption = opt;
        cleanedOption = cleanedOption
          .replace(/&nbsp;|\u00A0/g, " ")
          .replace(/\s+/g, " ");

        if (!isActive) {
          const specialSpaceMap = {
            q31: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
            q36: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
            q48: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
            q50: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
          };

          const currentId = questionData.id;
          const customNbsp = specialSpaceMap[currentId];

          if (customNbsp) {
            cleanedOption = opt.replace(/(&nbsp;){2,}/g, customNbsp);
          } else {
            cleanedOption = opt.replace(/(&nbsp;){2,}/g, ""); // default
          }
        }
        if (isActive) {
          return `<label><input type="radio" name="answer" value="${opt}"> ${opt}</label>`;
        } else {
          // Ambil jawaban yang tersimpan
          const savedAnswer = JSON.parse(localStorage.getItem(namespace + questionData.id));
          const isChecked = savedAnswer && savedAnswer.answer === opt;
          return `
            <label style="opacity: 0.6; display: block;">
              <input type="radio" name="answer-muted-${questionData.id
            }" value="${opt}" disabled ${isChecked ? "checked" : ""}>
              ${cleanedOption}
            </label>
          `;
        }
      })
      .join("");

    box.innerHTML = questionHTML + optionsHTML;

    // Cek apakah ada jawaban tersimpan
    if (isActive) {
      let savedAnswer = JSON.parse(localStorage.getItem(namespace + questionData.id));
      if (savedAnswer) {
        let selectedRadio = box.querySelector(
          `input[name="answer"][value="${savedAnswer.answer}"]`
        );
        if (selectedRadio) selectedRadio.checked = true;
      }
    }

    return box;
  }

  function startListeningSession(questionData, status = 0) {
    if (questionData.audio) {
      playAudio(questionData.audio,
        () => {
          saveAutoAnswer(questionData);
          nextQuestion();
        },
        () => {
          saveAutoAnswer(questionData);
          setTimeout(() => nextQuestion(), 5000);
        }
      );
    }

    // 🛠️ Mode Developer: Tampilkan tombol manual Next jika status = 1
    if (status === 1) {
      let existingNextButton = document.getElementById("next-listening-button");
      if (existingNextButton) existingNextButton.remove();

      const nextButton = document.createElement("button");
      nextButton.id = "next-listening-button";
      nextButton.innerText = "⏭️ Dev Next";
      nextButton.style.position = "fixed";
      nextButton.style.bottom = "20px";
      nextButton.style.right = "20px";
      nextButton.style.zIndex = "9999";
      nextButton.style.padding = "10px 20px";
      nextButton.style.fontSize = "14px";
      nextButton.style.backgroundColor = "#007bff";
      nextButton.style.color = "#fff";
      nextButton.style.border = "none";
      nextButton.style.borderRadius = "5px";
      nextButton.style.cursor = "pointer";
      nextButton.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
      nextButton.onclick = function () {
        saveAutoAnswer(questionData);
        nextQuestion();
      };

      document.body.appendChild(nextButton);
    }
  }

  function cleanText(text) {
    return (text || "")
      .replace(/&nbsp;|\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function saveAutoAnswer(questionData) {
    let selectedOption = document.querySelector('input[name="answer"]:checked');
    let selectedAnswer = cleanText(selectedOption?.value || "");
    let correctAnswer = cleanText(questionData.answer || "");
    let score = selectedAnswer === correctAnswer ? questionData.score : 0;

    localStorage.setItem(
      namespace + questionData.id,
      JSON.stringify({ answer: selectedOption?.value || "", score: score })
    );
  }

  function saveAnswer() {
    let selectedOption = document.querySelector('input[name="answer"]:checked');
    if (!selectedOption) {
      return true;
    }

    let questionData = testData[currentQuestion];
    let selectedAnswer = cleanText(selectedOption.value);
    let correctAnswer = cleanText(questionData.answer);
    let score = selectedAnswer === correctAnswer ? questionData.score : 0;

    localStorage.setItem(
      namespace + questionData.id,
      JSON.stringify({ answer: selectedAnswer, score: score })
    );
    return true;
  }

  function nextQuestion() {
    if (testData[currentQuestion].type === "reading" && !saveAnswer()) return;

    // 🔔 Check if current is the last question (e.g., q100)
    const currentId = testData[currentQuestion].id;
    const currentNumber = parseInt(currentId.replace(/[^\d]/g, "")) || 0;

    const isLast = currentNumber === 100 || currentQuestion === testData.length - 1;

    if (isLast) {
      showEndConfirmModal();
      return;
    }

    currentQuestion++;
    localStorage.setItem(namespace + "currentQuestion", currentQuestion);
    loadQuestion(currentQuestion);
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      // Simpan jawaban untuk soal reading sebelum pindah
      if (testData[currentQuestion].type === "reading") {
        saveAnswer();
      }

      currentQuestion--;
      localStorage.setItem(namespace + "currentQuestion", currentQuestion);
      loadQuestion(currentQuestion);
    }
  }


  // 🔧 Reusable styling function untuk tombol navigasi
  function updateButtons() {
    let btnContainer = document.getElementById("buttons");
    btnContainer.innerHTML = "";

    const questionData = testData[currentQuestion];
    const qid = questionData.id;
    const currentNumber = parseInt(qid.replace(/[^\d]/g, "")) || 0;

    if (currentNumber >= 100) {
      localStorage.setItem(namespace + "hasReached100", "true");
    }

    // Gaya tombol reusable
    function styleButton(btn, bgColor = "#e9e9e9", textColor = "#000") {
      btn.style.padding = "10px 20px";
      btn.style.fontSize = "15px";
      btn.style.backgroundColor = bgColor;
      btn.style.color = textColor;
      btn.style.border = "1px solid #ccc";
      btn.style.borderRadius = "6px";
      btn.style.boxShadow = "1px 1px 5px rgba(0, 0, 0, 0.15)";
      btn.style.cursor = "pointer";
      btn.style.transition = "background-color 0.2s ease";
      btn.onmouseover = () => (btn.style.backgroundColor = "#dcdcdc");
      btn.onmouseout = () => (btn.style.backgroundColor = bgColor);
    }

    const leftGroup = document.createElement("div");
    leftGroup.style.display = "flex";
    leftGroup.style.gap = "42px";
    leftGroup.style.alignItems = "center";

    if (questionData.type === "reading" && currentQuestion > 0) {
      const prevBtn = document.createElement("button");
      prevBtn.innerText = "Previous";
      prevBtn.onclick = previousQuestion;
      styleButton(prevBtn);
      leftGroup.appendChild(prevBtn);
    }

    if (localStorage.getItem(namespace + "hasReached100") === "true") {
      const markedBtn = document.createElement("button");
      markedBtn.innerText = "📌Marked Questions";
      markedBtn.onclick = () => {
        saveAnswer();
        showMarkedQuestionsPopup();
      };
      styleButton(markedBtn, "#ffc107", "#000");
      leftGroup.appendChild(markedBtn);
    }

    const rightGroup = document.createElement("div");
    rightGroup.style.display = "flex";
    rightGroup.style.gap = "42px";
    rightGroup.style.alignItems = "center";

    if (questionData.type === "reading") {
      const markLabel = document.createElement("label");
      markLabel.style.display = "inline-block";
      markLabel.style.padding = "10px 20px";
      markLabel.style.border = "1px solid #3399ff";
      markLabel.style.borderRadius = "6px";
      markLabel.style.boxShadow = "1px 1px 5px rgba(0, 0, 0, 0.15)";
      markLabel.style.cursor = "pointer";
      markLabel.style.transition = "background-color 0.2s ease";
      markLabel.style.fontSize = "15px";
      markLabel.style.userSelect = "none";
      markLabel.style.backgroundColor = "#e0f0ff";
      markLabel.style.color = "#005699";

      const markCheckbox = document.createElement("input");
      markCheckbox.type = "checkbox";
      markCheckbox.id = "mark-for-review";
      markCheckbox.style.marginRight = "8px";

      const reviewStatus = localStorage.getItem(namespace + `${qid}-review`);
      if (reviewStatus === "true") {
        markCheckbox.checked = true;
      }

      markCheckbox.addEventListener("change", () => {
        localStorage.setItem(namespace + `${qid}-review`, markCheckbox.checked);
      });

      markLabel.onmouseover = () =>
        (markLabel.style.backgroundColor = "#cce7ff");
      markLabel.onmouseout = () => {
        markLabel.style.backgroundColor = markCheckbox.checked
          ? "#b3e0ff"
          : "#e0f0ff";
      };

      markLabel.appendChild(markCheckbox);
      markLabel.appendChild(document.createTextNode("Mark for Review"));
      rightGroup.appendChild(markLabel);

      const nextBtn = document.createElement("button");
      nextBtn.innerText = "Next";
      nextBtn.onclick = nextQuestion;
      styleButton(nextBtn);
      rightGroup.appendChild(nextBtn);
    }

    btnContainer.appendChild(leftGroup);
    btnContainer.appendChild(rightGroup);
  }

});

function jumpToQuestion(qid) {
  const index = window.testData.findIndex((q) => q.id === qid);
  if (index !== -1) {
    localStorage.setItem(namespace + "currentQuestion", index);
    currentQuestion = index; // ✅ ini penting agar next/prev berjalan sesuai
    document.getElementById("review-popup-overlay")?.remove();
    window.loadQuestion(index);
  }
}

function showMarkedQuestionsPopup() {
  const readingQuestions = testData.filter((q) => q.type === "reading");
  const markedQuestions = readingQuestions.filter(
    (q) => localStorage.getItem(namespace + `${q.id}-review`) === "true"
  );
  const markedIds = markedQuestions.map((q) => q.id);
  const unansweredQuestions = readingQuestions.filter(
    (q) => !localStorage.getItem(namespace + q.id) && !markedIds.includes(q.id)
  );

  const popupContent = `
  <div id="review-popup-overlay" style="
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  ">
    <div onclick="event.stopPropagation()" 
    style="position: relative; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
    padding: 16px; width: 100%; max-width: 60%; max-height: 80vh; overflow-y: auto; display: flex; 
    flex-wrap: wrap; flex-direction: column;">
      
      <button onclick="document.getElementById('review-popup-overlay').remove()" style="
        position: absolute;
        top: 16px;
        right: 16px;
        background: transparent;
        border: none;
        font-size: 24px;
        cursor: pointer;
        line-height: 1;
      ">×</button>

      <!-- MARKED -->
      <div style="flex: 1 1 280px; padding-right: 12px;">
        <h2 style="
          font-family: 'Segoe UI', sans-serif;
          font-size: 14px;
          margin-bottom: 16px;
          color: #333;
        ">📌 Marked Question</h2>
        <ul style="list-style: none; margin: 0; padding: 0;">
          ${markedQuestions.length > 0
      ? markedQuestions
        .map(
          (q) => `
              <li style="margin-bottom: 12px;">
                <a href="#" onclick="jumpToQuestion('${q.id}')" style="
                  display: inline-block;
                  font-size: 12px;
                  color: #007bff;
                  text-decoration: none;
                  padding: 8px 12px;
                  border: 1px solid #007bff;
                  border-radius: 6px;
                  transition: background 0.2s, color 0.2s;
                " onmouseover="this.style.background='rgba(0,123,255,0.1)'" onmouseout="this.style.background='transparent'">
                  Question Number ${q.id.replace(/[^\d]/g, "")}
                </a>
              </li>
            `
        )
        .join("")
      : `<li style="font-style: italic; color: #666;">Tidak ada soal ditandai.</li>`
    }
<!-- ✅ Always show "Go to Question 100" -->
<li style="margin-top: 16px;">
  <a href="#" onclick="jumpToQuestion('q100')" style="
    display: block;
    width: 100%;
    box-sizing: border-box;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    background-color: #ffc107;
    color: #000;
    text-decoration: none;
    padding: 10px;
    border: 1px solid #ffc107;
    border-radius: 6px;
    transition: background-color 0.2s ease, color 0.2s ease;
  " onmouseover="this.style.backgroundColor='#e0a800'" onmouseout="this.style.backgroundColor='#ffc107'">
    ⏩ Go to Question 100
  </a>
</li>
        </ul>
      </div>

      <!-- DIVIDER -->
      <div style="
        width: 1px;
        background: #e0e0e0;
        align-self: stretch;
        margin: 0 12px;
      "></div>

      <!-- UNANSWERED -->
      <div style="flex: 1 1 280px; padding-left: 12px;">
        <h2 style="
          font-family: 'Segoe UI', sans-serif;
          font-size: 14px;
          margin-bottom: 16px;
          color: #333;
        ">🟥 Unanswered Question</h2>
        <ul style="list-style: none; margin: 0; padding: 0;">
          ${unansweredQuestions.length > 0
      ? unansweredQuestions
        .map(
          (q) => `
              <li style="margin-bottom: 12px;">
                <a href="#" onclick="jumpToQuestion('${q.id}')" style="
                  display: inline-block;
                  font-size: 12px;
                  color: #dc3545;
                  text-decoration: none;
                  padding: 8px 12px;
                  border: 1px solid #dc3545;
                  border-radius: 6px;
                  transition: background 0.2s, color 0.2s;
                " onmouseover="this.style.background='rgba(220,53,69,0.1)'" onmouseout="this.style.background='transparent'">
                  Question Number ${q.id.replace(/[^\d]/g, "")}
                </a>
              </li>
            `
        )
        .join("")
      : `<li style="font-style: italic; color: #666;">Semua soal sudah dijawab.</li>`
    }
        </ul>
      </div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", popupContent);

  document
    .getElementById("review-popup-overlay")
    .addEventListener("click", (e) => e.currentTarget.remove());
}

function showEndConfirmModal() {
  if (document.getElementById("end-confirm-modal")) return;

  const modalHTML = `
  <div id="end-confirm-overlay" style="
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  ">
    <div id="end-confirm-modal" style="
      background: white;
      padding: 20px 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      width: auto;
      min-width: 320px;
      max-width: 80%;
      text-align: center;
      font-family: Arial, sans-serif;
    ">
      <h2 style="margin-bottom: 15px; font-size: 18px;">📝 End of the Test</h2>
      <p style="margin-bottom: 20px; font-size: 14px;">
        This is the end of the test. How would you like to proceed?
      </p>
      <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
        <button id="cancel-btn" style="
          padding: 8px 16px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          white-space: nowrap;
        ">❌ Cancel</button>

        <button id="marked-btn" style="
          padding: 8px 16px;
          background-color: #ffc107;
          color: black;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          white-space: nowrap;
        ">📌 View Marked Questions</button>

        <button id="submit-test-btn" style="
          padding: 8px 16px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          white-space: nowrap;
        ">✅ Submit</button>
      </div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  document.getElementById("submit-test-btn").onclick = () => {
    document.getElementById("end-confirm-overlay").remove();
    window.location.href = "submit.html";
  };

  document.getElementById("marked-btn").onclick = () => {
    document.getElementById("end-confirm-overlay").remove();
    showMarkedQuestionsPopup();
  };

  document.getElementById("cancel-btn").onclick = () => {
    document.getElementById("end-confirm-overlay").remove();
  };

  window.addEventListener("keydown", function escHandler(e) {
    if (e.key === "Escape") {
      document.getElementById("end-confirm-overlay")?.remove();
      window.removeEventListener("keydown", escHandler);
    }
  });
}