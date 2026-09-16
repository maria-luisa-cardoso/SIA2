
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';

const defaultAvisos = [
    { 
        id: 1, 
        titulo: "Suspensão de Aulas - Feriado", 
        descricao: "Informamos que no próximo dia 15 não haverá expediente acadêmico devido ao feriado nacional.", 
        destaque: true, 
        tipo: "verde" 
    },
    { 
        id: 2, 
        titulo: "Feira de Tecnologia e Robótica", 
        descricao: "Participe da exposição de projetos embarcados no hall principal. Inscrições abertas!", 
        destaque: true, 
        tipo: "vermelho" 
    },
    { 
        id: 3, 
        titulo: "Rematrícula Aberta", 
        descricao: "O prazo para rematrícula se encerra na próxima sexta-feira. Não perca o prazo!", 
        destaque: false, 
        tipo: "" 
    },
    { 
        id: 4, 
        titulo: "Edital de Estágio", 
        descricao: "Vagas abertas para o laboratório de informática. Acesse o portal do aluno.", 
        destaque: false, 
        tipo: "" 
    }
];

const defaultCalendario = [
    { id: 1, data: "02/11", evento: "Feriado: Finados" },
    { id: 2, data: "10/11 a 14/11", evento: "Semana de Provas (P1)" },
    { id: 3, data: "15/11", evento: "Feriado: Proclamação da República" }
];


function getAvisos() {
    const data = localStorage.getItem('ifnmg_avisos');
    return data ? JSON.parse(data) : defaultAvisos;
}

function getCalendario() {
    const data = localStorage.getItem('ifnmg_calendario');
    return data ? JSON.parse(data) : defaultCalendario;
}

function setAvisos(data) {
    localStorage.setItem('ifnmg_avisos', JSON.stringify(data));
}

function setCalendario(data) {
    localStorage.setItem('ifnmg_calendario', JSON.stringify(data));
}



function renderContent() {
    const avisos = getAvisos();
    const calendario = getCalendario();


    
    const carouselContainer = document.getElementById('carousel-container');
    carouselContainer.querySelectorAll('.slide').forEach(s => s.remove());

    const destaques = avisos.filter(a => a.destaque);

    if (destaques.length === 0) {
        const slideVazio = document.createElement('div');
        slideVazio.className = 'slide slide-verde active';
        slideVazio.innerHTML = `<h1>Nenhum aviso em destaque</h1><p>Veja todos os avisos no mural.</p>`;
        carouselContainer.appendChild(slideVazio);
    } else {
        destaques.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = `slide ${item.tipo === 'vermelho' ? 'slide-vermelho' : 'slide-verde'} ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <span class="badge ${item.tipo === 'vermelho' ? 'urgencia-alta' : 'urgencia-media'}">Aviso Importante</span>
                <h1>${item.titulo}</h1>
                <p>${item.descricao}</p>
            `;
            carouselContainer.appendChild(slide);
        });
    }


    const avisosGrid = document.getElementById('avisos-grid');
    avisosGrid.innerHTML = '';
    avisos.forEach(item => {
        const card = document.createElement('div');
        card.className = `aviso-card ${item.destaque ? 'prioridade' : ''}`;
        
        let deleteBtn = isAdmin ? `<button class="btn-delete" onclick="removerAviso(${item.id})">🗑️ Excluir</button>` : '';
        
        card.innerHTML = `
            <h3>${item.titulo}</h3>
            <p>${item.descricao}</p>
            ${deleteBtn}
        `;
        avisosGrid.appendChild(card);
    });


    const calLista = document.getElementById('calendario-lista');
    calLista.innerHTML = '';
    calendario.forEach(item => {
        const li = document.createElement('li');
        let deleteBtn = isAdmin ? `<button class="btn-delete" onclick="removerCalendario(${item.id})">🗑️ Excluir</button>` : '';

        li.innerHTML = `
            <strong>${item.data}</strong> - ${item.evento}
            ${deleteBtn}
        `;
        calLista.appendChild(li);
    });

    currentSlide = 0;
    resetAutoSlide();
}


document.addEventListener('DOMContentLoaded', () => {
    if (isAdmin) {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.admin-only.btn-add').forEach(el => el.style.display = 'inline-block');
    }
    renderContent();
});


function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();


function changeView(viewId, btnElement) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(viewId).classList.add('active');
    btnElement.classList.add('active');
}

let currentSlide = 0;
let autoSlideTimer;

function getSlides() {
    return document.querySelectorAll('.slide');
}

function showSlide(index) {
    const slides = getSlides();
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
    resetAutoSlide();
}

function prevSlide() {
    showSlide(currentSlide - 1);
    resetAutoSlide();
}

function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 10000);
}


function abrirModalAviso() {
    const titulo = prompt("Título do novo aviso:");
    if (!titulo) return;
    const descricao = prompt("Descrição do aviso:");
    if (!descricao) return;
    const destaque = confirm("Deseja destacar este aviso na Tela Inicial (Carrossel)?");

    const avisos = getAvisos();
    avisos.unshift({
        id: Date.now(),
        titulo: titulo,
        descricao: descricao,
        destaque: destaque,
        tipo: destaque ? "verde" : ""
    });

    setAvisos(avisos);
    renderContent();
    alert("Aviso salvo com sucesso!");
}

function removerAviso(id) {
    if (confirm("Tem certeza que deseja excluir este aviso?")) {
        const avisos = getAvisos().filter(a => a.id !== id);
        setAvisos(avisos);
        renderContent();
    }
}

function abrirModalCalendario() {
    const data = prompt("Digite a data (ex: 25/11):");
    if (!data) return;
    const evento = prompt("Digite o nome do evento:");
    if (!evento) return;

    const calendario = getCalendario();
    calendario.push({
        id: Date.now(),
        data: data,
        evento: evento
    });

    setCalendario(calendario);
    renderContent();
    alert("Evento adicionado com sucesso!");
}

function removerCalendario(id) {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
        const calendario = getCalendario().filter(c => c.id !== id);
        setCalendario(calendario);
        renderContent();
    }
}