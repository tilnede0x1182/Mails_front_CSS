// # Importations
"use strict";

// # Données
const initialMessages = [
	{
		name: "Alice Martin",
    gender: "women",
		text: "Salut, j’espère que tu passes une bonne journée !",
	},
	{
		name: "Mohamed Karim",
    gender: "men",
		text: "Bonjour, as-tu vu le dernier article que je t’ai envoyé ?",
	},
	{
		name: "Sophie Dubois",
    gender: "women",
		text: "Coucou, on se retrouve pour le café demain matin ?",
	},
	{
		name: "Léo Moreau",
    gender: "men",
		text: "Salut, ton retour sur le dossier est top, merci !",
	},
	{
		name: "Emma Lefèvre",
    gender: "women",
		text: "Bonjour, n’oublie pas la réunion de cet après-midi.",
	},
	{
		name: "Victor Nguyen",
    gender: "men",
		text: "Salut, j’ai ajouté quelques notes dans le document partagé.",
	},
];

// # Fonctions utilitaires
// ## Gestion DOM
/**
 * Crée l’élément avatar.
 * @returns {HTMLImageElement}
 */
function createAvatarElement() {
	const avatarImg = document.createElement("img");
	avatarImg.classList.add("avatar");
	avatarImg.src = "https://randomuser.me/api/portraits/men/1.jpg";
	avatarImg.alt = "avatar";
	return avatarImg;
}

/**
 * Construit le conteneur texte (nom + message).
 * @param {string} userName
 * @param {string} messageText
 * @returns {HTMLDivElement}
 */
function createTextContainer(userName, messageText) {
	const containerDiv = document.createElement("div");
	containerDiv.classList.add("text-container");
	const nameHeading = document.createElement("h6");
	nameHeading.textContent = userName;
	const messageParagraph = document.createElement("p");
	messageParagraph.textContent = messageText;
	containerDiv.appendChild(nameHeading);
	containerDiv.appendChild(messageParagraph);
	return containerDiv;
}

/**
 * Crée le bouton de suppression pour la ligne fournie.
 * @param {HTMLDivElement} rowElement
 * @returns {HTMLButtonElement}
 */
function createDeleteButton(rowElement) {
	const deleteBtn = document.createElement("button");
	deleteBtn.classList.add("delete");
	deleteBtn.textContent = "✖";
	deleteBtn.addEventListener("click", () => {
		rowElement.remove();
		updateCount();
	});
	return deleteBtn;
}

// ## Compteur
/**
 * Met à jour le compteur de messages affiché.
 */
function updateCount() {
	const msgContainerDiv = document.getElementById("msg-container");
	const counterSpan = document.getElementById("count");
	counterSpan.textContent = msgContainerDiv.querySelectorAll(".row").length;
}

// ## Recherche
/**
 * Retourne les messages sous forme d’objets pour Fuse.js.
 * @returns {Array<Object>}
 */
function getMessagesAsObjects() {
	const msgContainerDiv = document.getElementById("msg-container");
	const rowsNodeList = msgContainerDiv.querySelectorAll(".row");
	return Array.from(rowsNodeList).map((rowElement) => ({
		element: rowElement,
		name: rowElement.querySelector("h6").textContent,
		text: rowElement.querySelector("p").textContent,
	}));
}

// # Fonctions principales
/**
 * Assemble et retourne la ligne complète d’un message.
 * @param {string} userName
 * @param {string} messageText
 * @returns {HTMLDivElement}
 */
function buildMessageRow(userName, messageText) {
	const rowDiv = document.createElement("div");
	rowDiv.classList.add("row");
	rowDiv.appendChild(createAvatarElement());
	rowDiv.appendChild(createTextContainer(userName, messageText));
	rowDiv.appendChild(createDeleteButton(rowDiv));
	return rowDiv;
}

/**
 * Gère l’ajout d’un message.
 */
function handleAddMessage() {
	const inputAddMessage = document.getElementById("add-message");
	const msgContainerDiv = document.getElementById("msg-container");
	const content = inputAddMessage.value.trim();
	if (content === "") return;
	msgContainerDiv.prepend(buildMessageRow("New User", content));
	inputAddMessage.value = "";
	updateCount();
}

/**
 * Gère la recherche floue dans les messages.
 * @param {string|null} forceQuery null pour lire la valeur de l’input, ou string pour forcer une valeur
 */
function handleSearch(forceQuery = null) {
	const inputSearch = document.getElementById("search-message");
	const queryString =
		forceQuery !== null ? forceQuery : inputSearch.value.trim();
	const messagesArray = getMessagesAsObjects();
	if (!queryString) {
		messagesArray.forEach(
			(msgObj) => (msgObj.element.style.display = "flex")
		);
		return;
	}
	const fuseInstance = new Fuse(messagesArray, {
		keys: ["name", "text"],
		threshold: 0.4,
	});
	const resultSet = new Set(
		fuseInstance.search(queryString).map((r) => r.item.element)
	);
	messagesArray.forEach((msgObj) => {
		msgObj.element.style.display = resultSet.has(msgObj.element)
			? "flex"
			: "none";
	});
}

// # Main
/**
 * Point d’entrée : initialise les écouteurs et le compteur.
 */
function main() {
	const btnAddMessage = document.getElementById("btn-add");
	const btnSearchMessage = document.getElementById("btn-search");
	const inputSearch = document.getElementById("search-message");
	const msgContainerDiv = document.getElementById("msg-container");

	// 🟡 INSERTION INITIALE des messages de départ
	initialMessages.forEach((msg, index) => {
		const avatarImg = document.createElement("img");
		avatarImg.classList.add("avatar");
		avatarImg.src = "https://randomuser.me/api/portraits/"+msg.gender+"/"+index+".jpg";
		avatarImg.alt = "avatar";

		const row = document.createElement("div");
		row.classList.add("row");
		row.appendChild(avatarImg);
		row.appendChild(createTextContainer(msg.name, msg.text));
		row.appendChild(createDeleteButton(row));

		msgContainerDiv.appendChild(row);
	});

	// 🔴 FIX : ajouter les écouteurs sur les nouveaux boutons delete
	msgContainerDiv.querySelectorAll(".delete").forEach((btnElement) => {
		btnElement.addEventListener("click", (event) => {
			const rowDiv = event.target.closest(".row");
			if (rowDiv) {
				rowDiv.remove();
				updateCount();
			}
		});
	});

	// 🎯 Ajout
	btnAddMessage.addEventListener("click", handleAddMessage);
	document
		.getElementById("add-message")
		.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				handleAddMessage();
			}
		});

	// 🔎 Recherche
	let searchTimeoutId = null;

	btnSearchMessage.addEventListener("click", () => {
		handleSearch();
	});

	inputSearch.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			if (searchTimeoutId) {
				clearTimeout(searchTimeoutId);
				searchTimeoutId = null;
			}
			handleSearch();
		}
	});

	inputSearch.addEventListener("input", () => {
		if (searchTimeoutId) {
			clearTimeout(searchTimeoutId);
		}
		searchTimeoutId = setTimeout(() => {
			handleSearch();
		}, 200);
	});

	updateCount();
}

// # Lancement du programme
document.addEventListener("DOMContentLoaded", main);
