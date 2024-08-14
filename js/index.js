/* Import des fonctions ou entités venant des autres modules */
import { afficher_route, appel_mode_libre, checkline, recherche_dico, verifer_inc } from "./afficher_route.js";
import { get_route, del_layers, read_file, actionner, del_line, ajouter_route, combi_inc } from "./afficher_route.js";
import { map } from "./main.js";
import { transform } from "ol/proj.js";


// Gestion du bouton "Mode libre"
const freeModeButton = document.getElementById('free_mode');
if (freeModeButton) {
    freeModeButton.addEventListener('click', () => {
        window.location.href = 'mode-libre.html'; // Redirection vers mode-libre.html
    });
} else {
    console.error("Element with ID 'free_mode' not found.");
}

// Gestion du bouton "Afficher fermetures depuis le fichier"
const showFileModeButton = document.getElementById('show_file_mode');
if (showFileModeButton) {
    showFileModeButton.addEventListener('click', () => {
        window.location.href = 'index.html'; // Redirection vers index.html
    });
} else {
    console.error("Element with ID 'show_file_mode' not found.");
}
// Gestion du bouton "Ajouter une fermeture"
const toggleButton = document.getElementById('voir_carte');
if (toggleButton) {
    toggleButton.addEventListener('click', () => {
        appel_mode_libre();
    });
} else {
    console.error("Element with ID 'voir_carte' not found.");
}

// Gestion du bouton "Supprimer toutes les couches"
const button2 = document.getElementById("del_layers");
if (button2) {
    button2.addEventListener('click', () => {
        del_layers();
    });
} else {
    console.error("Element with ID 'del_layers' not found.");
}

// Gestion de l'entrée des 2 fichiers nécessaires au bon fonctionnement
const but_load = document.getElementById("add_file");
const check = document.getElementsByClassName("loaded_file");
if (but_load) {
    but_load.addEventListener('change', () => { 
        check[1].style.visibility = "visible";
    });
} else {
    console.error("Element with ID 'add_file' not found.");
}

const but_load2 = document.getElementById("add_dico");
if (but_load2) {
    but_load2.addEventListener('change', () => { 
        check[0].style.visibility = "visible";
    });
} else {
    console.error("Element with ID 'add_dico' not found.");
}

const but_load3 = document.getElementById("add_inco");
if (but_load3) {
    but_load3.addEventListener('change', () => { 
        check[2].style.visibility = "visible";
    });
} else {
    console.error("Element with ID 'add_inco' not found.");
}

// Gestion bouton "Afficher"
const lire_but = document.getElementById("lire_ligne");
if (lire_but) {
    lire_but.addEventListener('click', () => {
        read_file();
    });
} else {
    console.error("Element with ID 'lire_ligne' not found.");
}

/* Gestion de la sélection du menu déroulant */
const action = document.getElementById("sel_action");
if (action) {
    action.addEventListener('click', () => {
        actionner();
    });
} else {
    console.error("Element with ID 'sel_action' not found.");
}

// Bouton "Ajouter" dans le bloc d'ajout de fermetures manuel
const ajout_ferm = document.getElementById("add_line");
if (ajout_ferm) {
    ajout_ferm.addEventListener('click', () => {
        ajouter_route();
    });
} else {
    console.error("Element with ID 'add_line' not found.");
}

// Gestion des boutons "X" pour supprimer une couche en particulier
const table = document.getElementById('ferm_list');
if (table) {
    table.addEventListener("click", function(event) {
        if (event.target.classList.contains("del_but")) {
            var button = event.target;
            var rowIndex = button.closest("tr").rowIndex;
            del_line(rowIndex);
        }
    });
} else {
    console.error("Element with ID 'ferm_list' not found.");
}

// Création du dictionnaire
export var mapFermetures = new Map();
export var dictionnaire = new Map(); 

const load_dico = document.getElementById("add_dico");
if (load_dico) {
    load_dico.addEventListener('change', () => {
        dictionnaire.clear();
        var dico = document.querySelector("#add_dico").files;
        var file = dico[0]; 
        var reader = new FileReader();
        reader.readAsText(file, 'utf-8');

        reader.onload = function(event) {
            var contents = event.target.result;
            var lines = contents.split('\n');

            for (let i = 0; i < lines.length; i++) {
                lines[i] = lines[i].trim().replaceAll(" ", "").toLowerCase();
                lines[i] = lines[i].replaceAll("\t", "");
                var tab = lines[i].split(":");
                dictionnaire.set(tab[0], tab[1]);
            }
        }
    });
} else {
    console.error("Element with ID 'add_dico' not found.");
}

// Création d'une classe Combinaison pour mémoriser les couples de portions de routes incompatibles
export class Combinaison {
    constructor() {
        this.nom_routes = new Map();
        this.addy = new Array(); 
    }

    addToMap(key, value) {
        this.nom_routes.set(key, value);
    }

    mapSize() {
        return this.nom_routes.size;
    }

    addToArray2(tab) {
        this.addy = tab;
    }

    getValueFromMap(key) {
        return this.nom_routes.get(key);
    }

    hasKeyInMap(key) {
        return this.nom_routes.has(key);
    }

    gettab() {
        return this.addy;
    }
}

// Ce tableau stocke les incompatibilités existantes. Il stocke des Combinaisons
export var combinaisons_tab = [];

const incompa_load = document.getElementById("add_inco");
if (incompa_load) {
    incompa_load.addEventListener('change', () => {
        combinaisons_tab = [];
        var csv = document.querySelector("#add_inco").files;
        var file = csv[0]; 
        var reader = new FileReader();
        reader.readAsText(file, 'utf-8');

        reader.onload = function(event) {
            var contents = event.target.result;
            var lines = contents.split('\r\n');
            var header;
            var sub_header;

            for (let i = 1; i < lines.length; i++) {
                if (i == 1) {
                    header = lines[i].split(";");
                    header.splice(0, 3);
                } else if (i == 2) {
                    sub_header = lines[i].split(";");
                    sub_header.splice(0, 3);
                } else {
                    if (lines[i][1] != "" && lines[i][1] != undefined) {
                        combi_inc(header, sub_header, lines[i].split(";"), i);
                    } else {
                        console.log("Error !!");
                    }
                }
            }
        }
    });
} else {
    console.error("Element with ID 'add_inco' not found.");
}

const but_inc = document.getElementById("check_errors");
if (but_inc) {
    but_inc.addEventListener('click', () => {
        verifer_inc();
    });
} else {
    console.error("Element with ID 'check_errors' not found.");
}
