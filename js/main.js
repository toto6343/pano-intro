// ============================================
// 전역 변수 및 초기 설정
// ============================================
const state = {
    isRotating: true,
    currentSpeed: 'normal', // 'slow', 'normal', 'fast'
    currentFace: 0,
    isHovering: false
};

// ============================================
// DOM 요소 선택
// ============================================
const circle = document.querySelector("#circle");
const articles = circle.querySelectorAll("article");
const navButtons = document.querySelectorAll(".nav-btn");
const pauseBtn = document.getElementById("pauseBtn");
const speedBtn = document.getElementById("speedBtn");
const keyboardHelp = document.getElementById("keyboardHelp");

// ============================================
// 초기화 함수
// ============================================
function init() {
    setupEventListeners();
    setupIntersectionObserver();
    showKeyboardHelp();
    
    console.log('✅ NextByte Cube 초기화 완료!');
}

// ============================================
// 키보드 도움말 표시
// ============================================
function showKeyboardHelp() {
    setTimeout(() => {
        keyboardHelp.classList.add('visible');
        setTimeout(() => {
            keyboardHelp.classList.remove('visible');
        }, 5000);
    }, 1000);
}

// ============================================
// 이벤트 리스너 설정
// ============================================
function setupEventListeners() {
    // Article hover 이벤트
    articles.forEach((article, index) => {
        article.addEventListener("mouseenter", handleArticleMouseEnter);
        article.addEventListener("mouseleave", handleArticleMouseLeave);
        
        // 포커스 이벤트 (접근성)
        article.addEventListener("focus", handleArticleMouseEnter, true);
        article.addEventListener("blur", handleArticleMouseLeave, true);
        
        // 클릭 이벤트
        article.addEventListener("click", () => handleArticleClick(index));
    });

    // 네비게이션 버튼
    navButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => navigateToFace(index));
    });

    // 일시정지/재생 버튼
    pauseBtn.addEventListener("click", toggleRotation);

    // 속도 변경 버튼
    speedBtn.addEventListener("click", changeSpeed);

    // 키보드 단축키
    document.addEventListener("keydown", handleKeyboard);

    // 터치 이벤트 (모바일)
    let touchStartX = 0;
    let touchEndX = 0;

    circle.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    circle.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // 왼쪽 스와이프
            rotateToNext();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // 오른쪽 스와이프
            rotateToPrevious();
        }
    }
}

// ============================================
// Article 이벤트 핸들러
// ============================================
function handleArticleMouseEnter(e) {
    if (!state.isHovering) {
        state.isHovering = true;
        pauseRotation();
        
        // 호버된 article에 효과 추가
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.zIndex = '100';
    }
}

function handleArticleMouseLeave(e) {
    if (state.isHovering) {
        state.isHovering = false;
        if (state.isRotating) {
            resumeRotation();
        }
        
        // 효과 제거
        e.currentTarget.style.transform = '';
        e.currentTarget.style.zIndex = '';
    }
}

function handleArticleClick(index) {
    navigateToFace(index);
    
    // 클릭 효과
    const article = articles[index];
    article.style.animation = 'none';
    setTimeout(() => {
        article.style.animation = '';
    }, 10);
}

// ============================================
// 회전 제어 함수
// ============================================
function pauseRotation() {
    circle.style.animationPlayState = "paused";
}

function resumeRotation() {
    circle.style.animationPlayState = "running";
}

function toggleRotation() {
    state.isRotating = !state.isRotating;
    
    if (state.isRotating) {
        resumeRotation();
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        pauseBtn.classList.remove('paused');
    } else {
        pauseRotation();
        pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        pauseBtn.classList.add('paused');
    }
}

function changeSpeed() {
    const speeds = ['slow', 'normal', 'fast'];
    const currentIndex = speeds.indexOf(state.currentSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    state.currentSpeed = speeds[nextIndex];
    
    // CSS 클래스 변경
    circle.classList.remove('slow', 'fast');
    if (state.currentSpeed !== 'normal') {
        circle.classList.add(state.currentSpeed);
    }
    
    // 속도 표시 업데이트
    const speedIndicator = speedBtn.querySelector('.speed-indicator');
    const speedMultipliers = { slow: '0.5x', normal: '1x', fast: '2x' };
    speedIndicator.textContent = speedMultipliers[state.currentSpeed];
    
    // 버튼 애니메이션
    speedBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        speedBtn.style.transform = '';
    }, 100);
}

// ============================================
// 네비게이션 함수
// ============================================
function navigateToFace(index) {
    const angle = index * 45; // 8개 면이므로 45도씩
    
    // 목표 각도로 회전
    circle.style.animation = 'none';
    circle.style.transform = `rotateY(-${angle}deg)`;
    
    // 네비게이션 버튼 활성화 상태 업데이트
    navButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    
    state.currentFace = index;
    
    // 애니메이션 재시작
    setTimeout(() => {
        if (state.isRotating) {
            circle.style.animation = '';
        }
    }, 1000);
}

function rotateToNext() {
    const nextFace = (state.currentFace + 1) % 8;
    navigateToFace(nextFace);
}

