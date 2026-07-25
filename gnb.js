/* ============================================================
   myToday 홍보웹 공통 GNB 주입 스크립트 (단일 진실 공급원)

   사용법 — 각 페이지에서:
     <head> :  <link rel="stylesheet" href="/gnb.css">
     <body> :  <div id="site-gnb"></div>  (헤더가 놓일 위치)
     </body> 앞: <script src="/gnb.js" defer></script>

   GitHub Pages apex 도메인(my-today.net) 기준 절대경로(/)를 사용하므로
   index(./) vs blog(../) 상대경로 분기가 필요 없다.
   ============================================================ */
(function () {
  'use strict';

  // GNB 링크 정의 — 여기만 고치면 전 페이지에 반영된다.
  var LINKS = [
    { label: '홈', href: '/index.html', key: 'home' },
    { label: '블로그', href: '/blog/', key: 'blog' }
  ];

  // 현재 경로를 논리 키로 정규화한다.
  //  - '/' 또는 '/index.html' → 'home'
  //  - '/blog' 로 시작하는 모든 경로(개별 글 포함) → 'blog'
  // 접두어 매칭을 쓰는 이유: /blog/xxx.html 개별 글에서도 "블로그" 탭이 켜져야 한다.
  function currentKey(pathname) {
    if (pathname.indexOf('/blog') === 0) return 'blog';
    if (pathname === '/' || pathname === '/index.html') return 'home';
    return 'home'; // 법적 서브페이지(terms/privacy/delete) 등은 홈 컨텍스트로 둔다.
  }

  function render() {
    var slot = document.getElementById('site-gnb');
    if (!slot) return;

    var active = currentKey(location.pathname);

    var navHtml = LINKS.map(function (link) {
      var isActive = link.key === active;
      return (
        '<a href="' + link.href + '"' +
        (isActive ? ' class="active" aria-current="page"' : '') +
        '>' + link.label + '</a>'
      );
    }).join('');

    slot.innerHTML =
      '<header class="brand">' +
        '<a class="logo" href="/index.html" aria-label="myToday 홈">' +
          '<span class="dot"><img src="/assets/mascot.png" alt="" /></span>' +
          '<span class="name">myToday</span>' +
        '</a>' +
        '<nav class="nav" aria-label="주요 메뉴">' + navHtml + '</nav>' +
      '</header>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
