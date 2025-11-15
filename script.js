// 謎解きサイトのメインロジック

// 画面管理
const screens = {
    home: document.getElementById('home-screen'),
    puzzle: document.getElementById('puzzle-site'),
    answer: document.getElementById('answer-room'),
    stageClear: document.getElementById('stage-clear-screen')
};

// 画面を切り替える関数
function showScreen(screenName) {
    // すべての画面を非表示
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.add('hidden');
        }
    });
    
    // 指定された画面を表示
    if (screens[screenName]) {
        screens[screenName].classList.remove('hidden');
        // スクロールをトップに戻す
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// プレイヤー名を保存
let playerName = '';

// ステージデータの定義
const stages = [
    {
        id: 1,
        title: "光と重なる謎を解け！？",
        description: "",
        puzzle: "",
        image: "mystery１.jpg",
        answer: "しそう",
        hint: "この謎では、赤色の謎と青色の謎が重なって描かれています。右上の図形は「紫色の部分は、赤色と青色が重なっている」ということを示していました。\n\n赤色の謎に注目すると、指の名前「おや」「ひとさし」「なか」「くすり」「こ」の5つが枠にハマりそうです。",
        hint2: "矢印の「五十音順に1つ進める」というルールを見抜き、5つの枠を図のように埋めましょう。"
    },
    {
        id: 2,
        title: "計算式の謎を解け",
        description: "",
        puzzle: "",
        image: "mystery2.jpg",
        answer: "理屈",
        answerVariations: ["理屈", "りくつ"],
        hint: "左下の「3文字が答え」の「3」の部分がピンク色で書かれていることを手がかりにして、計算式のピンクマスには「3」を、スケルトンパズルのピンクの三角の先には「スリー」と入れましょう。",
        hint2: "次に、計算式の青マスには「6」、黄マスには「2」を、それぞれの色の三角の先には「シックス」と「ツー」を入れましょう。\n\nこうすることで、計算式とスケルトンの両方を成立させることができます。"
    },
    {
        id: 3,
        title: "たぬき",
        description: "",
        puzzle: "",
        image: "asopunazo.250520.png.webp",
        answer: "びわこ",
        answerVariations: ["びわこ", "琵琶湖"],
        hint: "空欄に当てはまるのはイラストの「名前」ではないようです。",
        hint2: "イラストの「数」が重要です。"
    }
];

// 現在のステージインデックス
let currentStageIndex = 0;
let completedStages = new Set();

// DOM要素の取得
const elements = {
    nameInputScreen: document.getElementById('name-input-screen'),
    puzzleContentScreen: document.getElementById('puzzle-content-screen'),
    playerNameInput: document.getElementById('player-name-input'),
    nameSubmitBtn: document.getElementById('name-submit-btn'),
    stageTitle: document.getElementById('stage-title'),
    stageDescription: document.getElementById('stage-description'),
    puzzleContent: document.getElementById('puzzle-content'),
    puzzleImageContainer: document.getElementById('puzzle-image-container'),
    answerInput: document.getElementById('answer-input'),
    submitBtn: document.getElementById('submit-btn'),
    feedbackMessage: document.getElementById('feedback-message'),
    hintArea: document.getElementById('hint-area'),
    hintBtn: document.getElementById('hint-btn'),
    hintContent: document.getElementById('hint-content'),
    prevBtn: document.getElementById('prev-btn')
};

// 初期化
function init() {
    // 初期状態ではホーム画面を表示
    showScreen('home');
    
    // ホーム画面のボタンイベント
    const puzzleRoomBtn = document.getElementById('puzzle-room-btn');
    const answerRoomBtn = document.getElementById('answer-room-btn');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    
    if (puzzleRoomBtn) {
        puzzleRoomBtn.addEventListener('click', () => {
            showScreen('puzzle');
            // 名前入力画面を表示
            showNameInputScreen();
        });
        puzzleRoomBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            showScreen('puzzle');
            showNameInputScreen();
        });
    }
    
    if (answerRoomBtn) {
        answerRoomBtn.addEventListener('click', () => {
            showScreen('answer');
            showEmptyAnswerRoom();
        });
        answerRoomBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            showScreen('answer');
            showEmptyAnswerRoom();
        });
    }
    
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            showScreen('home');
        });
        backToHomeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            showScreen('home');
        });
    }
    
    // ステージクリア画面のボタン
    const goToAnswerRoomBtn = document.getElementById('go-to-answer-room-btn');
    const backToHomeFromClearBtn = document.getElementById('back-to-home-from-clear-btn');
    
    if (goToAnswerRoomBtn) {
        goToAnswerRoomBtn.addEventListener('click', () => {
            showScreen('answer');
            updateAnswerList();
        });
        goToAnswerRoomBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            showScreen('answer');
            updateAnswerList();
        });
    }
    
    if (backToHomeFromClearBtn) {
        backToHomeFromClearBtn.addEventListener('click', () => {
            showScreen('home');
        });
        backToHomeFromClearBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            showScreen('home');
        });
    }
}

