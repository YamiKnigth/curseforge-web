/**
 * script.js
 * Lógica del frontend para el gestor de modpacks de CurseForge
 * Maneja autenticación, búsqueda de mods, CRUD de modpacks e importación/exportación
 */

// =============================================================================
// VARIABLES GLOBALES Y ESTADO
// =============================================================================

const state = {
    currentUser: null,
    currentModpack: null,
    modpackMods: [],
    minecraftVersions: [],
    isEditing: false
};

// =============================================================================
// UTILIDADES
// =============================================================================

/**
 * Realiza una petición AJAX al backend
 */
async function apiRequest(action, data = {}, method = 'POST') {
    try {
        const url = `/api/?action=${action}`;
        const options = {
            method: method,
            credentials: 'same-origin'
        };

        if (method === 'POST' && data) {
            options.body = data instanceof FormData ? data : new URLSearchParams(data);
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error en la petición');
        }

        return result;
    } catch (error) {
        console.error('Error en apiRequest:', error);
        throw error;
    }
}

/**
 * Muestra una notificación toast
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Muestra/oculta el loader
 */
function toggleLoader(show, elementId = 'search-loader') {
    const loader = document.getElementById(elementId);
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

/**
 * Formatea números grandes (ej: 1234567 -> 1.2M)
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Formatea fecha
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// =============================================================================
// AUTENTICACIÓN
// =============================================================================

/**
 * Inicializa los eventos de autenticación
 */
function initAuth() {
    // Cambiar entre login y registro
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('register-form').classList.add('active');
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').classList.remove('active');
        document.getElementById('login-form').classList.add('active');
    });

    // Formulario de login
    document.getElementById('login-form-element').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const result = await apiRequest('login', formData);
            if (result.success) {
                state.currentUser = result.user;
                showAppScreen();
                showToast('Sesión iniciada correctamente', 'success');
                loadUserModpacks();
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Formulario de registro
    document.getElementById('register-form-element').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const password = formData.get('password');
        const passwordConfirm = formData.get('password_confirm');

        if (password !== passwordConfirm) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const result = await apiRequest('register', formData);
            if (result.success) {
                state.currentUser = result.user;
                showAppScreen();
                showToast('Registro exitoso. ¡Bienvenido!', 'success');
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await apiRequest('logout');
            state.currentUser = null;
            state.currentModpack = null;
            state.modpackMods = [];
            showAuthScreen();
            showToast('Sesión cerrada', 'info');
        } catch (error) {
            showToast('Error al cerrar sesión', 'error');
        }
    });
}

/**
 * Verifica si hay una sesión activa
 */
async function checkSession() {
    try {
        const result = await apiRequest('check_session', {}, 'GET');
        if (result.authenticated) {
            state.currentUser = result.user;
            showAppScreen();
            loadUserModpacks();
            loadMinecraftVersions();
        } else {
            showAuthScreen();
        }
    } catch (error) {
        showAuthScreen();
    }
}

/**
 * Muestra la pantalla de autenticación
 */
function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
}

/**
 * Muestra la pantalla principal de la aplicación
 */
function showAppScreen() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    document.getElementById('username-display').textContent = state.currentUser.username;
}

// =============================================================================
// GESTIÓN DE MODPACKS
// =============================================================================

/**
 * Carga los modpacks del usuario
 */
async function loadUserModpacks() {
    try {
        const result = await apiRequest('get_modpacks', {}, 'GET');
        if (result.success) {
            renderModpackList(result.modpacks);
        }
    } catch (error) {
        showToast('Error al cargar modpacks', 'error');
    }
}

/**
 * Renderiza la lista de modpacks
 */
function renderModpackList(modpacks) {
    const container = document.getElementById('modpack-list');
    
    if (modpacks.length === 0) {
        container.innerHTML = '<p class="empty-message">No tienes modpacks creados</p>';
        return;
    }

    container.innerHTML = modpacks.map(modpack => `
        <div class="modpack-item" data-id="${modpack.id}">
            <h4>${modpack.name}</h4>
            <p>Minecraft ${modpack.minecraft_version}</p>
            <p class="text-muted">${formatDate(modpack.created_at)}</p>
        </div>
    `).join('');

    // Agregar eventos de clic
    container.querySelectorAll('.modpack-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            loadModpack(id);
        });
    });
}

/**
 * Carga un modpack específico
 */
