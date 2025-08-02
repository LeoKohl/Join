// Returns the mobile edit dropdown HTML template
function getMobileEditDropdownTemplate(idx) {
    return `
        <button class="edit-btn" onclick="editContact(${idx}); removeMobileEditDropdown(); event.stopPropagation();">
            <img src="assets/img/icons/add-contact/edit.svg">
            Edit</button>
        <button class="delete-btn" onclick="deleteContact(${idx}); removeMobileEditDropdown(); event.stopPropagation();">
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
                <div class="contact-name">${contact.name}</div>
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
                <div class="contact-avatar-clicked ${colorClass}">${initials}</div>
                <div class="contact-name-edit-delete">
                    <div class="contact-name-clicked">${contact.name}</div>
                    <div class="contact-details-actions">
                        <button class="edit-btn" onclick="editContact(${idx})"><img src="assets/img/icons/add-contact/edit.svg">Edit</button>
                        <button class="delete-btn" onclick="deleteContact(${idx})"><img src="assets/img/icons/add-contact/delete.svg">Delete</button>
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
                    <div class="contact-details-info-phone">${contact.phone}</div>
                </div>
            </div>
        </div>
    `;
}
