/* =============================================
   STAFFING FORMATEURS - Application JavaScript
   ============================================= */

// ==================== DONNÉES ====================

// Récupérer les données du localStorage ou initialiser
let formateurs = JSON.parse(localStorage.getItem('formateurs')) || [];
let besoins = JSON.parse(localStorage.getItem('besoins')) || [];

// Pagination
const ITEMS_PER_PAGE = 9;
let currentPageFormateurs = 1;
let currentPageBesoins = 1;
let filteredFormateurs = [];
let filteredBesoins = [];

// Sauvegarder dans localStorage
function saveData() {
    localStorage.setItem('formateurs', JSON.stringify(formateurs));
    localStorage.setItem('besoins', JSON.stringify(besoins));
}

// ==================== NAVIGATION ====================

// Gestion des onglets
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Retirer la classe active de tous les onglets
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Activer l'onglet cliqué
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');

        // Rafraîchir l'affichage si on va sur staffing
        if (tabId === 'staffing') {
            renderStaffing();
        }
    });
});

// ==================== MODALS ====================

function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    // Réinitialiser les formulaires
    if (modalId === 'modal-formateur') {
        document.getElementById('form-formateur').reset();
        document.getElementById('formateur-id').value = '';
        document.getElementById('modal-formateur-title').textContent = 'Ajouter un formateur';
    }
    if (modalId === 'modal-besoin') {
        document.getElementById('form-besoin').reset();
        document.getElementById('besoin-id').value = '';
        document.getElementById('modal-besoin-title').textContent = 'Créer un besoin de formation';
        document.getElementById('groupe-ville').style.display = 'none';
    }
    if (modalId === 'modal-affectation') {
        document.getElementById('form-affectation').reset();
        document.getElementById('affectation-besoin-id').value = '';
    }
}

// Fermer modal en cliquant à l'extérieur
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// ==================== FILTRES FORMATEURS ====================

function updateFilterOptionsFormateurs() {
    // Mettre à jour les options de spécialités
    const specialitesSet = new Set();
    formateurs.forEach(f => {
        f.specialites.forEach(s => specialitesSet.add(s));
    });
    const selectSpecialite = document.getElementById('filter-formateur-specialite');
    const currentSpecialite = selectSpecialite.value;
    selectSpecialite.innerHTML = '<option value="">Toutes les spécialités</option>';
    [...specialitesSet].sort().forEach(s => {
        selectSpecialite.innerHTML += `<option value="${s}" ${s === currentSpecialite ? 'selected' : ''}>${s}</option>`;
    });

    // Mettre à jour les options de localisations
    const localisationsSet = new Set();
    formateurs.forEach(f => {
        if (f.localisation) localisationsSet.add(f.localisation);
    });
    const selectLocalisation = document.getElementById('filter-formateur-localisation');
    const currentLocalisation = selectLocalisation.value;
    selectLocalisation.innerHTML = '<option value="">Toutes les villes</option>';
    [...localisationsSet].sort().forEach(l => {
        selectLocalisation.innerHTML += `<option value="${l}" ${l === currentLocalisation ? 'selected' : ''}>${l}</option>`;
    });
}

function applyFiltersFormateurs() {
    const search = document.getElementById('filter-formateur-search').value.toLowerCase().trim();
    const specialite = document.getElementById('filter-formateur-specialite').value;
    const localisation = document.getElementById('filter-formateur-localisation').value;

    filteredFormateurs = formateurs.filter(f => {
        // Recherche texte
        const matchSearch = !search ||
            f.prenom.toLowerCase().includes(search) ||
            f.nom.toLowerCase().includes(search) ||
            f.email.toLowerCase().includes(search) ||
            (f.telephone && f.telephone.includes(search)) ||
            f.specialites.some(s => s.toLowerCase().includes(search));

        // Filtre spécialité
        const matchSpecialite = !specialite || f.specialites.includes(specialite);

        // Filtre localisation
        const matchLocalisation = !localisation || f.localisation === localisation;

        return matchSearch && matchSpecialite && matchLocalisation;
    });

    currentPageFormateurs = 1;
    renderFormateurs();
}