async function loadModpack(id) {
    try {
        const result = await apiRequest('get_modpack', { modpack_id: id }, 'GET');
        if (result.success) {
            state.currentModpack = result.modpack;
            state.modpackMods = result.modpack.mods || [];
            state.isEditing = true;
            showEditorView();
            populateModpackForm();
            loadModpackMods();
            
            // Marcar como activo en la lista
            document.querySelectorAll('.modpack-item').forEach(item => {
                item.classList.toggle('active', item.dataset.id == id);
            });
        }
    } catch (error) {
        showToast('Error al cargar modpack', 'error');
    }
}

/**
 * Muestra la vista del editor
 */
function showEditorView() {
    document.getElementById('empty-view').style.display = 'none';
    document.getElementById('editor-view').style.display = 'block';
    document.getElementById('export-btn').disabled = !state.isEditing;
}

/**
 * Muestra la vista vacía
 */
function showEmptyView() {
    document.getElementById('empty-view').style.display = 'block';
    document.getElementById('editor-view').style.display = 'none';
    document.getElementById('export-btn').disabled = true;
}

/**
 * Puebla el formulario con los datos del modpack
 */
function populateModpackForm() {
    if (state.currentModpack) {
        document.getElementById('modpack-name-input').value = state.currentModpack.name;
        document.getElementById('modpack-description-input').value = state.currentModpack.description || '';
        document.getElementById('minecraft-version-select').value = state.currentModpack.minecraft_version;
        document.getElementById('delete-modpack-btn').style.display = 'inline-block';
    } else {
        document.getElementById('modpack-name-input').value = '';
        document.getElementById('modpack-description-input').value = '';
        document.getElementById('minecraft-version-select').value = '';
        document.getElementById('delete-modpack-btn').style.display = 'none';
    }
}

/**
 * Carga los mods del modpack actual
 */
async function loadModpackMods() {
    const container = document.getElementById('modpack-mods');
    const countSpan = document.getElementById('mod-count');
    
    if (state.modpackMods.length === 0) {
        container.innerHTML = '<p class="empty-message">Añade mods desde la búsqueda</p>';
        countSpan.textContent = '0';
        return;
    }

    countSpan.textContent = state.modpackMods.length;
    
    // Obtener detalles de cada mod
    container.innerHTML = '<div class="loader"></div>';
    
    try {
        const modDetails = await Promise.all(
            state.modpackMods.map(mod => 
                apiRequest('get_mod_details', { modId: mod.curseforge_project_id }, 'GET')
            )
        );

        container.innerHTML = modDetails.map((result, index) => {
            if (result.data) {
                const mod = result.data;
                const modData = state.modpackMods[index];
                return createModCard(mod, true, modData.required);
            }
            return '';
        }).join('');
    } catch (error) {
        container.innerHTML = '<p class="empty-message">Error al cargar los mods</p>';
        showToast('Error al cargar detalles de los mods', 'error');
    }
}

/**
 * Guarda el modpack
 */
