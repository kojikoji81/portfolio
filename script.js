/* =========================================================
   2000年代初頭 個人テキストサイト / ポートフォリオ JavaScript
   ========================================================= */

let postDatesList = [];              // 存在する記事の日付リスト
let currentCalendarDate = new Date(); // カレンダー表示用

document.addEventListener("DOMContentLoaded", function () {
    // diary/posts/index.json から日付一覧を読み込んでカレンダー構築
    loadCalendarData();
});

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
