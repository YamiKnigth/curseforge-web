document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const mcVersionSelect = document.getElementById('mc-version-select');
    const modloaderSelect = document.getElementById('modloader-select');
    const modloaderVersionSelect = document.getElementById('modloader-version-select');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const searchResultsList = document.getElementById('search-results');
    const modpackList = document.getElementById('modpack-list');
    const loader = document.getElementById('loader');
    const saveButton = document.getElementById('save-button');
    const exportButton = document.getElementById('export-button');
    const modpackNameInput = document.getElementById('modpack-name');

    // --- VALIDACIÓN DE ELEMENTOS ---
    const requiredElements = {
        mcVersionSelect, modloaderSelect, modloaderVersionSelect, searchButton, searchInput,
        searchResultsList, modpackList, loader, saveButton, exportButton, modpackNameInput
    };

    for (const key in requiredElements) {
        if (requiredElements[key] === null) {
            const errorMessage = `Error crítico: El elemento HTML con ID "${key}" no fue encontrado. Verifica que el ID en tu archivo index.html sea correcto.`;
            console.error(errorMessage);
            document.body.innerHTML = `<div style="padding: 2rem; font-family: sans-serif; color: #ff6b6b; background-color: #2a2a2a; border-radius: 8px;"><h1>Error de Configuración</h1><p>${errorMessage}</p></div>`;
            return;
        }
    }

    // --- ESTADO DE LA APLICACIÓN ---
    let currentModpack = [];

    // --- FUNCIONES ---

    const toggleLoader = (show) => {
        loader.classList.toggle('hidden', !show);
    };

    const apiCall = async (action, params = {}) => {
        const urlParams = new URLSearchParams({ action, ...params });
        const url = `api_handler.php?${urlParams}`;
        let response;
        try {
            response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Request failed for action "${action}" with status ${response.status}:`, errorText);
                throw new Error(`Error del servidor: ${response.status}`);
            }
            const responseData = await response.json();
            return responseData;
        } catch (error) {
            if (error instanceof SyntaxError && response) {
                const rawText = await response.text();
                console.error(`La respuesta del servidor para la acción "${action}" no es un JSON válido. Contenido:`, rawText);
                alert(`Error: El servidor devolvió una respuesta inesperada. Revisa la consola para ver el contenido.`);
            } else {
                console.error(`Falló la petición a la API para la acción "${action}":`, error);
                alert('Hubo un error de red o del servidor. Revisa la consola para más detalles.');
            }
        }
    };

    const loadMinecraftVersions = async () => {
        const versionsData = await apiCall('getMinecraftVersions');
        if (versionsData && versionsData.data) {
            mcVersionSelect.innerHTML = '<option value="">Selecciona una versión</option>';
            const filteredVersions = versionsData.data.filter(v => 
                v.gameVersionStatus === 1 && 
                !v.versionString.includes('-')
            );
            filteredVersions.forEach(version => {
                const option = document.createElement('option');
                option.value = version.versionString;
                option.textContent = version.versionString;
                mcVersionSelect.appendChild(option);
            });
        }
    };

const loadModLoaders = async () => {
    console.log('Cargando modloaders...'); // <-- Agrega este log
    modloaderSelect.innerHTML = '<option value="">Cargando...</option>';
    const loadersData = await apiCall('getModLoaders');
    console.log('Respuesta de getModLoaders:', loadersData); // <-- Y este log
    if (loadersData && loadersData.data) {
        modloaderSelect.innerHTML = '<option value="">Selecciona un modloader</option>';
        loadersData.data.forEach(loader => {
             if(loader.primary){
                const option = document.createElement('option');
                option.value = loader.name;
                option.textContent = loader.name;
                modloaderSelect.appendChild(option);
             }
        });
        modloaderSelect.disabled = false;
    } else {
        modloaderSelect.innerHTML = '<option value="">No se encontraron modloaders</option>';
        modloaderSelect.disabled = true;
    }
};

    const loadModloaderVersions = async (gameVersion, modloaderName) => {
        modloaderVersionSelect.innerHTML = '<option value="">Cargando...</option>';
        const versionsData = await apiCall('getModloaderVersions', { gameVersion });
        
        if (versionsData && versionsData.data) {
            modloaderVersionSelect.innerHTML = '<option value="">Selecciona la versión del modloader</option>';
            const filtered = versionsData.data.filter(v => v.name.toLowerCase().startsWith(modloaderName.toLowerCase()));
            
            if (filtered.length > 0) {
                 // Mostramos solo la más reciente "latest" si está disponible
                const latest = filtered.find(v => v.latest);
                if (latest) {
                    const option = document.createElement('option');
                    option.value = latest.name;
                    option.textContent = `${latest.name} (Recomendada)`;
                    modloaderVersionSelect.appendChild(option);
                }
                // Y luego el resto
                filtered.forEach(v => {
                    if (!v.latest) {
                        const option = document.createElement('option');
                        option.value = v.name;
                        option.textContent = v.name;
                        modloaderVersionSelect.appendChild(option);
                    }
                });
            } else {
                modloaderVersionSelect.innerHTML = '<option value="">No hay versiones compatibles</option>';
            }
            modloaderVersionSelect.disabled = false;
        }
    };

    const displaySearchResults = (modsData) => {
        searchResultsList.innerHTML = '';
        if (!modsData || !modsData.data || modsData.data.length === 0) {
            searchResultsList.innerHTML = '<li>No se encontraron mods.</li>';
            return;
        }
        modsData.data.forEach(mod => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="mod-info">
                    <h4>${mod.name}</h4>
                    <p>${mod.summary}</p>
                </div>
                <button class="btn add-mod-btn" data-mod-id="${mod.id}" data-mod-name="${mod.name}">Añadir</button>
            `;
            searchResultsList.appendChild(li);
        });
    };
    
    const renderModpackList = () => {
        modpackList.innerHTML = '';
        if (currentModpack.length === 0) {
            modpackList.innerHTML = '<li>Añade mods desde la búsqueda.</li>';
            saveButton.disabled = true;
            exportButton.disabled = true;
            return;
        }
        currentModpack.forEach(mod => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${mod.name}</span>
                <button class="btn remove-mod-btn" data-mod-id="${mod.id}">Quitar</button>
            `;
            modpackList.appendChild(li);
        });
        saveButton.disabled = false;
        exportButton.disabled = false;
    };

    // --- EVENT LISTENERS ---

    mcVersionSelect.addEventListener('change', () => {
        const selectedVersion = mcVersionSelect.value;
        modloaderVersionSelect.innerHTML = '<option value="">Selecciona un modloader</option>';
        modloaderVersionSelect.disabled = true;
        if (selectedVersion) {
            loadModLoaders();
        } else {
            modloaderSelect.innerHTML = '<option value="">Selecciona una versión de MC</option>';
            modloaderSelect.disabled = true;
        }
    });

    modloaderSelect.addEventListener('change', () => {
        const selectedVersion = mcVersionSelect.value;
        const selectedModloader = modloaderSelect.value;
        if (selectedVersion && selectedModloader) {
            loadModloaderVersions(selectedVersion, selectedModloader);
        } else {
            modloaderVersionSelect.innerHTML = '<option value="">Selecciona un modloader</option>';
            modloaderVersionSelect.disabled = true;
        }
    });

    searchButton.addEventListener('click', async () => {
        const gameVersion = mcVersionSelect.value;
        const modloader = modloaderSelect.value;
        const modloaderVersion = modloaderVersionSelect.value;
        const searchTerm = searchInput.value.trim();

        if (!gameVersion || !modloader || !modloaderVersion) {
            alert('Por favor, completa todos los selectores de versión antes de buscar.');
            return;
        }
        if (!searchTerm) {
            alert('Por favor, escribe el nombre de un mod para buscar.');
            return;
        }

        toggleLoader(true);
        searchResultsList.innerHTML = '';
        const params = { 
            gameVersion: gameVersion, 
            searchFilter: searchTerm,
            modloader: modloader // La API busca por tipo (Forge/Fabric), no por versión específica
        };
        const mods = await apiCall('searchMods', params);
        toggleLoader(false);
        if(mods) displaySearchResults(mods);
    });
    
    searchResultsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-mod-btn')) {
            const modId = parseInt(e.target.dataset.modId, 10);
            if (currentModpack.some(mod => mod.id === modId)) {
                alert('Este mod ya está en tu paquete.');
                return;
            }
            const mod = { id: modId, name: e.target.dataset.modName };
            currentModpack.push(mod);
            renderModpackList();
        }
    });

    modpackList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-mod-btn')) {
            const modId = parseInt(e.target.dataset.modId, 10);
            currentModpack = currentModpack.filter(mod => mod.id !== modId);
            renderModpackList();
        }
    });

    // --- INICIALIZACIÓN ---
    const init = () => {
        loadMinecraftVersions();
        renderModpackList();
    };

    init();
});