// ステージクリア画面を表示
function showStageClearScreen() {
    showScreen('stageClear');
    
    // メッセージを設定
    const messageElement = document.getElementById('stage-clear-message');
    if (messageElement) {
        const message = playerName 
            ? `${playerName}さん、おめでとうございます！全ステージクリアです！🎊`
            : 'おめでとうございます！全ステージクリアです！🎊';
        messageElement.textContent = message;
    }
}

// 空の答えの部屋を表示
function showEmptyAnswerRoom() {
    const answerListElement = document.getElementById('answer-list');
    if (!answerListElement) return;
    
    answerListElement.innerHTML = '<p class="empty-message">この部屋には何もないようだ。。。</p>';
}

// 答えの一覧を更新
function updateAnswerList() {
    const answerListElement = document.getElementById('answer-list');
    if (!answerListElement) return;
    
    let html = '<div class="answer-list-title">答えの一覧</div>';
    html += '<div class="answer-items">';
    
    stages.forEach((stage, index) => {
        html += '<div class="answer-item">';
        html += `<div class="answer-stage-number">ステージ ${stage.id}</div>`;
        html += `<div class="answer-stage-title">${stage.title}</div>`;
        html += '<div class="answer-value">';
        
        // 答えの表示（複数のバリエーションがある場合は表示）
        if (stage.answerVariations && stage.answerVariations.length > 0) {
            html += stage.answerVariations.join(' / ');
        } else {
            html += stage.answer;
        }
        
        html += '</div>';
        html += '</div>';
    });
    
    html += '</div>';
    answerListElement.innerHTML = html;
}

// 名前入力画面を表示
function showNameInputScreen() {
    if (elements.nameInputScreen) {
        elements.nameInputScreen.classList.remove('hidden');
    }
    if (elements.puzzleContentScreen) {
        elements.puzzleContentScreen.classList.add('hidden');
    }
    
    // 名前入力欄にフォーカス
    if (elements.playerNameInput) {
        setTimeout(() => {
            elements.playerNameInput.focus();
        }, 100);
    }
    
    // 名前送信ボタンのイベント
    if (elements.nameSubmitBtn && !elements.nameSubmitBtn.hasAttribute('data-listener-added')) {
        elements.nameSubmitBtn.setAttribute('data-listener-added', 'true');
        elements.nameSubmitBtn.addEventListener('click', handleNameSubmit);
        elements.nameSubmitBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleNameSubmit();
        });
    }
    
    // Enterキーで送信
    if (elements.playerNameInput && !elements.playerNameInput.hasAttribute('data-listener-added')) {
        elements.playerNameInput.setAttribute('data-listener-added', 'true');
        elements.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleNameSubmit();
            }
        });
    }
}

