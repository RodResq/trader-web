export function setupLinkActivateManager() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link[href]');
    const currentPath = window.location.pathname;
    
    const linkMap = new Map();
    let activeLink = null;
    
    for (const link of navLinks) {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href !== '#') {
            linkMap.set(href, link);
        }
    }
    
    activeLink = linkMap.get(currentPath);
    if (!activeLink) {
        for (const [href, link] of linkMap) {
            if (currentPath.includes(href)) {
                activeLink = link;
                break; 
            }
        }
    }
    
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    return activeLink; 
}

function initOptimizedNavigation() {
    let navLinksCache = null;
    let isInitialized = false;
    
    function getCachedNavLinks() {
        if (!navLinksCache) {
            navLinksCache = document.querySelectorAll('.sidebar .nav-link[href]');
        }
        return navLinksCache;
    }
    
    function setActiveLink() {
        return setupLinkActivateManager();
    }
    
    function handleNavClick(event) {
        const target = event.target.closest('.nav-link[href]');
        if (!target) return;
        
        const href = target.getAttribute('href');
        if (!href || href === '#') return;
        
        getCachedNavLinks().forEach(link => link.classList.remove('active'));
        target.classList.add('active');
    }
    
    let popstateTimeout = null;
    function handlePopstate() {
        if (popstateTimeout) return;
        
        popstateTimeout = setTimeout(() => {
            setActiveLink();
            popstateTimeout = null;
        }, 16);
    }
    
    if (!isInitialized) {
        document.querySelector('.sidebar')?.addEventListener('click', handleNavClick);
        window.addEventListener('popstate', handlePopstate);
        isInitialized = true;
    }
    
    return setActiveLink();
}

window.setActiveNavLink = function(href) {
    const targetLink = document.querySelector(`.sidebar .nav-link[href="${CSS.escape(href)}"]`);
    
    if (targetLink) {
        document.querySelectorAll('.sidebar .nav-link.active')
            .forEach(link => link.classList.remove('active'));
        targetLink.classList.add('active');
        return targetLink;
    }
    return null;
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizedNavigation);
} else {
    initOptimizedNavigation();
}