function resetFiltersFormateurs() {
    document.getElementById('filter-formateur-search').value = '';
    document.getElementById('filter-formateur-specialite').value = '';
    document.getElementById('filter-formateur-localisation').value = '';
    applyFiltersFormateurs();
}

// ==================== FILTRES BESOINS ====================

function updateFilterOptionsBesoins() {
    // Mettre à jour les options de clients
    const clientsSet = new Set();
    besoins.forEach(b => {
        if (b.client) clientsSet.add(b.client);
    });
    const selectClient = document.getElementById('filter-besoin-client');
    const currentClient = selectClient.value;
    selectClient.innerHTML = '<option value="">Tous les clients</option>';
    [...clientsSet].sort().forEach(c => {
        selectClient.innerHTML += `<option value="${c}" ${c === currentClient ? 'selected' : ''}>${c}</option>`;
    });
}

function applyFiltersBesoins() {
    const search = document.getElementById('filter-besoin-search').value.toLowerCase().trim();
    const dateDebut = document.getElementById('filter-besoin-date-debut').value;
    const dateFin = document.getElementById('filter-besoin-date-fin').value;
    const statut = document.getElementById('filter-besoin-statut').value;
    const modalite = document.getElementById('filter-besoin-modalite').value;
    const client = document.getElementById('filter-besoin-client').value;

    filteredBesoins = besoins.filter(b => {
        // Recherche texte
        const matchSearch = !search ||
            b.sujet.toLowerCase().includes(search) ||
            b.client.toLowerCase().includes(search) ||
            (b.ville && b.ville.toLowerCase().includes(search));

        // Filtre date début
        const matchDateDebut = !dateDebut || b.date >= dateDebut;

        // Filtre date fin
        const matchDateFin = !dateFin || b.date <= dateFin;

        // Filtre statut
        let matchStatut = true;
        if (statut === 'en-attente') {
            matchStatut = !b.formateurId;
        } else if (statut === 'affecte') {
            matchStatut = !!b.formateurId;
        }

        // Filtre modalité
        const matchModalite = !modalite || b.modalite === modalite;

        // Filtre client
        const matchClient = !client || b.client === client;

        return matchSearch && matchDateDebut && matchDateFin && matchStatut && matchModalite && matchClient;
    });

    currentPageBesoins = 1;
    renderBesoins();
}

function resetFiltersBesoins() {
    document.getElementById('filter-besoin-search').value = '';
    document.getElementById('filter-besoin-date-debut').value = '';
    document.getElementById('filter-besoin-date-fin').value = '';
    document.getElementById('filter-besoin-statut').value = '';
    document.getElementById('filter-besoin-modalite').value = '';
    document.getElementById('filter-besoin-client').value = '';
    applyFiltersBesoins();
}

// ==================== PAGINATION ====================

function renderPagination(containerId, currentPage, totalItems, onPageChange) {
    const container = document.getElementById(containerId);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Bouton précédent
    html += `<button class="pagination-btn" onclick="${onPageChange}(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Précédent</button>`;

    // Pages
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="${onPageChange}(1)">1</button>`;
        if (startPage > 2) html += `<span class="pagination-info">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="pagination-info">...</span>`;
        html += `<button class="pagination-btn" onclick="${onPageChange}(${totalPages})">${totalPages}</button>`;
    }

    // Bouton suivant
    html += `<button class="pagination-btn" onclick="${onPageChange}(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Suivant →</button>`;

    container.innerHTML = html;
}

