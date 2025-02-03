let questions = [];
let currentQuestionIndex = 0;
let score = 0;
const totalQuizQuestions = 10;  // クイズで出題する問題数

// DOM要素の取得
const questionElement = document.getElementById('question');
const questionNumberElement = document.getElementById('question-number');
const choicesElement = document.getElementById('choices');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');
const scoreHistoryElement = document.getElementById('score-history');

// Fisher-Yates アルゴリズムによるシャッフル
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// JSONから問題データを取得し、ランダムな10問を選択
function loadQuestions() {
  fetch('questions.json')
    .then(response => response.json())
    .then(data => {
      const shuffled = shuffleArray(data);
      questions = shuffled.slice(0, totalQuizQuestions);
      currentQuestionIndex = 0;
      score = 0;
      displayQuestion();
      updateScoreHistory();
    })
    .catch(error => {
      console.error('問題の読み込みに失敗しました:', error);
    });
}

// 現在の問題を表示
function displayQuestion() {
  feedbackElement.textContent = "";
  nextButton.style.display = 'none';
  restartButton.style.display = 'none';

  if (currentQuestionIndex >= questions.length) {
    finishQuiz();
    return;
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  questionNumberElement.textContent = `Question ${currentQuestionIndex + 1} of ${totalQuizQuestions}`;
  questionElement.textContent = currentQuestion.question;
  choicesElement.innerHTML = "";
  
  // 選択肢ボタンの作成
  currentQuestion.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.textContent = choice.text;
    button.className = 'choice';
    button.addEventListener('click', () => selectAnswer(index));
    choicesElement.appendChild(button);
  });
}

// 回答選択時の処理
function selectAnswer(choiceIndex) {
  const currentQuestion = questions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.choice');
  
  // 回答後は全選択肢ボタンを無効化
  buttons.forEach(btn => btn.disabled = true);
  
  if (choiceIndex === currentQuestion.correct) {
    score++;
    feedbackElement.textContent = "正解！ " + currentQuestion.explanation;
  } else {
    feedbackElement.textContent = "不正解。 " + currentQuestion.explanation;
  }
  
  nextButton.style.display = 'block';
}

// 「次へ」ボタン押下で次の問題へ
nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  displayQuestion();
});

// クイズ終了時の処理
function finishQuiz() {
  questionElement.textContent = `クイズ終了！ あなたの正解数: ${score} / ${totalQuizQuestions}`;
  questionNumberElement.textContent = "";
  choicesElement.innerHTML = "";
  feedbackElement.textContent = "";
  nextButton.style.display = 'none';
  restartButton.style.display = 'block';
  saveScore();
  updateScoreHistory();
}

// 「もう一度挑戦する」ボタン押下でリスタート
restartButton.addEventListener('click', () => {
  loadQuestions();
});

// スコアを localStorage に保存
function saveScore() {
  let scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];
  const now = new Date();
  scoreHistory.push({
    date: now.toLocaleString(),
    score: score,
    total: totalQuizQuestions
  });
  localStorage.setItem('scoreHistory', JSON.stringify(scoreHistory));
}

// スコア履歴を画面に表示
function updateScoreHistory() {
  scoreHistoryElement.innerHTML = "";
  const scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];
  scoreHistory.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.date} : ${entry.score} / ${entry.total}`;
    scoreHistoryElement.appendChild(li);
  });
}

// ページ読み込み時に問題を読み込む
window.onload = loadQuestions;
