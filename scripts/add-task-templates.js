function getSubtaskTemplate(text) {
  return `
 <div class="subtask-text-box flex justify-between ">
  <div class="subtask-entry font-bundle" onclick="startEditSubtask(this)">•${text}</div>
  <div class="icon-edit-subtask-box display-standard d-none">
    <img class="icon-task edit-icon" src="assets/img/icons/add_task/Property1=edit.svg" alt="Edit Icon" onclick="startEditSubtask(this)">
    <svg width="2" height="24" viewBox="0 0 2 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.14453 0V24" stroke="#A8A8A8" />
    </svg>
    <img class="icon-task delete-subtask-input" src="assets/img/icons/add_task/delete.svg" alt="Cancel Icon" onclick="deleteSubtask(this)">
    <img class="icon-task confirm-icon d-none" src="assets/img/icons/add_task/check_noir.svg" alt="Confirm Icon" onclick="finishEditSubtask(this)">
  </div>
</div>
 `;
}

function changeDivtoInputTemplate(text) {
  return `
<input class="subtask-entry font-bundle border-bottom-blue" type="text" value="${text}"
    onkeydown="if(event.key==='Enter'){ finishEditSubtask(this); }">
`;
}

function getReturnToDivTemplate(text) {
  return `
<div class="subtask-entry font-bundle" onclick="startEditSubtask(this)">
    ${text}
</div>
`;
}

function getAssignedNameTemplate(initials, name, color) {
  return `
    <div class="contact-item" onclick="toggleCheckboxContact(this)">
      <span class="avatar display-standard white-color"
            style="background-color: ${color};">${initials}</span>
      <span class="contact-name">${name["first-name"]} ${name["last-name"]}</span>
      <input type="checkbox"
             class="contact-checkbox"
             data-name="${name["first-name"]} ${name["last-name"]}"
             data-initials="${initials}"
             onclick="toggleCheckboxContact(this); event.stopPropagation();">
    </div>
  `;
}

