let contacts = [
    {
        "firstName": "Anton",
        "lastName": "Mayer",
        "email": "antom@gmail.com",
        "phone": "+49 1111 111 11 1"
    },
    {
        "firstName": "Anja",
        "lastName": "Schulz",
        "email": "schulz@hotmail.com",
        "phone": "+49 XXXX XXX XX X"
    },
    {
        "firstName": "Benedikt",
        "lastName": "Ziegler",
        "email": "benedikt@gmail.com",
        "phone": "+49 XXXX XXX XX X"
    },
    {
        "firstName": "David",
        "lastName": "Eisenberg",
        "email": "davidberg@gmail.com",
        "phone": "+49 XXXX XXX XX X"
    },
    {
        "firstName": "Eva",
        "lastName": "Fischer",
        "email": "eva@gmail.com",
        "phone": "+49 XXXX XXX XX X"
    },
    {
        "firstName": "Emmanuel",
        "lastName": "Mauer",
        "email": "emmanuelma@gmail.com",
        "phone": "+49 XXXX XXX XX X"
    },
    {
        "firstName": "Marcel",
        "lastName": "Bauer",
        "email": "bauer@gmail.com",
        "phone": "+49 XXXX XXX XX X"
    },
    {
        "firstName": "Tatjana",
        "lastName": "Wolf",
        "email": "wolf@gmail.com",
        "phone": "+49 XXXX XXX XX X"
    }
];

// Mapping name -> color class
const colorMap = {
    'Anton Mayer': 'contact-avatar-color1',
    'Anja Schulz': 'contact-avatar-color2',
    'Benedikt Ziegler': 'contact-avatar-color3',
    'David Eisenberg': 'contact-avatar-color4',
    'Eva Fischer': 'contact-avatar-color5',
    'Emmanuel Mauer': 'contact-avatar-color6',
    'Marcel Bauer': 'contact-avatar-color7',
    'Tatjana Wolf': 'contact-avatar-color8',
    'Sofia Müller': 'contact-avatar-color9',
    '': 'contact-avatar-color10' // Default color for any other names
};

let lastShownContactIdx = null;

/**
 * Initializes the contact list and hides the add contact form on page load.
 */
function init() {
    renderContacts();
    hideForm();
}

/**
 * Renders all contacts in the contact list, sorted and grouped by initials.
 * Uses helper functions for sorting, grouping, and rendering.
 */
function renderContacts() {
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = '';
    const sorted = getSortedContacts();
    const grouped = groupContactsByInitial(sorted);
    renderContactGroups(contactList, grouped);
    addContactItemListeners();
}

/**
 * Returns the contacts sorted by initials (first name + last name).
 * @returns {Array} Sorted array of contacts
 */
function getSortedContacts() {
    const contactsWithName = contacts.map(c => ({
        ...c,
        name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()
    }));
    return [...contactsWithName].sort((a, b) => {
        const initialsA = getInitials(a.name);
        const initialsB = getInitials(b.name);
        if (initialsA < initialsB) return -1;
        if (initialsA > initialsB) return 1;
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    });
}

function groupContactsByInitial(sortedContacts) {
    return sortedContacts.reduce((acc, contact) => {
        const initials = getInitials(`${contact.firstName} ${contact.lastName}`);
        const letter = initials[0] ? initials[0].toUpperCase() : '';
        if (!letter) return acc;
        (acc[letter] = acc[letter] || []).push(contact);
        return acc;
    }, {});
}

function renderContactGroups(contactList, grouped) {
    let globalIndex = 0;
    Object.keys(grouped).sort().forEach(letter => {
        contactList.innerHTML += getGroupTemplate(letter);
        globalIndex = renderContactsOfGroup(contactList, grouped[letter], globalIndex);
    });
}

function renderContactsOfGroup(contactList, group, startIndex) {
    let idx = startIndex;
    group.forEach(contact => {
        const initials = getInitials(`${contact.firstName} ${contact.lastName}`);
        const name = `${contact.firstName} ${contact.lastName}`.trim();
        const colorClass = colorMap[name] || 'contact-avatar-color10';
        contactList.innerHTML += getContactListItemTemplate(contact, colorClass, initials, idx);
        idx++;
    });
    return idx;
}

