// 謎解きサイトのメインロジック

// ステージデータの定義
const stages = [
    {
        id: 1,
        title: "ステージ 1: 数字の謎",
        description: "最初の謎に挑戦しましょう！",
        puzzle: "私は3桁の数字です。百の位と一の位を足すと10になります。十の位は百の位の2倍です。一の位は5です。私は何でしょう？",
        answer: "145",
        hint: "百の位をxとすると、十の位は2x、一の位は5です。x + 5 = 10なので、x = 5です。"
    },
    {
        id: 2,
        title: "ステージ 2: 文字の謎",
        description: "文字を並び替えて答えを見つけましょう！",
        puzzle: "次の文字を並び替えて、意味のある単語を作ってください：\n「た」「け」「し」「い」",
        answer: "たけし",
        hint: "日本の男性の名前です。"
    },
    {
        id: 3,
        title: "ステージ 3: 論理の謎",
        description: "最後の謎です！",
        puzzle: "A、B、Cの3人がいます。\nAは「Bは嘘つきだ」と言いました。\nBは「Cは正直者だ」と言いました。\nCは「Aは嘘つきだ」と言いました。\n正直者は1人だけです。誰が正直者ですか？",
        answer: "B",
        hint: "もしAが正直者なら、Bは嘘つき。Bが嘘つきなら、Cは嘘つき。Cが嘘つきなら、Aは正直者。これは矛盾します。別の可能性を考えてみましょう。"
    }
];

// 現在のステージインデックス
let currentStageIndex = 0;
let completedStages = new Set();

// DOM要素の取得
const elements = {
    currentStage: document.getElementById('current-stage'),
    totalStages: document.getElementById('total-stages'),
    stageTitle: document.getElementById('stage-title'),
    stageDescription: document.getElementById('stage-description'),
    puzzleContent: document.getElementById('puzzle-content'),
    answerInput: document.getElementById('answer-input'),
    submitBtn: document.getElementById('submit-btn'),
    feedbackMessage: document.getElementById('feedback-message'),
    hintBtn: document.getElementById('hint-btn'),
    hintContent: document.getElementById('hint-content'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn')
};

// 初期化
function init() {
    elements.totalStages.textContent = stages.length;
    loadStage(currentStageIndex);
    
    // イベントリスナーの設定
    elements.submitBtn.addEventListener('click', handleSubmit);
    elements.submitBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleSubmit();
    });
    
    elements.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    });
    
    // スマホ向け: 入力欄フォーカス時のスクロール調整
    elements.answerInput.addEventListener('focus', () => {
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                elements.answerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    });
    
    elements.hintBtn.addEventListener('click', toggleHint);
    elements.hintBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        toggleHint();
    });
    
    elements.prevBtn.addEventListener('click', () => changeStage(-1));
    elements.prevBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        changeStage(-1);
    });
    
    elements.nextBtn.addEventListener('click', () => changeStage(1));
    elements.nextBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        changeStage(1);
    });
    
    // 画面の向き変更やリサイズ時の対応
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // リサイズ後の処理（必要に応じて）
        }, 250);
    });
    
    // スマホ向け: キーボード表示時のレイアウト調整
    const viewport = document.querySelector('meta[name="viewport"]');
    window.addEventListener('resize', () => {
        if (window.innerHeight < window.outerHeight * 0.75) {
            // キーボードが表示されている可能性がある
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        } else {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        }
    });
}

// ステージを読み込む
function loadStage(index) {
    if (index < 0 || index >= stages.length) return;
    
    currentStageIndex = index;
    const stage = stages[index];
    
    // UIを更新
    elements.currentStage.textContent = stage.id;
    elements.stageTitle.textContent = stage.title;
    elements.stageDescription.textContent = stage.description;
    elements.puzzleContent.textContent = stage.puzzle;
    elements.answerInput.value = '';
    elements.feedbackMessage.classList.remove('show', 'correct', 'incorrect');
    elements.hintContent.classList.add('hidden');
    
    // ナビゲーションボタンの状態を更新
    elements.prevBtn.disabled = index === 0;
    elements.nextBtn.disabled = index === stages.length - 1 && !completedStages.has(stage.id);
    
    // スマホ向け: スクロールをトップに戻す
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 入力欄にフォーカス（少し遅延させてスクロール後に実行）
    setTimeout(() => {
        elements.answerInput.focus();
        // スマホでキーボード表示時に要素が見えるようにスクロール
        if (window.innerWidth <= 768) {
            elements.answerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
}

// 答えを送信
function handleSubmit() {
    const userAnswer = elements.answerInput.value.trim();
    const currentStage = stages[currentStageIndex];
    
    if (!userAnswer) {
        showFeedback('答えを入力してください。', false);
        return;
    }
    
    // スマホ向け: キーボードを閉じる
    elements.answerInput.blur();
    
    // 答えの検証（大文字小文字を区別しない）
    const isCorrect = userAnswer.toLowerCase() === currentStage.answer.toLowerCase();
    
    if (isCorrect) {
        showFeedback('正解です！🎉', true);
        completedStages.add(currentStage.id);
        
        // 次のステージが存在する場合、次へボタンを有効化
        if (currentStageIndex < stages.length - 1) {
            elements.nextBtn.disabled = false;
        }
        
        // 少し遅延してから次のステージへ（オプション）
        // setTimeout(() => {
        //     if (currentStageIndex < stages.length - 1) {
        //         changeStage(1);
        //     }
        // }, 2000);
    } else {
        showFeedback('不正解です。もう一度考えてみましょう。', false);
        // 不正解の場合は入力欄に再フォーカス（スマホ向け）
        setTimeout(() => {
            if (window.innerWidth <= 768) {
                elements.answerInput.focus();
            }
        }, 500);
    }
}

// フィードバックを表示
function showFeedback(message, isCorrect) {
    elements.feedbackMessage.textContent = message;
    elements.feedbackMessage.classList.remove('correct', 'incorrect');
    elements.feedbackMessage.classList.add('show', isCorrect ? 'correct' : 'incorrect');
    
    // 正解の場合は3秒後にメッセージを消す
    if (isCorrect) {
        setTimeout(() => {
            elements.feedbackMessage.classList.remove('show');
        }, 3000);
    }
}

// ヒントを表示/非表示
function toggleHint() {
    const isHidden = elements.hintContent.classList.contains('hidden');
    
    if (isHidden) {
        const currentStage = stages[currentStageIndex];
        elements.hintContent.textContent = currentStage.hint;
        elements.hintContent.classList.remove('hidden');
        elements.hintBtn.textContent = '💡 ヒントを隠す';
    } else {
        elements.hintContent.classList.add('hidden');
        elements.hintBtn.textContent = '💡 ヒントを見る';
    }
}

// ステージを変更
function changeStage(direction) {
    const newIndex = currentStageIndex + direction;
    
    // 次のステージに進む場合は、現在のステージが完了しているか確認
    if (direction > 0 && !completedStages.has(stages[currentStageIndex].id)) {
        showFeedback('このステージをクリアしてから次に進んでください。', false);
        return;
    }
    
    if (newIndex >= 0 && newIndex < stages.length) {
        loadStage(newIndex);
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);