// 名前を送信
function handleNameSubmit() {
    const name = elements.playerNameInput ? elements.playerNameInput.value.trim() : '';
    
    if (!name) {
        alert('お名前を入力してください。');
        return;
    }
    
    playerName = name;
    
    // 名前入力画面を非表示にして、謎解きコンテンツを表示
    if (elements.nameInputScreen) {
        elements.nameInputScreen.classList.add('hidden');
    }
    if (elements.puzzleContentScreen) {
        elements.puzzleContentScreen.classList.remove('hidden');
    }
    
    // 謎解きサイトの初期化
    initPuzzleSite();
}

// 謎解きサイトの初期化
function initPuzzleSite() {
    // 既に初期化されている場合はスキップ（初期化フラグで管理）
    if (window.puzzleSiteInitialized) {
        loadStage(currentStageIndex);
        return;
    }
    
    window.puzzleSiteInitialized = true;
    loadStage(currentStageIndex);
    
    // イベントリスナーの設定（まだ設定されていない場合のみ）
    if (elements.submitBtn && !elements.submitBtn.hasAttribute('data-listener-added')) {
        elements.submitBtn.setAttribute('data-listener-added', 'true');
        elements.submitBtn.addEventListener('click', handleSubmit);
        elements.submitBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleSubmit();
        });
    }
    
    if (elements.answerInput && !elements.answerInput.hasAttribute('data-listener-added')) {
        elements.answerInput.setAttribute('data-listener-added', 'true');
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
    }
    
    // ヒントボタンのイベントリスナー設定
    if (elements.hintBtn && !elements.hintBtn.hasAttribute('data-listener-added')) {
        elements.hintBtn.setAttribute('data-listener-added', 'true');
        elements.hintBtn.addEventListener('click', toggleHint);
        elements.hintBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            toggleHint();
        });
    }
    
    if (elements.prevBtn && !elements.prevBtn.hasAttribute('data-listener-added')) {
        elements.prevBtn.setAttribute('data-listener-added', 'true');
        elements.prevBtn.addEventListener('click', () => changeStage(-1));
        elements.prevBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            changeStage(-1);
        });
    }
    
    // 画面の向き変更やリサイズ時の対応
    let resizeTimer;
    let resizeListenerAdded = false;
    if (!resizeListenerAdded) {
        resizeListenerAdded = true;
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
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                }
            } else {
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
                }
            }
        });
    }
}

