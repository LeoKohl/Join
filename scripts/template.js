// Returns the mobile edit dropdown HTML template
function getMobileEditDropdownTemplate(idx) {
    return `
        <button class="edit-btn" onclick="openContactForm('edit', ${idx}); removeMobileEditDropdown(); event.stopPropagation();">
            <img src="assets/img/icons/add-contact/edit.svg">
            Edit</button>
        <button class="delete-btn" onclick="getIdToDelete(${idx}); removeMobileEditDropdown(); event.stopPropagation();">
            <img src="assets/img/icons/add-contact/delete.svg">
            Delete</button>
    `;
}
// Returns the contact group header HTML template
function getGroupTemplate(letter) {
    return `
        <div class="contact-group-letter">${letter}</div>
        <hr class="contact-divider">
    `;
}


// Returns the contact list item HTML template
function getContactListItemTemplate(contact, colorClass, initials, contactIndex) {
    return `
        <div class="contact-item" data-index="${contactIndex}">
            <div class="contact-avatar ${colorClass}">${initials}</div>
            <div class="contact-item-content">
                <div class="contact-name">${contact.name["first-name"]} ${contact.name["last-name"]}</div>
                <div class="contact-email">${contact.email}</div>
            </div>
        </div>
    `;
}
// Returns the contact details HTML template
function getContactDetailsTemplate(contact, colorClass, initials, idx) {
    return `
        <div class="contact-details">
            <div class="contact-details-top">
                <div class="contact-avatar-clicked display-standard ${colorClass}">${initials}</div>
                <div class="contact-name-edit-delete">
                    <div class="contact-name-clicked">${contact.name["first-name"]} ${contact.name["last-name"]}</div>
                    <div class="contact-details-actions">
                        <button class="edit-btn" onclick="openContactForm('edit', ${idx})"><img src="assets/img/icons/add-contact/edit.svg">Edit</button>
                        <button class="delete-btn" onclick="getIdToDelete(${idx})"><img src="assets/img/icons/add-contact/delete.svg">Delete</button>
                    </div>
                </div>
            </div>
            <div class="contact-details-info">
                <div class="contact-details-info-title">Contact Information</div>
                <div class="contact-details-info-section">
                    <div class="contact-details-info-section-title">Email</div>
                    <div class="contact-details-info-email">${contact.email}</div>
                </div>
                <div class="contact-details-info-section">
                    <div class="contact-details-info-section-title">Phone</div>
                    <div class="contact-details-info-phone">${contact["phone-number"]}</div>
                </div>
            </div>
        </div>
    `;
}

function getKanbanEmptyMessage(headerText) {
	return /* HTML */ ` <div class="empty-msg">No tasks ${headerText}</div>`;
}

function getTaskPlaceholderTemplate() {
    return /* HMTL */ `<div class="placeholder"></div>`
}