/**
 * Groups contacts by their initial letter (last name preferred).
 * @param {Array} list - Array of contact objects.
 * @returns {Object} Grouped contacts by initial letter.
 */
function groupContactsByLetter(list) {
    return list.reduce((acc, contact) => {
        // Use lastName if available, otherwise firstName, fallback to empty string
        const letter = (contact.lastName ? contact.lastName[0] : (contact.firstName ? contact.firstName[0] : '')).toUpperCase();
        if (!letter) return acc;
        (acc[letter] = acc[letter] || []).push(contact);
        return acc;
    }, {});
}


function addContactItemListeners() {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.onclick = function (e) {
            const idx = parseInt(this.dataset.index);
            (window.innerWidth <= 780) ? showMobileContactDetails(idx) : toggleContactDetails(idx, this);
            e.stopPropagation();
        };
    });
}

function showMobileContactDetails(idx) {
    document.querySelector('.contact-sidebar').classList.add('hide-mobile-sidebar');
    const section = document.querySelector('.contacts-section');
    section.classList.add('show-mobile-section');
    document.getElementById('contactListClicked').style.display = 'block';
    setupMobileBackButton(section);
    setupMobileEditButton(idx);
    document.querySelector('.add-contact-btn-mobile').classList.add('hide-mobile-edit');
    removeMobileEditDropdown();
    showContactDetails(getSortedContacts()[idx], idx);
}

function setupMobileBackButton(section) {
    let backBtn = document.getElementById('mobileBackBtn');
    if (!backBtn) {
        backBtn = document.createElement('button');
        backBtn.className = 'mobile-back-btn';
        backBtn.id = 'mobileBackBtn';
        backBtn.innerHTML = '<img src="./assets/img/icons/content/help/back.png" alt="Back">';
        backBtn.onclick = hideMobileContactDetails;
        section.appendChild(backBtn);
    }
    backBtn.style.display = 'flex';
}

function setupMobileEditButton(idx) {
    const editBtn = document.getElementById('mobileEditBtn');
    if (editBtn) {
        editBtn.style.display = 'flex';
        window._lastMobileEditIdx = idx;
    }
}

function toggleMobileEditDropdown(idx) {
    const dropdown = document.getElementById('mobileEditDropdown');
    if (!dropdown) return;
    dropdown.classList.contains('show') ? hideMobileEditDropdown(dropdown) : showMobileEditDropdown(dropdown, idx);
}

function hideMobileEditDropdown(dropdown) {
    dropdown.classList.remove('show');
}

function showMobileEditDropdown(dropdown, idx) {
    if (typeof getMobileEditDropdownTemplate === 'function') {
        dropdown.innerHTML = getMobileEditDropdownTemplate(idx);
    }
    dropdown.classList.add('show');
    setTimeout(() => document.addEventListener('click', removeMobileEditDropdown, { once: true }), 0);
}

function removeMobileEditDropdown() {
    const dropdown = document.getElementById('mobileEditDropdown');
    if (dropdown) dropdown.classList.remove('show');
}


