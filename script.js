/* =========================================================
   2000年代初頭 個人テキストサイト / ポートフォリオ JavaScript
   ========================================================= */

let postDatesList = [];              // 存在する記事の日付リスト
let currentCalendarDate = new Date(); // カレンダー表示用

document.addEventListener("DOMContentLoaded", function () {
    // 1. カレンダーデータの読み込み
    loadCalendarData();

    // 2. タイトルの1文字波打ちアニメーション化 (Wavy & Rainbow)
    setupWavyText("wavy-main-title");

    // 3. マウス追従文字の設定
    setupCursorTrail("★ WELCOME ★");

    // 4. マウス追従テキスト切替リスナー
    const selectEl = document.getElementById("cursor-text-select");
    if (selectEl) {
        selectEl.addEventListener("change", (e) => {
            updateCursorText(e.target.value);
        });
    }

    // 5. 動く文字体験コーナーのリアルタイム変換
    const inputEl = document.getElementById("custom-text-input");
    if (inputEl) {
        inputEl.addEventListener("input", (e) => {
            updateTextEffects(e.target.value);
        });
        // 初期変換
        updateTextEffects(inputEl.value);
    }
});

/* カレンダー関連処理 */
function loadCalendarData() {
    fetch("diary/posts/index.json?t=" + new Date().getTime())
        .then(response => response.ok ? response.json() : [])
        .then(dates => {
            postDatesList = Array.isArray(dates) ? dates : [];
            renderCalendar();
        })
        .catch(() => {
            renderCalendar();
        });
}

function renderCalendar() {
    const widgetContainer = document.getElementById("calendar-widget");
    if (!widgetContainer) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const postDatesSet = new Set(postDatesList);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    let html = `
        <div class="calendar-header">
            <button class="calendar-nav-btn" onclick="changeCalendarMonth(-1)">&lt; 前月</button>
            <span>${year}年 ${month + 1}月</span>
            <button class="calendar-nav-btn" onclick="changeCalendarMonth(1)">翌月 &gt;</button>
        </div>
        <table class="calendar-table">
            <thead>
                <tr>
                    <th class="sun">日</th>
                    <th>月</th>
                    <th>火</th>
                    <th>水</th>
                    <th>木</th>
                    <th>金</th>
                    <th class="sat">土</th>
                </tr>
            </thead>
            <tbody>
    `;

    let dayCounter = 1;
    const totalRows = Math.ceil((firstDayOfWeek + totalDays) / 7);

    for (let r = 0; r < totalRows; r++) {
        html += "<tr>";
        for (let c = 0; c < 7; c++) {
            if ((r === 0 && c < firstDayOfWeek) || dayCounter > totalDays) {
                html += "<td></td>";
            } else {
                const dateNumStr = String(dayCounter).padStart(2, "0");
                const monthNumStr = String(month + 1).padStart(2, "0");
                const formattedDate = `${year}-${monthNumStr}-${dateNumStr}`;

                const hasPost = postDatesSet.has(formattedDate);
                const isToday = todayStr === formattedDate;

                let classes = [];
                if (c === 0) classes.push("sun");
                if (c === 6) classes.push("sat");
                if (hasPost) classes.push("has-post");
                if (isToday) classes.push("today-cell");

                const classAttr = classes.length > 0 ? `class="${classes.join(" ")}"` : "";
                const clickAttr = hasPost ? `onclick="location.href='diary/index.html'"` : "";

                html += `<td ${classAttr} ${clickAttr}>${dayCounter}</td>`;
                dayCounter++;
            }
        }
        html += "</tr>";
    }

    html += `
            </tbody>
        </table>
    `;

    widgetContainer.innerHTML = html;
}

function changeCalendarMonth(offset) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + offset);
    renderCalendar();
}

/* =========================================================
   動く文字アニメーション用 JS 関数群
   ========================================================= */

/**
 * 指定要素のテキストを1文字ずつのspan要素に分解して波打ちアニメーションを付与
 */
function setupWavyText(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const text = el.innerText.trim();
    el.innerHTML = "";

    [...text].forEach((char, index) => {
        const span = document.createElement("span");
        span.className = "char-wave";
        span.innerHTML = char === " " ? "&nbsp;" : char;
        // 1文字ごとにアニメーションタイミングをずらす
        span.style.animationDelay = `${index * 0.08}s, ${index * 0.08}s`;
        el.appendChild(span);
    });
}

/**
 * 動く文字体験エリアのリアルタイムプレビュー更新
 */
function updateTextEffects(text) {
    const wavyContainer = document.getElementById("preview-wavy");
    const jumpContainer = document.getElementById("preview-jump");

    if (wavyContainer) {
        wavyContainer.innerHTML = "";
        [...text].forEach((char, index) => {
            const span = document.createElement("span");
            span.className = "char-wave";
            span.innerHTML = char === " " ? "&nbsp;" : char;
            span.style.animationDelay = `${index * 0.08}s, ${index * 0.08}s`;
            wavyContainer.appendChild(span);
        });
    }

    if (jumpContainer) {
        jumpContainer.innerHTML = "";
        [...text].forEach((char, index) => {
            const span = document.createElement("span");
            span.className = "char-jump";
            span.innerHTML = char === " " ? "&nbsp;" : char;
            span.style.animationDelay = `${index * 0.08}s`;
            jumpContainer.appendChild(span);
        });
    }
}

/* マウス追従文字 (Cursor Follower Text) */
let cursorTrailElements = [];
let mouseX = 0, mouseY = 0;
let isCursorActive = true;

function setupCursorTrail(initialText) {
    updateCursorText(initialText);

    document.addEventListener("mousemove", (e) => {
        mouseX = e.pageX;
        mouseY = e.pageY;
    });

    function animateTrail() {
        if (isCursorActive) {
            let targetX = mouseX + 15;
            let targetY = mouseY + 15;

            cursorTrailElements.forEach((item) => {
                item.x += (targetX - item.x) * 0.25;
                item.y += (targetY - item.y) * 0.25;

                item.el.style.left = `${item.x}px`;
                item.el.style.top = `${item.y}px`;

                targetX = item.x + 12;
                targetY = item.y;
            });
        }
        requestAnimationFrame(animateTrail);
    }
    animateTrail();
}

function updateCursorText(text) {
    // 既存の追従要素を削除
    cursorTrailElements.forEach(item => item.el.remove());
    cursorTrailElements = [];

    if (text === "OFF" || !text) {
        isCursorActive = false;
        return;
    }

    isCursorActive = true;
    [...text].forEach((char) => {
        const span = document.createElement("div");
        span.className = "cursor-follower-text font-retro";
        span.innerHTML = char === " " ? "&nbsp;" : char;
        document.body.appendChild(span);
        cursorTrailElements.push({ el: span, x: 0, y: 0 });
    });
}
