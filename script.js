let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// DOM要素の取得
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');
const scoreHistoryElement = document.getElementById('score-history');

// JSONファイルから問題データを取得
function loadQuestions() {
  fetch('questions.json')
    .then(response => response.json())
    .then(data => {
      questions = data;
      // 問題をランダム化
      shuffleArray(questions);
      displayQuestion();
      updateScoreHistory();
    })
    .catch(error => {
      console.error('問題の読み込みに失敗しました:', error);
    });
}

// Fisher-Yates アルゴリズムで配列をシャッフル
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 現在の問題を画面に表示
function displayQuestion() {
  // 前回のフィードバックをクリア
  feedbackElement.textContent = "";
  nextButton.style.display = 'none';
  restartButton.style.display = 'none';

  // 全問題を回答済みならクイズ終了
  if (currentQuestionIndex >= questions.length) {
    finishQuiz();
    return;
  }
  
  const currentQuestion = questions[currentQuestionIndex];
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

// 次へボタン押下で次の問題へ
nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  displayQuestion();
});

// クイズ終了時の処理
function finishQuiz() {
  questionElement.textContent = `クイズ終了！ あなたの正解数: ${score} / ${questions.length}`;
  choicesElement.innerHTML = "";
  feedbackElement.textContent = "";
  nextButton.style.display = 'none';
  restartButton.style.display = 'block';
  // スコアを履歴に保存
  saveScore();
  updateScoreHistory();
}

// 「もう一度挑戦する」ボタンでリセット
restartButton.addEventListener('click', () => {
  // 状態リセット
  currentQuestionIndex = 0;
  score = 0;
  // 問題を再ランダム化
  shuffleArray(questions);
  displayQuestion();
});

// スコアを localStorage に保存
function saveScore() {
  let scoreHistory = JSON.parse(localStorage.getItem('scoreHistory')) || [];
  const now = new Date();
  scoreHistory.push({
    date: now.toLocaleString(),
    score: score,
    total: questions.length
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