function goToPageFormateurs(page) {
    currentPageFormateurs = page;
    renderFormateurs();
    // Scroll vers le haut de la liste
    document.getElementById('liste-formateurs').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goToPageBesoins(page) {
    currentPageBesoins = page;
    renderBesoins();
    // Scroll vers le haut de la liste
    document.getElementById('liste-besoins').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== FORMATEURS ====================

function saveFormateur(event) {
    event.preventDefault();

    const id = document.getElementById('formateur-id').value;
    const formateur = {
        id: id || Date.now().toString(),
        prenom: document.getElementById('formateur-prenom').value.trim(),
        nom: document.getElementById('formateur-nom').value.trim(),
        email: document.getElementById('formateur-email').value.trim(),
        telephone: document.getElementById('formateur-telephone').value.trim(),
        specialites: document.getElementById('formateur-specialites').value.split(',').map(s => s.trim()).filter(s => s),
        tarif: document.getElementById('formateur-tarif').value || null,
        experience: document.getElementById('formateur-experience').value || null,
        localisation: document.getElementById('formateur-localisation').value.trim(),
        notes: document.getElementById('formateur-notes').value.trim()
    };

    if (id) {
        // Modification
        const index = formateurs.findIndex(f => f.id === id);
        if (index !== -1) {
            formateurs[index] = formateur;
        }
    } else {
        // Création
        formateurs.push(formateur);
    }

    saveData();
    updateFilterOptionsFormateurs();
    applyFiltersFormateurs();
    closeModal('modal-formateur');
}

function editFormateur(id) {
    const formateur = formateurs.find(f => f.id === id);
    if (!formateur) return;

    document.getElementById('formateur-id').value = formateur.id;
    document.getElementById('formateur-prenom').value = formateur.prenom;
    document.getElementById('formateur-nom').value = formateur.nom;
    document.getElementById('formateur-email').value = formateur.email;
    document.getElementById('formateur-telephone').value = formateur.telephone || '';
    document.getElementById('formateur-specialites').value = formateur.specialites.join(', ');
    document.getElementById('formateur-tarif').value = formateur.tarif || '';
    document.getElementById('formateur-experience').value = formateur.experience || '';
    document.getElementById('formateur-localisation').value = formateur.localisation || '';
    document.getElementById('formateur-notes').value = formateur.notes || '';

    document.getElementById('modal-formateur-title').textContent = 'Modifier le formateur';
    openModal('modal-formateur');
}

function deleteFormateur(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce formateur ?')) return;

    // Vérifier si le formateur est affecté à des besoins
    const affectations = besoins.filter(b => b.formateurId === id);
    if (affectations.length > 0) {
        if (!confirm(`Ce formateur est affecté à ${affectations.length} formation(s). Supprimer quand même ? (Les affectations seront retirées)`)) {
            return;
        }
        // Retirer les affectations
        besoins.forEach(b => {
            if (b.formateurId === id) {
                b.formateurId = null;
            }
        });
    }

    formateurs = formateurs.filter(f => f.id !== id);
    saveData();
    updateFilterOptionsFormateurs();
    applyFiltersFormateurs();
    renderStaffing();
}

function renderFormateurs() {
    const container = document.getElementById('liste-formateurs');
    const countContainer = document.getElementById('formateurs-count');

    // Afficher le compteur
    const total = formateurs.length;
    const filtered = filteredFormateurs.length;
    if (total === 0) {
        countContainer.innerHTML = '';
    } else if (filtered === total) {
        countContainer.innerHTML = `<strong>${total}</strong> formateur${total > 1 ? 's' : ''}`;
    } else {
        countContainer.innerHTML = `<strong>${filtered}</strong> sur ${total} formateur${total > 1 ? 's' : ''}`;
    }

    if (filteredFormateurs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👤</div>
                ${formateurs.length === 0
                    ? '<p>Aucun formateur pour l\'instant</p><p>Cliquez sur "+ Ajouter un formateur" pour commencer</p>'
                    : '<p>Aucun formateur ne correspond à vos critères</p><p>Modifiez vos filtres ou réinitialisez</p>'
                }
            </div>
        `;
        document.getElementById('pagination-formateurs').innerHTML = '';
        return;
    }

    // Pagination
    const startIndex = (currentPageFormateurs - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const formateursPage = filteredFormateurs.slice(startIndex, endIndex);

    container.innerHTML = formateursPage.map(f => `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">${f.prenom} ${f.nom}</div>
                    <div class="card-subtitle">${f.email}</div>
                </div>
            </div>
            <div class="card-body">
                ${f.telephone ? `<div class="card-info">📞 ${f.telephone}</div>` : ''}
                ${f.localisation ? `<div class="card-info">📍 ${f.localisation}</div>` : ''}
                ${f.tarif ? `<div class="card-info">💰 ${f.tarif}€/jour</div>` : ''}
                ${f.experience ? `<div class="card-info">⏱️ ${f.experience} ans d'expérience</div>` : ''}
                ${f.specialites.length > 0 ? `
                    <div class="tags">
                        ${f.specialites.map(s => `<span class="tag">${s}</span>`).join('')}
                    </div>
                ` : ''}
                ${f.notes ? `<div class="card-info" style="margin-top: 0.75rem; font-style: italic;">"${f.notes}"</div>` : ''}
            </div>
            <div class="card-actions">
                <button class="btn-secondary btn-small" onclick="editFormateur('${f.id}')">✏️ Modifier</button>
                <button class="btn-danger btn-small" onclick="deleteFormateur('${f.id}')">🗑️ Supprimer</button>
            </div>
        </div>
    `).join('');

    // Pagination
    renderPagination('pagination-formateurs', currentPageFormateurs, filteredFormateurs.length, 'goToPageFormateurs');
}

// ==================== BESOINS ====================

function toggleVille() {
    const modalite = document.getElementById('besoin-modalite').value;
    const groupeVille = document.getElementById('groupe-ville');
    const inputVille = document.getElementById('besoin-ville');

    if (modalite === 'presentiel') {
        groupeVille.style.display = 'block';
        inputVille.setAttribute('required', 'required');
    } else {
        groupeVille.style.display = 'none';
        inputVille.removeAttribute('required');
        inputVille.value = '';
    }
}

function saveBesoin(event) {
    event.preventDefault();

    const id = document.getElementById('besoin-id').value;
    const besoin = {
        id: id || Date.now().toString(),
        sujet: document.getElementById('besoin-sujet').value.trim(),
        client: document.getElementById('besoin-client').value.trim(),
        date: document.getElementById('besoin-date').value,
        duree: document.getElementById('besoin-duree').value,
        modalite: document.getElementById('besoin-modalite').value,
        ville: document.getElementById('besoin-ville').value.trim() || null,
        notes: document.getElementById('besoin-notes').value.trim(),
        formateurId: id ? (besoins.find(b => b.id === id)?.formateurId || null) : null
    };

    if (id) {
        // Modification
        const index = besoins.findIndex(b => b.id === id);
        if (index !== -1) {
            besoins[index] = besoin;
        }
    } else {
        // Création
        besoins.push(besoin);
    }

    saveData();
    updateFilterOptionsBesoins();
    applyFiltersBesoins();
    renderStaffing();
    closeModal('modal-besoin');
}

function editBesoin(id) {
    const besoin = besoins.find(b => b.id === id);
    if (!besoin) return;

    document.getElementById('besoin-id').value = besoin.id;
    document.getElementById('besoin-sujet').value = besoin.sujet;
    document.getElementById('besoin-client').value = besoin.client;
    document.getElementById('besoin-date').value = besoin.date;
    document.getElementById('besoin-duree').value = besoin.duree;
    document.getElementById('besoin-modalite').value = besoin.modalite;
    document.getElementById('besoin-ville').value = besoin.ville || '';
    document.getElementById('besoin-notes').value = besoin.notes || '';

    toggleVille();

    document.getElementById('modal-besoin-title').textContent = 'Modifier le besoin';
    openModal('modal-besoin');
}

function deleteBesoin(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce besoin ?')) return;

    besoins = besoins.filter(b => b.id !== id);
    saveData();
    updateFilterOptionsBesoins();
    applyFiltersBesoins();
    renderStaffing();
}

function formatDate(dateStr) {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('fr-FR', options);
}

function formatDateShort(dateStr) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('fr-FR', options);
}

function formatDuree(duree) {
    const labels = {
        '1h': '1 heure',
        'demi-journee': 'Demi-journée',
        'journee': '1 journée'
    };
    return labels[duree] || duree;
}

function renderBesoins() {
    const container = document.getElementById('liste-besoins');
    const countContainer = document.getElementById('besoins-count');

    // Afficher le compteur
    const total = besoins.length;
    const filtered = filteredBesoins.length;
    if (total === 0) {
        countContainer.innerHTML = '';
    } else if (filtered === total) {
        countContainer.innerHTML = `<strong>${total}</strong> besoin${total > 1 ? 's' : ''}`;
    } else {
        countContainer.innerHTML = `<strong>${filtered}</strong> sur ${total} besoin${total > 1 ? 's' : ''}`;
    }

    if (filteredBesoins.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                ${besoins.length === 0
                    ? '<p>Aucun besoin de formation pour l\'instant</p><p>Cliquez sur "+ Créer un besoin" pour commencer</p>'
                    : '<p>Aucun besoin ne correspond à vos critères</p><p>Modifiez vos filtres ou réinitialisez</p>'
                }
            </div>
        `;
        document.getElementById('pagination-besoins').innerHTML = '';
        return;
    }

    // Trier par date
    const besoinsTries = [...filteredBesoins].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Pagination
    const startIndex = (currentPageBesoins - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const besoinsPage = besoinsTries.slice(startIndex, endIndex);

    container.innerHTML = besoinsPage.map(b => {
        const formateur = b.formateurId ? formateurs.find(f => f.id === b.formateurId) : null;

        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${b.sujet}</div>
                        <div class="card-subtitle">${b.client}</div>
                    </div>
                    <span class="badge ${b.formateurId ? 'badge-assigned' : 'badge-pending'}">
                        ${b.formateurId ? 'Affecté' : 'En attente'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="card-info">📅 ${formatDate(b.date)}</div>
                    <div class="card-info">⏱️ ${formatDuree(b.duree)}</div>
                    <div class="card-info">
                        <span class="badge ${b.modalite === 'distance' ? 'badge-distance' : 'badge-presentiel'}">
                            ${b.modalite === 'distance' ? '💻 À distance' : `📍 ${b.ville}`}
                        </span>
                    </div>
                    ${formateur ? `
                        <div class="card-info" style="margin-top: 0.75rem; color: var(--success-color);">
                            👤 <strong>${formateur.prenom} ${formateur.nom}</strong>
                        </div>
                    ` : ''}
                    ${b.notes ? `<div class="card-info" style="margin-top: 0.5rem; font-style: italic;">"${b.notes}"</div>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn-secondary btn-small" onclick="editBesoin('${b.id}')">✏️ Modifier</button>
                    <button class="btn-danger btn-small" onclick="deleteBesoin('${b.id}')">🗑️ Supprimer</button>
                </div>
            </div>
        `;
    }).join('');

    // Pagination
    renderPagination('pagination-besoins', currentPageBesoins, filteredBesoins.length, 'goToPageBesoins');
}

// ==================== STAFFING ====================

function openAffectation(besoinId) {
    const besoin = besoins.find(b => b.id === besoinId);
    if (!besoin) return;

    document.getElementById('affectation-besoin-id').value = besoinId;

    // Afficher les infos du besoin
    document.getElementById('affectation-besoin-info').innerHTML = `
        <div style="background: var(--background); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <strong>${besoin.sujet}</strong><br>
            <span style="color: var(--text-secondary);">
                ${besoin.client} • ${formatDate(besoin.date)} • ${formatDuree(besoin.duree)}
            </span>
        </div>
    `;

    // Remplir le select avec les formateurs
    const select = document.getElementById('affectation-formateur');
    const formateursDispo = getFormateursDisponibles(besoin.date, besoinId);

    select.innerHTML = '<option value="">-- Sélectionner --</option>';

    formateurs.forEach(f => {
        const dispo = formateursDispo.includes(f.id);
        select.innerHTML += `
            <option value="${f.id}" ${!dispo ? 'disabled' : ''}>
                ${f.prenom} ${f.nom} ${!dispo ? '(indisponible)' : ''}
            </option>
        `;
    });

    openModal('modal-affectation');
}

function getFormateursDisponibles(date, excludeBesoinId = null) {
    // Trouver les formateurs qui n'ont pas de formation ce jour-là
    const besoinsCeJour = besoins.filter(b =>
        b.date === date &&
        b.formateurId &&
        b.id !== excludeBesoinId
    );

    const formateursOccupes = besoinsCeJour.map(b => b.formateurId);

    return formateurs
        .filter(f => !formateursOccupes.includes(f.id))
        .map(f => f.id);
}

function saveAffectation(event) {
    event.preventDefault();

    const besoinId = document.getElementById('affectation-besoin-id').value;
    const formateurId = document.getElementById('affectation-formateur').value;

    const besoin = besoins.find(b => b.id === besoinId);
    if (besoin) {
        besoin.formateurId = formateurId;
        saveData();
        applyFiltersBesoins();
        renderStaffing();
    }

    closeModal('modal-affectation');
}

function removeAffectation(besoinId) {
    if (!confirm('Retirer l\'affectation de ce formateur ?')) return;

    const besoin = besoins.find(b => b.id === besoinId);
    if (besoin) {
        besoin.formateurId = null;
        saveData();
        applyFiltersBesoins();
        renderStaffing();
    }
}

function renderStaffing() {
    const containerNonAffectes = document.getElementById('besoins-non-affectes');
    const containerAffectes = document.getElementById('besoins-affectes');

    const besoinsNonAffectes = besoins.filter(b => !b.formateurId).sort((a, b) => new Date(a.date) - new Date(b.date));
    const besoinsAffectes = besoins.filter(b => b.formateurId).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Non affectés
    if (besoinsNonAffectes.length === 0) {
        containerNonAffectes.innerHTML = `
            <div class="empty-state" style="padding: 1.5rem;">
                <p>✅ Tous les besoins sont affectés !</p>
            </div>
        `;
    } else {
        containerNonAffectes.innerHTML = besoinsNonAffectes.map(b => `
            <div class="staffing-item">
                <div class="staffing-item-header">
                    <span class="staffing-item-title">${b.sujet}</span>
                    <button class="btn-success btn-small" onclick="openAffectation('${b.id}')" ${formateurs.length === 0 ? 'disabled title="Créez d\'abord un formateur"' : ''}>
                        + Affecter
                    </button>
                </div>
                <div class="staffing-item-details">
                    ${b.client} • ${formatDateShort(b.date)} • ${formatDuree(b.duree)}<br>
                    ${b.modalite === 'distance' ? '💻 À distance' : `📍 ${b.ville}`}
                </div>
            </div>
        `).join('');
    }

    // Affectés
    if (besoinsAffectes.length === 0) {
        containerAffectes.innerHTML = `
            <div class="empty-state" style="padding: 1.5rem;">
                <p>Aucune affectation pour l'instant</p>
            </div>
        `;
    } else {
        containerAffectes.innerHTML = besoinsAffectes.map(b => {
            const formateur = formateurs.find(f => f.id === b.formateurId);
            return `
                <div class="staffing-item assigned">
                    <div class="staffing-item-header">
                        <span class="staffing-item-title">${b.sujet}</span>
                        <button class="btn-danger btn-small" onclick="removeAffectation('${b.id}')">
                            ✕ Retirer
                        </button>
                    </div>
                    <div class="staffing-item-details">
                        ${b.client} • ${formatDateShort(b.date)} • ${formatDuree(b.duree)}<br>
                        ${b.modalite === 'distance' ? '💻 À distance' : `📍 ${b.ville}`}
                    </div>
                    ${formateur ? `
                        <div class="staffing-item-formateur">
                            👤 ${formateur.prenom} ${formateur.nom}
                            ${formateur.telephone ? ` • 📞 ${formateur.telephone}` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
}

// ==================== INITIALISATION ====================

// Afficher les données au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les filtres
    updateFilterOptionsFormateurs();
    updateFilterOptionsBesoins();

    // Initialiser les listes filtrées
    filteredFormateurs = [...formateurs];
    filteredBesoins = [...besoins];

    // Afficher
    renderFormateurs();
    renderBesoins();
    renderStaffing();
});