function toggleContactDetails(idx, item) {
    const details = document.getElementById('contactListClicked');
    const sorted = getSortedContacts();
    if (lastShownContactIdx === idx) {
        details.style.display = 'none';
        item.classList.remove('selected');
        lastShownContactIdx = null;
    } else {
        document.querySelectorAll('.contact-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        showContactDetails(sorted[idx], idx);
        details.style.display = '';
        lastShownContactIdx = idx;
    }
}

function showContactDetails(contact, idx) {
    const container = document.getElementById('contactListClicked');
    const name = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    const initials = getInitials(name);
    const colorClass = colorMap[name] || 'contact-avatar-color10';
    const contactForTemplate = { ...contact, name, initials };
    container.innerHTML = getContactDetailsTemplate(contactForTemplate, colorClass, initials, idx);
    container.classList.remove('active');
    container.classList.add('contact-list-clicked');
    setTimeout(() => container.classList.add('active'), 10);
}


/**
 * Shows the add contact form and its modal overlay.
 */
function showForm() {
  const form = document.getElementById('formContainer');
  form.classList.add('show');
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.add('show');
  setDefaultAvatar(document.getElementById('formAvatar'));
  setTimeout(() => document.addEventListener('click', closeFormOnOutsideClick), 0);
}

function hideForm() {
  const form = document.getElementById('formContainer');
  form.classList.remove('show');
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('show');
  document.removeEventListener('click', closeFormOnOutsideClick);
}


function closeFormOnOutsideClick(e) {
    const formContainer = document.getElementById('formContainer');
    if (formContainer.classList.contains('show') && !formContainer.contains(e.target)) hideForm();
}

function closeEditFormOnOutsideClick(e) {
    const editFormContainer = document.getElementById('editFormContainer');
    if (editFormContainer.classList.contains('show') && !editFormContainer.contains(e.target)) hideEditForm();
}


/**
 * Adds a new contact to the contacts array and updates the contact list.
 */
function addToContacts() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    if (!name || !email || !phone) return;
    const [firstName, ...rest] = name.split(' ');
    const lastName = rest.join(' ');
    const fullName = `${firstName} ${lastName}`.trim();
    assignColorToContact(fullName);
    contacts.push({ firstName, lastName, email, phone });
    clearFormAndUpdate();
}

function assignColorToContact(fullName) {
    if (!colorMap[fullName]) {
        const usedColors = Object.values(colorMap);
        let colorIdx = 1;
        while (usedColors.includes('contact-avatar-color' + colorIdx) && colorIdx <= 10) colorIdx++;
        colorMap[fullName] = colorIdx > 10 ? 'contact-avatar-color' + (((Object.keys(colorMap).length - 1) % 10) + 1) : 'contact-avatar-color' + colorIdx;
    }
}

function clearFormAndUpdate() {
    ['contactName', 'contactEmail', 'contactPhone'].forEach(id => document.getElementById(id).value = '');
    setDefaultAvatar(document.getElementById('formAvatar'));
    renderContacts();
    hideForm();
    showContactCreatedModal();
}

function showContactCreatedModal() {
    const modal = document.getElementById('contactCreatedModal');
    if (!modal) return;
    modal.classList.add('show');
    setTimeout(() => {
        modal.classList.remove('show');
    }, 2000);
}

function updateFormAvatar() {
    const name = document.getElementById("contactName").value.trim();
    const avatar = document.getElementById("formAvatar");
    resetAvatarColors(avatar);
    if (!name) {
        setDefaultAvatar(avatar);
        return;
    }
    const colorClass = getOrCreateColorClass(name);
    avatar.classList.add(colorClass);
    avatar.textContent = getInitials(name);
}

function getOrCreateColorClass(name) {
    if (colorMap[name]) return colorMap[name];
    const usedColors = Object.values(colorMap);
    let colorIdx = 1;
    while (usedColors.includes('contact-avatar-color' + colorIdx) && colorIdx <= 10) colorIdx++;
    return colorIdx > 10 ? 'contact-avatar-color' + (((Object.keys(colorMap).length - 1) % 10) + 1) : 'contact-avatar-color' + colorIdx;
}


function resetAvatarColors(avatar) {
    for (let i = 1; i <= 10; i++) avatar.classList.remove('contact-avatar-color' + i);
}

function setDefaultAvatar(avatar) {
    for (let i = 1; i <= 10; i++) avatar.classList.remove('contact-avatar-color' + i);
    avatar.innerHTML = '<img src="assets/img/icons/add-contact/person-avatar.svg" alt="Avatar">';
}

function getInitials(name) {
    return name.split(" ").map(n => n[0].toUpperCase()).slice(0, 2).join("");
}

function cancelForm() {
    ['contactName', 'contactEmail', 'contactPhone'].forEach(id => document.getElementById(id).value = '');
    hideForm();
}