async function saveModpack() {
    const name = document.getElementById('modpack-name-input').value.trim();
    const description = document.getElementById('modpack-description-input').value.trim();
    const minecraftVersion = document.getElementById('minecraft-version-select').value;

    if (!name || !minecraftVersion) {
        showToast('Por favor completa el nombre y la versión de Minecraft', 'warning');
        return;
    }

    const mods = state.modpackMods.map(mod => ({
        projectId: mod.curseforge_project_id,
        fileId: mod.curseforge_file_id,
        required: mod.required
    }));

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('minecraft_version', minecraftVersion);
    formData.append('mods', JSON.stringify(mods));

    try {
        let result;
        if (state.isEditing && state.currentModpack) {
            formData.append('modpack_id', state.currentModpack.id);
            result = await apiRequest('update_modpack', formData);
        } else {
            result = await apiRequest('create_modpack', formData);
        }

        if (result.success) {
            showToast('Modpack guardado exitosamente', 'success');
            loadUserModpacks();
            
            if (!state.isEditing) {
                state.isEditing = true;
                state.currentModpack = { id: result.modpack_id, name };
            }
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

/**
 * Elimina el modpack actual
 */
async function deleteModpack() {
    if (!confirm('¿Estás seguro de que deseas eliminar este modpack?')) {
        return;
    }

    const formData = new FormData();
    formData.append('modpack_id', state.currentModpack.id);

    try {
        const result = await apiRequest('delete_modpack', formData);
        if (result.success) {
            showToast('Modpack eliminado', 'success');
            state.currentModpack = null;
            state.modpackMods = [];
            state.isEditing = false;
            showEmptyView();
            loadUserModpacks();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// =============================================================================
// BÚSQUEDA DE MODS
// =============================================================================

/**
 * Carga las versiones de Minecraft
 */
async function loadMinecraftVersions() {
    try {
        const result = await apiRequest('get_minecraft_versions', {}, 'GET');
        if (result.data) {
            state.minecraftVersions = result.data.filter(v => 
                v.versionString && !v.versionString.includes('-')
            );
            
            const select = document.getElementById('minecraft-version-select');
            select.innerHTML = '<option value="">Selecciona una versión</option>' +
                state.minecraftVersions.map(v => 
                    `<option value="${v.versionString}">${v.versionString}</option>`
                ).join('');
        }
    } catch (error) {
        showToast('Error al cargar versiones de Minecraft', 'error');
    }
}

/**
 * Busca mods en CurseForge
 */
async function searchMods() {
    const searchTerm = document.getElementById('mod-search-input').value.trim();
    const minecraftVersion = document.getElementById('minecraft-version-select').value;
    const resultsContainer = document.getElementById('search-results');

    if (!searchTerm) {
        showToast('Por favor ingresa un término de búsqueda', 'warning');
        return;
    }

    if (!minecraftVersion) {
        showToast('Por favor selecciona una versión de Minecraft', 'warning');
        return;
    }

    toggleLoader(true);
    resultsContainer.innerHTML = '';

    try {
        const result = await apiRequest('search_mods', {
            searchTerm,
            minecraftVersion,
            pageSize: 20
        }, 'GET');

        toggleLoader(false);

        if (result.data && result.data.length > 0) {
            resultsContainer.innerHTML = result.data.map(mod => 
                createModCard(mod, false)
            ).join('');
        } else {
            resultsContainer.innerHTML = '<p class="empty-message">No se encontraron mods</p>';
        }
    } catch (error) {
        toggleLoader(false);
        resultsContainer.innerHTML = '<p class="empty-message">Error en la búsqueda</p>';
        showToast('Error al buscar mods', 'error');
    }
}

/**
 * Crea una tarjeta de mod
 */
function createModCard(mod, isInModpack = false, isRequired = true) {
    const logo = mod.logo?.thumbnailUrl || mod.logo?.url || 'https://via.placeholder.com/64';
    const author = mod.authors?.[0]?.name || 'Desconocido';
    const downloads = formatNumber(mod.downloadCount || 0);
    const summary = mod.summary || 'Sin descripción';

    const addButton = isInModpack 
        ? `<button class="btn btn-danger" onclick="removeModFromModpack(${mod.id})">Eliminar</button>`
        : `<button class="btn btn-success" onclick="addModToModpack(${mod.id}, '${mod.name.replace(/'/g, "\\'")}')">Añadir</button>`;

    return `
        <div class="mod-card">
            <div class="mod-card-header">
                <img src="${logo}" alt="${mod.name}" class="mod-icon">
                <div class="mod-info">
                    <h3>${mod.name}</h3>
                    <p class="mod-author">por ${author}</p>
                </div>
            </div>
            <p class="mod-description">${summary}</p>
            <div class="mod-stats">
                <span>📥 ${downloads}</span>
                <span>📅 ${formatDate(mod.dateModified || mod.dateCreated)}</span>
            </div>
            <div class="mod-actions">
                ${addButton}
                <button class="btn btn-secondary" onclick="showModDetails(${mod.id})">Ver detalles</button>
            </div>
        </div>
    `;
}

/**
 * Añade un mod al modpack
 */
async function addModToModpack(modId, modName) {
    const minecraftVersion = document.getElementById('minecraft-version-select').value;

    if (!minecraftVersion) {
        showToast('Selecciona una versión de Minecraft primero', 'warning');
        return;
    }

    // Verificar si ya está añadido
    if (state.modpackMods.some(mod => mod.curseforge_project_id === modId)) {
        showToast('Este mod ya está en el modpack', 'info');
        return;
    }

    try {
        // Obtener archivos del mod para la versión seleccionada
        const result = await apiRequest('get_mod_files', {
            modId,
            minecraftVersion
        }, 'GET');

        if (result.data && result.data.length > 0) {
            // Usar el archivo más reciente
            const latestFile = result.data[0];
            
            state.modpackMods.push({
                curseforge_project_id: modId,
                curseforge_file_id: latestFile.id,
                required: true
            });

            showToast(`${modName} añadido al modpack`, 'success');
            loadModpackMods();
        } else {
            showToast('No hay archivos disponibles para esta versión', 'warning');
        }
    } catch (error) {
        showToast('Error al añadir el mod', 'error');
    }
}

/**
 * Elimina un mod del modpack
 */
window.removeModFromModpack = function(modId) {
    state.modpackMods = state.modpackMods.filter(
        mod => mod.curseforge_project_id !== modId
    );
    loadModpackMods();
    showToast('Mod eliminado del modpack', 'info');
};

/**
 * Muestra los detalles de un mod
 */
window.showModDetails = async function(modId) {
    const modal = document.getElementById('mod-modal');
    const modalBody = document.getElementById('mod-modal-body');
    
    modal.classList.add('active');
    modalBody.innerHTML = '<div class="loader"></div>';

    try {
        const result = await apiRequest('get_mod_details', { modId }, 'GET');
        
        if (result.data) {
            const mod = result.data;
            const logo = mod.logo?.url || 'https://via.placeholder.com/128';
            const author = mod.authors?.[0]?.name || 'Desconocido';
            const downloads = formatNumber(mod.downloadCount || 0);
            
            modalBody.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${logo}" alt="${mod.name}" style="max-width: 128px; border-radius: 8px;">
                    <h2>${mod.name}</h2>
                    <p class="text-muted">por ${author}</p>
                </div>
                <div>
                    <p><strong>Descargas:</strong> ${downloads}</p>
                    <p><strong>Última actualización:</strong> ${formatDate(mod.dateModified)}</p>
                    <p><strong>Descripción:</strong></p>
                    <p>${mod.summary || 'Sin descripción'}</p>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <a href="${mod.links.websiteUrl}" target="_blank" class="btn btn-primary">Ver en CurseForge</a>
                </div>
            `;
        }
    } catch (error) {
        modalBody.innerHTML = '<p class="text-center text-muted">Error al cargar detalles</p>';
    }
};

// Hacer la función global
window.addModToModpack = addModToModpack;

// =============================================================================
// IMPORTACIÓN Y EXPORTACIÓN
// =============================================================================

/**
 * Exporta el modpack actual
 */
async function exportModpack() {
    if (!state.currentModpack) {
        showToast('No hay ningún modpack seleccionado', 'warning');
        return;
    }

    try {
        window.location.href = `/api/?action=export_modpack&modpack_id=${state.currentModpack.id}`;
        showToast('Descargando modpack...', 'info');
    } catch (error) {
        showToast('Error al exportar modpack', 'error');
    }
}

/**
 * Importa un modpack desde un archivo ZIP
 */
async function importModpack(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const result = await apiRequest('import_modpack', formData);
        if (result.success) {
            showToast('Modpack importado exitosamente', 'success');
            loadUserModpacks();
            loadModpack(result.modpack_id);
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// =============================================================================
// INICIALIZACIÓN DE EVENTOS
// =============================================================================

function initEvents() {
    // Nuevo modpack
    document.getElementById('new-modpack-btn').addEventListener('click', () => {
        state.currentModpack = null;
        state.modpackMods = [];
        state.isEditing = false;
        showEditorView();
        populateModpackForm();
        document.getElementById('modpack-mods').innerHTML = '<p class="empty-message">Añade mods desde la búsqueda</p>';
        document.getElementById('mod-count').textContent = '0';
        document.querySelectorAll('.modpack-item').forEach(item => {
            item.classList.remove('active');
        });
    });

    // Guardar modpack
    document.getElementById('save-modpack-btn').addEventListener('click', saveModpack);

    // Eliminar modpack
    document.getElementById('delete-modpack-btn').addEventListener('click', deleteModpack);

    // Cancelar edición
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        state.currentModpack = null;
        state.modpackMods = [];
        state.isEditing = false;
        showEmptyView();
        document.querySelectorAll('.modpack-item').forEach(item => {
            item.classList.remove('active');
        });
    });

    // Buscar mods
    document.getElementById('search-mods-btn').addEventListener('click', searchMods);
    document.getElementById('mod-search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchMods();
        }
    });

    // Exportar
    document.getElementById('export-btn').addEventListener('click', exportModpack);

    // Importar
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importModpack(file);
        }
        e.target.value = ''; // Resetear el input
    });

    // Cerrar modal
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('mod-modal').classList.remove('active');
    });

    document.getElementById('mod-modal').addEventListener('click', (e) => {
        if (e.target.id === 'mod-modal') {
            document.getElementById('mod-modal').classList.remove('active');
        }
    });
}

// =============================================================================
// INICIALIZACIÓN
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initEvents();
    checkSession();
});
