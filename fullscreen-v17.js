/**
 * LỚP HỌC TƯƠNG TÁC TOÁN & TIN - FULLSCREEN PATCH V17
 * Mục tiêu:
 * 1) Giao diện luôn tận dụng 100% chiều rộng màn hình.
 * 2) Bấm QUAY NÓN -> tự chuyển sang chế độ trình chiếu/toàn màn hình.
 * 3) Bắt đầu KÉO CO / ĐUA XE -> tự chuyển sang chế độ trò chơi toàn màn hình.
 * 4) Tối ưu bố cục game cho màn hình 16:9, TV/máy chiếu và trình duyệt đang zoom.
 * 5) ESC hoặc nút THOÁT TOÀN MÀN HÌNH để trở lại giao diện quản lý.
 *
 * Cách dùng:
 *   Thêm dòng sau ngay trước </body> trong index.html:
 *   <script src="/fullscreen-v17.js"></script>
 */
(function () {
  'use strict';

  const CSS = String.raw`
  /* =============== V17 FULL-BLEED APP =============== */
  html, body {
    width: 100% !important;
    max-width: none !important;
    min-height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  body {
    min-height: 100dvh !important;
  }

  .wrap {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 8px 10px !important;
  }

  .topbar {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    border-radius: 18px !important;
  }

  .screen,
  .screen.active,
  #random,
  #games {
    width: 100% !important;
    max-width: none !important;
  }

  /* Gọi tên: dùng toàn bộ phần còn lại của viewport */
  .random-stage {
    width: 100% !important;
    grid-template-columns: minmax(0, 1fr) clamp(330px, 26vw, 430px) !important;
    gap: 10px !important;
    min-height: calc(100dvh - 88px) !important;
  }

  .wheel-card-full {
    min-width: 0 !important;
    min-height: calc(100dvh - 88px) !important;
    height: calc(100dvh - 88px) !important;
  }

  .call-panel {
    min-height: calc(100dvh - 88px) !important;
    height: calc(100dvh - 88px) !important;
  }

  .call-panel-scroll {
    height: calc(100dvh - 138px) !important;
  }

  .wheel-card-full .wheel-wrap {
    inset: 48px 0 108px !important;
  }

  .wheel-card-full #wheelCanvas {
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
  }

  /* =============== V17 WHEEL PRESENTATION =============== */
  body.wheel-presentation {
    width: 100dvw !important;
    height: 100dvh !important;
    overflow: hidden !important;
  }

  .wheel-presentation .wrap {
    width: 100dvw !important;
    height: 100dvh !important;
    max-width: none !important;
    padding: 0 !important;
  }

  .wheel-presentation .topbar {
    display: none !important;
  }

  .wheel-presentation #random {
    width: 100dvw !important;
    height: 100dvh !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .wheel-presentation #random .random-stage {
    width: 100dvw !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
    display: block !important;
  }

  .wheel-presentation .wheel-card-full {
    width: 100dvw !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
    border-radius: 0 !important;
    border: 0 !important;
    padding: 0 !important;
  }

  .wheel-presentation .wheel-card-full .wheel-wrap {
    inset: 10px 0 118px !important;
  }

  .wheel-presentation .wheel-card-full #wheelCanvas {
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
  }

  .wheel-presentation .wheel-head {
    top: 10px !important;
    left: 14px !important;
    right: 14px !important;
  }

  .wheel-presentation .wheel-pointer {
    top: 22px !important;
  }

  .wheel-presentation .wheel-result {
    bottom: 82px !important;
    width: min(92vw, 1250px) !important;
    padding: 7px 16px !important;
  }

  .wheel-presentation .wheel-result .student-name {
    font-size: clamp(48px, 6.2vw, 108px) !important;
    line-height: 1 !important;
    white-space: normal !important;
  }

  .wheel-presentation .wheel-actions {
    bottom: 12px !important;
  }

  .wheel-presentation .spin-btn {
    font-size: clamp(18px, 1.35vw, 25px) !important;
    padding: 12px 30px !important;
  }

  .wheel-presentation .call-panel {
    position: fixed !important;
    z-index: 160 !important;
    right: 10px !important;
    top: 10px !important;
    bottom: 10px !important;
    width: min(410px, 92vw) !important;
    height: auto !important;
    min-height: 0 !important;
  }

  .wheel-presentation .call-panel-scroll {
    height: calc(100dvh - 66px) !important;
  }

  /* =============== V17 GAME PRESENTATION =============== */
  body.game-presentation {
    width: 100dvw !important;
    height: 100dvh !important;
    overflow: hidden !important;
  }

  .game-presentation .wrap {
    width: 100dvw !important;
    height: 100dvh !important;
    max-width: none !important;
    padding: 0 !important;
  }

  .game-presentation .topbar {
    display: none !important;
  }

  .game-presentation #games {
    width: 100dvw !important;
    height: 100dvh !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .game-presentation #gameHub {
    display: none !important;
  }

  .game-presentation #gamePlay {
    display: grid !important;
    width: 100dvw !important;
    height: 100dvh !important;
    padding: 7px !important;
    gap: 6px !important;
    overflow: hidden !important;
    grid-template-rows: auto auto minmax(0, 1fr) auto auto !important;
  }

  .game-presentation .game-top-card {
    margin: 0 !important;
    min-height: 0 !important;
    padding: 7px 10px !important;
    border-radius: 14px !important;
    gap: 8px !important;
  }

  .game-presentation .game-top-title h2 {
    font-size: clamp(18px, 1.55vw, 28px) !important;
    line-height: 1.08 !important;
  }

  .game-presentation .game-top-title .muted {
    display: none !important;
  }

  .game-presentation .top-pills {
    gap: 5px !important;
  }

  .game-presentation .top-pills .pill {
    padding: 5px 8px !important;
    font-size: clamp(10px, .78vw, 13px) !important;
  }

  .game-presentation .duel-toolbar-actions {
    gap: 5px !important;
  }

  .game-presentation .duel-toolbar-actions .btn {
    padding: 7px 10px !important;
    font-size: 12px !important;
  }

  .game-presentation .turns {
    margin: 0 !important;
    gap: 6px !important;
  }

  .game-presentation .turn-btn {
    padding: 7px 10px !important;
    font-size: clamp(12px, 1vw, 16px) !important;
    border-radius: 11px !important;
  }

  .game-presentation .game-layout-duel {
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    gap: 7px !important;
    align-items: stretch !important;
    grid-template-columns: minmax(270px, 1fr) minmax(300px, .88fr) minmax(270px, 1fr) !important;
  }

  .game-presentation .team-panel {
    min-width: 0 !important;
    min-height: 0 !important;
    height: 100% !important;
    padding: 7px !important;
    border-radius: 15px !important;
    overflow: hidden !important;
  }

  .game-presentation .team-side-head {
    margin-bottom: 5px !important;
    gap: 6px !important;
  }

  .game-presentation .team-side-label {
    font-size: clamp(14px, 1.15vw, 21px) !important;
  }

  .game-presentation .team-status {
    padding: 4px 7px !important;
    font-size: 10px !important;
  }

  .game-presentation .question-team-card {
    min-height: 0 !important;
    height: calc(100% - 34px) !important;
    padding: 7px !important;
    gap: 5px !important;
    border-radius: 13px !important;
    overflow: hidden !important;
  }

  .game-presentation .question-media {
    min-height: 0 !important;
    height: clamp(86px, 17dvh, 170px) !important;
    padding: 6px !important;
    border-radius: 11px !important;
  }

  .game-presentation .question-media img {
    width: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
    margin: 0 auto !important;
  }

  .game-presentation .question-media-placeholder {
    height: 100% !important;
    min-height: 0 !important;
    gap: 4px !important;
  }

  .game-presentation .question-media-placeholder .icon {
    font-size: clamp(24px, 3dvh, 40px) !important;
  }

  .game-presentation .question-copy-wrap {
    padding: 0 2px !important;
    min-height: 0 !important;
  }

  .game-presentation .question-copy-title {
    display: none !important;
  }

  .game-presentation .team-question-copy {
    font-size: clamp(17px, 1.45vw, 30px) !important;
    line-height: 1.18 !important;
    max-height: 18dvh !important;
    overflow: auto !important;
    padding: 2px 4px !important;
  }

  .game-presentation .answers-team {
    grid-template-columns: 1fr 1fr !important;
    gap: 5px !important;
    margin-top: 0 !important;
    min-height: 0 !important;
  }

  .game-presentation .answers-team .answer {
    min-height: 0 !important;
    height: clamp(52px, 9.8dvh, 92px) !important;
    padding: 6px 7px !important;
    border-radius: 12px !important;
    font-size: clamp(15px, 1.16vw, 24px) !important;
    line-height: 1.08 !important;
    gap: 3px !important;
    box-shadow: 0 4px 0 rgba(0,0,0,.16) !important;
  }

  .game-presentation .answers-team .answer .opt-key {
    min-width: 30px !important;
    height: 30px !important;
    padding: 0 8px !important;
    border-radius: 9px !important;
    font-size: .72em !important;
  }

  .game-presentation .game-stage-arena,
  .game-presentation .game-stage-arena #gameCanvas {
    min-height: 0 !important;
    height: 100% !important;
    border-radius: 15px !important;
  }

  .game-presentation .hud {
    top: 7px !important;
    left: 7px !important;
    right: 7px !important;
    gap: 4px !important;
  }

  .game-presentation .scorebox {
    padding: 5px 7px !important;
    gap: 6px !important;
    border-radius: 11px !important;
  }

  .game-presentation .team-badge {
    min-width: 78px !important;
  }

  .game-presentation .team-badge b {
    font-size: clamp(12px, .95vw, 16px) !important;
  }

  .game-presentation .team-badge span {
    font-size: 9px !important;
  }

  .game-presentation .score-num {
    font-size: clamp(20px, 1.7vw, 29px) !important;
  }

  .game-presentation .arena-bottom-info {
    bottom: 7px !important;
    padding: 5px 7px !important;
    gap: 5px !important;
  }

  .game-presentation .game-title {
    bottom: 43px !important;
    padding: 5px 8px !important;
    font-size: 10px !important;
  }

  .game-presentation .duel-explain {
    min-height: 0 !important;
    max-height: 52px !important;
    overflow: auto !important;
    margin: 0 !important;
    padding: 6px 10px !important;
    border-radius: 11px !important;
    font-size: clamp(11px, .92vw, 15px) !important;
    line-height: 1.25 !important;
  }

  .game-presentation .game-actions {
    margin: 0 !important;
    padding: 0 !important;
  }

  .game-presentation .game-actions .row {
    gap: 5px !important;
    flex-wrap: nowrap !important;
  }

  .game-presentation .game-actions .btn {
    min-height: 35px !important;
    padding: 6px 10px !important;
    font-size: clamp(11px, .9vw, 15px) !important;
  }

  .game-presentation .next-question-btn {
    font-size: clamp(12px, 1vw, 16px) !important;
  }

  /* Nút thoát nhanh khi đang trình chiếu */
  #v17ExitFullscreen {
    position: fixed;
    z-index: 99999;
    right: 10px;
    bottom: 10px;
    display: none;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 999px;
    padding: 8px 12px;
    background: rgba(4,12,24,.80);
    color: #fff;
    font: 800 12px/1 system-ui, sans-serif;
    cursor: pointer;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 28px rgba(0,0,0,.35);
    opacity: .68;
  }
  #v17ExitFullscreen:hover { opacity: 1; }
  body.wheel-presentation #v17ExitFullscreen,
  body.game-presentation #v17ExitFullscreen { display: block; }

  /* TV / máy chiếu / laptop: vẫn giữ 3 cột nếu màn hình ngang.
     Ghi đè media query cũ vốn chuyển game thành 1 cột khi trình duyệt zoom. */
  @media (min-width: 900px) and (orientation: landscape) {
    .game-presentation .game-layout-duel {
      grid-template-columns: minmax(245px, 1fr) minmax(270px, .82fr) minmax(245px, 1fr) !important;
    }
  }

  @media (min-width: 1500px) and (orientation: landscape) {
    .game-presentation .game-layout-duel {
      grid-template-columns: minmax(340px, 1.04fr) minmax(420px, .92fr) minmax(340px, 1.04fr) !important;
    }
    .game-presentation .question-media {
      height: clamp(120px, 19dvh, 210px) !important;
    }
    .game-presentation .team-question-copy {
      font-size: clamp(20px, 1.5vw, 34px) !important;
    }
  }

  @media (max-width: 899px), (orientation: portrait) {
    .wrap { padding: 6px !important; }
    .random-stage {
      grid-template-columns: 1fr !important;
      min-height: auto !important;
    }
    .wheel-card-full {
      height: min(74dvh, 720px) !important;
      min-height: 560px !important;
    }
    .call-panel {
      height: auto !important;
      min-height: 0 !important;
    }
    .call-panel-scroll {
      height: auto !important;
      max-height: none !important;
    }
    .game-presentation {
      overflow: auto !important;
    }
    .game-presentation #games,
    .game-presentation #gamePlay {
      height: auto !important;
      min-height: 100dvh !important;
      overflow: visible !important;
    }
    .game-presentation #gamePlay {
      display: block !important;
    }
    .game-presentation .game-layout-duel {
      grid-template-columns: 1fr !important;
      height: auto !important;
    }
    .game-presentation .team-panel,
    .game-presentation .game-stage-arena,
    .game-presentation .game-stage-arena #gameCanvas {
      min-height: 480px !important;
      height: auto !important;
    }
  }
  `;

  function injectStyle() {
    if (document.getElementById('v17FullscreenStyles')) return;
    const style = document.createElement('style');
    style.id = 'v17FullscreenStyles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function ensureExitButton() {
    if (document.getElementById('v17ExitFullscreen')) return;
    const btn = document.createElement('button');
    btn.id = 'v17ExitFullscreen';
    btn.type = 'button';
    btn.textContent = '✕ THOÁT TOÀN MÀN HÌNH';
    btn.title = 'Thoát chế độ trình chiếu (Esc)';
    btn.addEventListener('click', exitPresentation);
    document.body.appendChild(btn);
  }

  function requestNativeFullscreen() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        const p = document.documentElement.requestFullscreen();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } catch (_) {}
  }

  function refresh3D(delay = 180) {
    setTimeout(() => {
      try { window.wheel3d?.resize?.(); } catch (_) {}
      try { window.game3d?.resize?.(); } catch (_) {}
      window.dispatchEvent(new Event('resize'));
    }, delay);
  }

  function enterWheelPresentation() {
    document.body.classList.add('wheel-presentation');
    document.body.classList.remove('game-presentation');
    document.getElementById('callPanel')?.classList.remove('open');
    requestNativeFullscreen();
    refresh3D();
  }

  function enterGamePresentation() {
    document.body.classList.add('game-presentation');
    document.body.classList.remove('wheel-presentation');
    requestNativeFullscreen();
    refresh3D(220);
  }

  function exitPresentation() {
    document.body.classList.remove('wheel-presentation', 'game-presentation');
    document.getElementById('callPanel')?.classList.remove('open');
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        const p = document.exitFullscreen();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } catch (_) {}
    refresh3D();
  }

  function activeScreenId() {
    return document.querySelector('.screen.active')?.id || '';
  }

  function wrapGlobalFunctions() {
    // QUAY NÓN: chuyển ngay sang presentation trước khi animation bắt đầu.
    if (typeof window.callRandomStudent === 'function' && !window.callRandomStudent.__v17wrapped) {
      const original = window.callRandomStudent;
      const wrapped = function (...args) {
        enterWheelPresentation();
        return original.apply(this, args);
      };
      wrapped.__v17wrapped = true;
      window.callRandomStudent = wrapped;
    }

    // Bắt đầu trò chơi: tự vào full màn hình.
    if (typeof window.startGame === 'function' && !window.startGame.__v17wrapped) {
      const original = window.startGame;
      const wrapped = function (...args) {
        const result = original.apply(this, args);
        // startGame bản hiện tại dựng game đồng bộ, nên yêu cầu fullscreen
        // vẫn nằm trong chuỗi thao tác click của người dùng.
        enterGamePresentation();
        return result;
      };
      wrapped.__v17wrapped = true;
      window.startGame = wrapped;
    }

    // Nút "Toàn màn hình" trên thanh menu:
    // - đang ở Gọi tên => trình chiếu vòng quay
    // - đang chơi game => trình chiếu game
    // - còn lại => browser fullscreen thông thường
    if (typeof window.toggleFullscreen === 'function' && !window.toggleFullscreen.__v17wrapped) {
      const wrapped = function () {
        if (document.body.classList.contains('wheel-presentation') ||
            document.body.classList.contains('game-presentation')) {
          exitPresentation();
          return;
        }
        const id = activeScreenId();
        const playing = id === 'games' && !document.getElementById('gamePlay')?.classList.contains('hide');
        if (playing) enterGamePresentation();
        else if (id === 'random') enterWheelPresentation();
        else {
          if (!document.fullscreenElement) requestNativeFullscreen();
          else document.exitFullscreen?.();
        }
      };
      wrapped.__v17wrapped = true;
      window.toggleFullscreen = wrapped;
    }

    // Giữ hai nút TRÌNH CHIẾU tương thích nhưng dùng layout V17.
    window.toggleWheelPresentation = function () {
      if (document.body.classList.contains('wheel-presentation')) exitPresentation();
      else enterWheelPresentation();
    };
    window.toggleGamePresentation = function () {
      if (document.body.classList.contains('game-presentation')) exitPresentation();
      else enterGamePresentation();
    };
  }

  function boot() {
    injectStyle();
    ensureExitButton();
    document.documentElement.classList.add('v17-fullscreen-ready');
    // Script được đặt trước </body>, nhưng delay 0 giúp chắc chắn file index
    // đã khai báo xong các hàm toàn cục.
    setTimeout(() => {
      wrapGlobalFunctions();
      refresh3D(100);
    }, 0);

    window.addEventListener('resize', () => refresh3D(80), { passive: true });
    window.addEventListener('orientationchange', () => refresh3D(180), { passive: true });

    document.addEventListener('fullscreenchange', () => {
      // Khi giáo viên nhấn Esc, trình duyệt thoát fullscreen.
      // Đồng bộ giao diện về trạng thái quản lý bình thường.
      if (!document.fullscreenElement) {
        document.body.classList.remove('wheel-presentation', 'game-presentation');
        document.getElementById('callPanel')?.classList.remove('open');
      }
      refresh3D(100);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.classList.remove('wheel-presentation', 'game-presentation');
        document.getElementById('callPanel')?.classList.remove('open');
        refresh3D(80);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