/**
 * Opens the edit contact modal and fills in the contact data.
 * @param {number} idx - Index of the contact to edit.
 */
function editContact(sortedIdx) {
    const sorted = getSortedContacts();
    const contact = sorted[sortedIdx];
    const originalIdx = contacts.findIndex(c => 
        c.firstName === contact.firstName && c.lastName === contact.lastName && 
        c.email === contact.email && c.phone === contact.phone
    );
    if (originalIdx !== -1) showEditForm(originalIdx);
}

function showEditForm(idx) {
    const contact = contacts[idx];
    const name = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    document.getElementById('editContactName').value = name;
    document.getElementById('editContactEmail').value = contact.email;
    document.getElementById('editContactPhone').value = contact.phone;
    updateEditFormAvatar();
    showEditModal();
    hideForm();
    setTimeout(() => document.addEventListener('click', closeEditFormOnOutsideClick), 0);
    window.editContactIdx = idx;
}

function showEditModal() {
    document.getElementById('editFormContainer').classList.add('show');
    const overlay = document.getElementById('editModalOverlay');
    if (overlay) overlay.classList.add('show');
}


function hideEditForm() {
    document.getElementById('editFormContainer').classList.remove('show');
    const overlay = document.getElementById('editModalOverlay');
    if (overlay) overlay.classList.remove('show');
    document.removeEventListener('click', closeEditFormOnOutsideClick);
}


/**
 * Closes the edit contact modal if clicking outside the edit form container.
 * @param {MouseEvent} e - The click event.
 */
function closeEditFormOnOutsideClick(e) {
    const editFormContainer = document.getElementById('editFormContainer');
    if (editFormContainer.classList.contains('show') && !editFormContainer.contains(e.target)) {
        hideEditForm();
    }
}

function updateEditFormAvatar() {
    const name = document.getElementById('editContactName').value.trim();
    const avatar = document.getElementById('editFormAvatar');
    resetAvatarColors(avatar);
    if (!name) {
        avatar.classList.add('contact-avatar-color10');
        avatar.innerHTML = '<img src="assets/img/icons/add-contact/person-avatar.svg" alt="Avatar">';
        return;
    }
    avatar.classList.add(colorMap[name] || 'contact-avatar-color10');
    avatar.textContent = getInitials(name);
}

function hideMobileContactDetails() {
    document.querySelector('.contact-sidebar').classList.remove('hide-mobile-sidebar');
    const section = document.querySelector('.contacts-section');
    section.classList.remove('show-mobile-section');
    section.style.display = '';
    document.getElementById('contactListClicked').style.display = '';
    hideMobileButtons();
    document.querySelector('.add-contact-btn-mobile').classList.remove('hide-mobile-edit');
}

function hideMobileButtons() {
    const backBtn = document.getElementById('mobileBackBtn');
    const editBtn = document.getElementById('mobileEditBtn');
    if (backBtn) backBtn.style.display = 'none';
    if (editBtn) editBtn.style.display = 'none';
}

function showDesktopView() {
    const section = document.querySelector('.contacts-section');
    const sidebar = document.querySelector('.contact-sidebar');
    const details = document.getElementById('contactListClicked');
    if (section) section.classList.remove('show-mobile-section');
    if (sidebar) sidebar.classList.remove('hide-mobile-sidebar');
    if (details) details.style.display = '';
}

function showAddContactBtnMobile() {
    const addBtn = document.querySelector('.add-contact-btn-mobile');
    if (addBtn) addBtn.classList.remove('hide-mobile-edit');
}

function closeMobileEditDropdownIfOpen() {
    if (typeof removeMobileEditDropdown === 'function') removeMobileEditDropdown();
}

function handleResponsiveCloseMobileSection() {
    window.addEventListener('resize', () => {
        if (window.innerWidth > 780) {
            showDesktopView();
            hideMobileButtons();
            closeMobileEditDropdownIfOpen();
            showAddContactBtnMobile();
        }
    });
}

handleResponsiveCloseMobileSection();