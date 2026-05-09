// --- Basculement Clair/Sombre ---
const themeToggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;

if (localStorage.getItem('theme') === 'dark') {
    root.setAttribute('data-theme', 'dark');
}

themeToggleBtn.addEventListener('click', () => {
    if (root.getAttribute('data-theme') === 'dark') {
        root.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});

// --- TRAINÉE DU CURSEUR & PARALLAXE ---
// Création du curseur principal
const cursorMain = document.createElement('div');
cursorMain.classList.add('cursor-main');
document.body.appendChild(cursorMain);

// Création des points de la traînée (Trail)
const trailCount = 8; // Nombre de points derrière la souris
const trailDots = [];

for (let i = 0; i < trailCount; i++) {
    const dot = document.createElement('div');
    dot.classList.add('cursor-trail');
    document.body.appendChild(dot);
    trailDots.push({ element: dot, x: window.innerWidth/2, y: window.innerHeight/2 });
}

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isHovering = false;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Déplacement direct du point principal
    cursorMain.style.left = `${mouseX}px`;
    cursorMain.style.top = `${mouseY}px`;

    // Effet Parallaxe sur le fond quadrillé
    const moveX = (mouseX / window.innerWidth - 0.5) * 30; 
    const moveY = (mouseY / window.innerHeight - 0.5) * 30;
    document.documentElement.style.setProperty('--mouse-x', `${moveX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${moveY}px`);
});

// Boucle d'animation pour lisser la traînée (Interpolation Linéaire - Lerp)
function animateTrail() {
    let targetX = mouseX;
    let targetY = mouseY;

    trailDots.forEach((dot, index) => {
        // Vitesse à laquelle les points rattrapent la souris (plus bas = plus lent)
        const easing = 0.35; 
        
        // Calcul de l'interpolation
        dot.x += (targetX - dot.x) * easing;
        dot.y += (targetY - dot.y) * easing;

        // Application au DOM
        dot.element.style.left = `${dot.x}px`;
        dot.element.style.top = `${dot.y}px`;
        
        // Les points deviennent de plus en plus petits et transparents
        const scale = (trailCount - index) / trailCount;
        dot.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
        
        // Si on survole un lien, on cache la traînée en douceur
        dot.element.style.opacity = isHovering ? 0 : scale;

        // Le prochain point suivra le point actuel
        targetX = dot.x;
        targetY = dot.y;
    });

    requestAnimationFrame(animateTrail);
}
animateTrail();

// Ajout de la classe "hovering" au survol des éléments interactifs
const interactiveElements = document.querySelectorAll('a, button, input, textarea');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        isHovering = true;
        cursorMain.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
        isHovering = false;
        cursorMain.classList.remove('hovering');
    });
});

// --- Apparition Progressive au Scroll (Intersection Observer) ---
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optionnel : dé-commenter la ligne dessous pour ne jouer l'animation qu'une fois
            // observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});

// --- Envoi du formulaire (AJAX) ---
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

form.addEventListener('submit', async function(event) {
    event.preventDefault();
    formStatus.style.display = 'block';
    formStatus.style.color = 'var(--text-muted)';
    formStatus.textContent = 'Transmission en cours...';

    const data = new FormData(event.target);
    
    try {
        const response = await fetch(event.target.action, {
            method: form.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            formStatus.style.color = '#10b981'; 
            formStatus.textContent = 'Requête transmise avec succès !';
            form.reset();
            setTimeout(() => { formStatus.style.display = 'none'; }, 5000);
        } else {
            formStatus.style.color = '#ef4444'; 
            formStatus.textContent = 'Échec de la transmission. Vérifiez vos informations.';
        }
    } catch (error) {
        formStatus.style.color = '#ef4444'; 
        formStatus.textContent = 'Erreur réseau. Impossible de contacter le serveur.';
    }
});