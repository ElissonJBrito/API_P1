const SUA_CHAVE_API = '0d101e06ec1be4cdff2266288ecb87b5';
let filmesSeries = [];
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
let paginaAtual = 1;
let carregando = false;

async function buscarFilmesSeries() {
    if (carregando) return;
    carregando = true;

    try {
        const response = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${SUA_CHAVE_API}&page=${paginaAtual}`);
        const data = await response.json();
        filmesSeries = [...filmesSeries, ...data.results];
        exibirFilmesSeries(filmesSeries);
        paginaAtual++; 
    } catch (error) {
        console.error('Erro ao buscar filmes e séries', error);
    } finally {
        carregando = false;
    }
}

function exibirFilmesSeries(lista) {
    const listaFilmesSeries = document.getElementById('lista-filmes-series');
    listaFilmesSeries.innerHTML = ''; 
    lista.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('accordion-item');
        const titulo = item.title || item.name;

        li.innerHTML = `
            <div class="accordion-header">
                <span>${titulo}</span>
                <span class="favorite ${favoritos.includes(titulo) ? 'added' : 'not-added'}">★</span>
            </div>
            <div class="accordion-content">
                <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" alt="${titulo}">
                <p>${item.overview || 'Descrição não disponível'}</p>
            </div>
        `;

        li.querySelector('.accordion-header').addEventListener('click', () => toggleAcordeao(li));

        li.querySelector('.favorite').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorito(titulo, li.querySelector('.favorite'));
        });

        listaFilmesSeries.appendChild(li);
    });
}


function toggleAcordeao(item) {
    const content = item.querySelector('.accordion-content');
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
}


function toggleFavorito(titulo, favoritoElement) {
    const index = favoritos.indexOf(titulo);
    if (index === -1) {
        favoritos.push(titulo); 
        favoritoElement.classList.add('added');
        favoritoElement.classList.remove('not-added');
    } else {
        favoritos.splice(index, 1);  
        favoritoElement.classList.add('not-added');
        favoritoElement.classList.remove('added');
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos)); 
}


window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !carregando) {
        buscarFilmesSeries(); 
    }
});


const filtroInput = document.getElementById('filtro');
filtroInput.addEventListener('input', () => {
    const filtro = filtroInput.value.toLowerCase();
    const filmesFiltrados = filmesSeries.filter(item =>
        (item.title && item.title.toLowerCase().includes(filtro)) ||
        (item.name && item.name.toLowerCase().includes(filtro))
    );
    exibirFilmesSeries(filmesFiltrados);
});

document.getElementById('buscar-link').addEventListener('click', () => {
    document.getElementById('buscar-section').style.display = 'block';
    document.getElementById('favoritos-section').style.display = 'none';
});

document.getElementById('favoritos-link').addEventListener('click', () => {
    document.getElementById('buscar-section').style.display = 'none';
    document.getElementById('favoritos-section').style.display = 'block';
    exibirFavoritos(); 
});

function exibirFavoritos() {
    const listaFavoritos = document.getElementById('favoritos');
    listaFavoritos.innerHTML = '';


    const filmesFavoritos = filmesSeries.filter(item =>
        favoritos.includes(item.title) || favoritos.includes(item.name)
    );

    if (filmesFavoritos.length === 0) {
        listaFavoritos.innerHTML = '<h2>Você ainda não tem favoritos.</h2>';
        return;
    }

    filmesFavoritos.forEach(favorito => {
        const li = document.createElement('li');
        li.classList.add('accordion-item');
        const titulo = favorito.title || favorito.name;

        li.innerHTML = `
            <div class="accordion-header">
                <span>${titulo}</span>
                <span class="favorite added">★</span>
            </div>
            <div class="accordion-content">
                <img src="https://image.tmdb.org/t/p/w200${favorito.poster_path}" alt="${titulo}">
                <p>${favorito.overview || 'Descrição não disponível'}</p>
            </div>
        `;


        li.querySelector('.accordion-header').addEventListener('click', () => toggleAcordeao(li));

        listaFavoritos.appendChild(li);
    });
}

const menuIcon = document.getElementById('menu-icon');
const menu = document.getElementById('menu');

menuIcon.addEventListener('click', () => {
    menu.querySelector('ul').classList.toggle('show');
});


buscarFilmesSeries();