function rotateToPrevious() {
    const prevFace = (state.currentFace - 1 + 8) % 8;
    navigateToFace(prevFace);
}

// ============================================
// 키보드 단축키 처리
// ============================================
function handleKeyboard(e) {
    switch(e.key) {
        case ' ':
        case 'Spacebar':
            e.preventDefault();
            toggleRotation();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            rotateToPrevious();
            break;
        case 'ArrowRight':
            e.preventDefault();
            rotateToNext();
            break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
            e.preventDefault();
            navigateToFace(parseInt(e.key) - 1);
            break;
        case 's':
        case 'S':
            e.preventDefault();
            changeSpeed();
            break;
        case 'h':
        case 'H':
            e.preventDefault();
            keyboardHelp.classList.toggle('visible');
            break;
    }
}

// ============================================
// Intersection Observer (성능 최적화)
// ============================================
function setupIntersectionObserver() {
    // 비디오 요소가 있는 경우에만 작동
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // 비디오 자동 재생 (있는 경우에만)
                const videos = entry.target.querySelectorAll('video');
                videos.forEach(video => {
                    if (video.paused) {
                        video.play().catch(e => {
                            // 비디오 재생 실패는 무시 (이미지가 없을 수 있음)
                            console.log('Video play skipped:', e.message);
                        });
                    }
                });
            } else {
                // 비디오 일시정지 (성능 최적화)
                const videos = entry.target.querySelectorAll('video');
                videos.forEach(video => {
                    if (!video.paused) {
                        video.pause();
                    }
                });
            }
        });
    }, options);

    articles.forEach(article => {
        observer.observe(article);
    });
}

// ============================================
// 유틸리티 함수
// ============================================

// 디바운스 함수 (성능 최적화)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 윈도우 리사이즈 핸들러
const handleResize = debounce(() => {
    // 모바일/데스크톱 전환 시 레이아웃 조정
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        // 모바일에서는 회전 속도 느리게
        if (state.currentSpeed === 'fast') {
            changeSpeed();
        }
    }
}, 250);

window.addEventListener('resize', handleResize);

// ============================================
// 접근성 향상
// ============================================
function enhanceAccessibility() {
    // 키보드 네비게이션을 위한 tabindex 추가
    articles.forEach((article, index) => {
        article.setAttribute('tabindex', '0');
        article.setAttribute('role', 'button');
        article.setAttribute('aria-label', `Section ${index + 1}`);
    });

    // ARIA 속성 추가
    circle.setAttribute('aria-live', 'polite');
    circle.setAttribute('aria-atomic', 'false');
}

// ============================================
// 로컬 스토리지 활용 (사용자 설정 저장)
// ============================================
function saveUserPreferences() {
    const preferences = {
        speed: state.currentSpeed,
        isRotating: state.isRotating,
        currentFace: state.currentFace
    };
    
    try {
        localStorage.setItem('cube-preferences', JSON.stringify(preferences));
    } catch (e) {
        console.warn('LocalStorage not available:', e);
    }
}

function loadUserPreferences() {
    try {
        const saved = localStorage.getItem('cube-preferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            state.currentSpeed = preferences.speed || 'normal';
            state.isRotating = preferences.isRotating !== undefined ? preferences.isRotating : true;
            state.currentFace = preferences.currentFace || 0;
            
            // 설정 적용
            if (state.currentSpeed !== 'normal') {
                circle.classList.add(state.currentSpeed);
            }
            if (!state.isRotating) {
                toggleRotation();
            }
            navigateToFace(state.currentFace);
        }
    } catch (e) {
        console.warn('Failed to load preferences:', e);
    }
}

// 설정 변경 시 자동 저장
window.addEventListener('beforeunload', saveUserPreferences);

// ============================================
// 이스터 에그: 콘솔 메시지
// ============================================
function showEasterEgg() {
    console.log('%c🤖 NextByte 3D Cube', 'font-size: 20px; font-weight: bold; color: #00ffff;');
    console.log('%c키보드 단축키:', 'font-size: 14px; color: #fff;');
    console.log('%c• Space: 일시정지/재생', 'color: #ccc;');
    console.log('%c• ← →: 섹션 이동', 'color: #ccc;');
    console.log('%c• 1-8: 바로가기', 'color: #ccc;');
    console.log('%c• S: 속도 변경', 'color: #ccc;');
    console.log('%c• H: 도움말 표시', 'color: #ccc;');
}

// ============================================
// 초기화 실행
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    init();
    enhanceAccessibility();
    loadUserPreferences();
    showEasterEgg();
    
    console.log('🚀 NextByte Cube 준비 완료!');
});

// ============================================
// 에러 핸들링
// ============================================
window.addEventListener('error', (e) => {
    // 이미지/비디오 로딩 실패는 무시
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        console.log('리소스 로딩 실패 (정상):', e.target.src);
        return;
    }
    console.error('Error occurred:', e.error);
});

// ============================================
// 내보내기 (모듈 시스템 사용 시)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        navigateToFace,
        toggleRotation,
        changeSpeed
    };
}