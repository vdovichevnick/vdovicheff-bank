// saveUser.js
let inMemoryID = null;
let inMemoryRole = null;

export function saveUserData(id, role) {
    inMemoryID = id;
    inMemoryRole = role;
}

export function getSavedUserData() {
    return { id: inMemoryID, role: inMemoryRole };
}

export function resetSavedUserData() {
    inMemoryID = null;
    inMemoryRole = null;
}