// ステージを読み込む
function loadStage(index) {
    if (index < 0 || index >= stages.length) return;
    
    currentStageIndex = index;
    const stage = stages[index];
    
    // UIを更新
    if (elements.stageTitle) {
        elements.stageTitle.textContent = stage.title;
    }
    if (elements.stageDescription) {
        elements.stageDescription.textContent = stage.description;
    }
    if (elements.puzzleContent) {
        elements.puzzleContent.textContent = stage.puzzle;
    }
    
    // 画像の表示
    if (elements.puzzleImageContainer) {
        elements.puzzleImageContainer.innerHTML = ''; // 既存の画像をクリア
        if (stage.image) {
            const img = document.createElement('img');
            img.src = stage.image;
            img.alt = stage.title;
            img.className = 'puzzle-image';
            elements.puzzleImageContainer.appendChild(img);
        }
    }
    
    if (elements.answerInput) {
        elements.answerInput.value = '';
    }
    if (elements.feedbackMessage) {
        elements.feedbackMessage.classList.remove('show', 'correct', 'incorrect');
    }
    
    // ヒントエリアを非表示にする
    if (elements.hintArea) {
        elements.hintArea.classList.add('hidden');
    }
    if (elements.hintContent) {
        elements.hintContent.classList.add('hidden');
    }
    
    // ヒント状態をリセット
    hintState = 0;
    if (elements.hintBtn) {
        elements.hintBtn.textContent = '💡 ヒントを見る';
    }
    
    // ナビゲーションボタンの状態を更新
    if (elements.prevBtn) {
        elements.prevBtn.disabled = index === 0;
    }
    
    // スマホ向け: スクロールをトップに戻す
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 入力欄にフォーカス（少し遅延させてスクロール後に実行）
    setTimeout(() => {
        if (elements.answerInput) {
            elements.answerInput.focus();
            // スマホでキーボード表示時に要素が見えるようにスクロール
            if (window.innerWidth <= 768) {
                elements.answerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
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
    
    // 答えの検証（大文字小文字を区別しない、複数の答えのバリエーションに対応）
    let isCorrect = false;
    if (currentStage.answerVariations) {
        // 複数の答えのバリエーションがある場合
        isCorrect = currentStage.answerVariations.some(ans => 
            userAnswer.toLowerCase() === ans.toLowerCase()
        );
    } else {
        // 通常の答えの検証
        isCorrect = userAnswer.toLowerCase() === currentStage.answer.toLowerCase();
    }
    
    if (isCorrect) {
        completedStages.add(currentStage.id);
        
        // ヒントエリアを非表示にする
        if (elements.hintArea) {
            elements.hintArea.classList.add('hidden');
        }
        
        // ヒント状態をリセット
        hintState = 0;
        
        // 全ステージクリアの確認
        if (completedStages.size === stages.length) {
            // 全ステージクリア時はすぐにステージクリア画面に移行
            showStageClearScreen();
        } else {
            // 正解メッセージを表示してから次のステージへ進む
            showFeedback('正解です！🎉', true);
            // 次のステージが存在する場合、自動で次のステージへ進む
            if (currentStageIndex < stages.length - 1) {
                setTimeout(() => {
                    changeStage(1);
                }, 1500); // 1.5秒後に次のステージへ
            }
        }
    } else {
        showFeedback('不正解です。もう一度考えてみましょう。', false);
        
        // 不正解の場合はヒントエリアを表示
        if (elements.hintArea && currentStage.hint) {
            elements.hintArea.classList.remove('hidden');
        }
        
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

// ヒント表示の状態管理
let hintState = 0; // 0: 非表示, 1: ヒント1表示中, 2: ヒント2表示中

// ヒントを表示/非表示
function toggleHint() {
    const currentStage = stages[currentStageIndex];
    
    if (hintState === 0) {
        // ヒント1を表示
        if (currentStage.hint) {
            elements.hintContent.textContent = currentStage.hint;
            elements.hintContent.classList.remove('hidden');
            hintState = 1;
            // ヒント2がある場合は「ヒント2を見る」に変更、ない場合は「ヒントを隠す」
            if (currentStage.hint2) {
                elements.hintBtn.textContent = '💡 ヒント2を見る';
            } else {
                elements.hintBtn.textContent = '💡 ヒントを隠す';
            }
        }
    } else if (hintState === 1) {
        // ヒント2がある場合はヒント2を表示、ない場合は非表示
        if (currentStage.hint2) {
            elements.hintContent.textContent = currentStage.hint + '\n\n' + currentStage.hint2;
            hintState = 2;
            elements.hintBtn.textContent = '💡 ヒントを隠す';
        } else {
            // ヒント2がない場合は非表示に戻す
            elements.hintContent.classList.add('hidden');
            elements.hintBtn.textContent = '💡 ヒントを見る';
            hintState = 0;
        }
    } else {
        // ヒント2表示中 → 非表示に戻す
        elements.hintContent.classList.add('hidden');
        elements.hintBtn.textContent = '💡 ヒントを見る';
        hintState = 0;
    }
}

// ステージを変更
function changeStage(direction) {
    const newIndex = currentStageIndex + direction;
    
    // 前のステージに戻る場合のみ、完了チェックは不要
    // 次のステージに進む場合は、現在のステージが完了しているか確認（自動進行の場合は既に完了している）
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

