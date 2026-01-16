/* =============================================
   STAFFING FORMATEURS - Application JavaScript
   ============================================= */

// ==================== DONNÉES ====================

// Récupérer les données du localStorage ou initialiser
let formateurs = JSON.parse(localStorage.getItem('formateurs')) || [];
let besoins = JSON.parse(localStorage.getItem('besoins')) || [];

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
    renderFormateurs();
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
    renderFormateurs();
    renderStaffing();
}

function renderFormateurs() {
    const container = document.getElementById('liste-formateurs');

    if (formateurs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👤</div>
                <p>Aucun formateur pour l'instant</p>
                <p>Cliquez sur "+ Ajouter un formateur" pour commencer</p>
            </div>
        `;
        return;
    }

    container.innerHTML = formateurs.map(f => `
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
    renderBesoins();
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
    renderBesoins();
    renderStaffing();
}

function formatDate(dateStr) {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
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

    if (besoins.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>Aucun besoin de formation pour l'instant</p>
                <p>Cliquez sur "+ Créer un besoin" pour commencer</p>
            </div>
        `;
        return;
    }

    // Trier par date
    const besoinsTries = [...besoins].sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = besoinsTries.map(b => {
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
        renderBesoins();
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
        renderBesoins();
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
                    ${b.client} • ${formatDate(b.date)} • ${formatDuree(b.duree)}<br>
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
                        ${b.client} • ${formatDate(b.date)} • ${formatDuree(b.duree)}<br>
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
    renderFormateurs();
    renderBesoins();
    renderStaffing();
});
