import "../style.css";
import "../index.css";
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import * as olProj from 'ol/proj';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";

// Si une carte existe déjà, la dissocier de son conteneur DOM
if (window.map) {
    window.map.setTarget(null);
}

// Fond de carte simple (sans couche vectorielle)
const fondcarte = new TileLayer({
    source: new OSM(),
});

// Couche vectorielle pour les données GeoJSON
const vector = new VectorLayer({
    source: new VectorSource({
        url: './dirif2.geojson',
        format: new GeoJSON(),
    }),
});

// Création de la carte
const map = new Map({
    target: 'interactive_map',
    layers: [fondcarte, vector],  // Ajout du fond de carte et de la couche vectorielle
    view: new View({
        center: olProj.fromLonLat([2.33333, 48.866667]), // Centré sur l'Ile-de-France
        zoom: 10,
    }),
});

// Événement DOMContentLoaded pour gérer tous les événements une fois le DOM chargé
document.addEventListener('DOMContentLoaded', function() {
    const addLineButton = document.getElementById('add_line');
    const choixNuitSection = document.getElementById('choix_nuit');
    const exportMapButton = document.getElementById('export_map');
    const exportFormatSelect = document.getElementById('export_format');
    const container = document.getElementById('popup');
    const content = document.getElementById('popup-content');
    const closer = document.getElementById('popup-closer');

    // Gérer l'affichage de la section 'choix_nuit'
    if (addLineButton && choixNuitSection) {
        addLineButton.addEventListener('click', function() {
            if (choixNuitSection.style.display === 'none' || choixNuitSection.style.display === '') {
                choixNuitSection.style.display = 'block';
                addLineButton.value = 'Réduire';
            } else {
                choixNuitSection.style.display = 'none';
                addLineButton.value = 'Ajouter fermeture';
            }
        });
    } else {
        console.error("Element with ID 'add_line' or 'choix_nuit' not found.");
    }

    // Gérer l'affichage des popups sur la carte
    if (container && content && closer) {
        const overlay = new Overlay({
            element: container,
            autoPan: true,
            autoPanAnimation: {
                duration: 250,
            },
        });

        map.addOverlay(overlay);

        map.on('singleclick', function (evt) {
            const coordinate = evt.coordinate;
            const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                return feature;
            });

            if (feature) {
                const properties = feature.getProperties();
                const popupContent = `
                    <p>Route: ${properties.route || "N/A"}</p>
                    <p>PR Début: ${properties.prStart || "N/A"}</p>
                    <p>PR Fin: ${properties.prEnd || "N/A"}</p>
                `;
                content.innerHTML = popupContent;
                overlay.setPosition(coordinate);
            } else {
                overlay.setPosition(undefined);
                closer.blur();
            }
        });

        closer.onclick = function () {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };
    } else {
        console.error("Elements with ID 'popup', 'popup-content', or 'popup-closer' not found.");
    }

    // Gérer l'exportation de la carte
    if (exportMapButton && exportFormatSelect) {
        exportMapButton.onclick = () => {
            const format = exportFormatSelect.value;
            exportMap(format);
        };
    } else {
        console.error("Elements with ID 'export_map' or 'export_format' not found.");
    }
});

function exportMap(format) {
    const mapElement = document.getElementById('interactive_map');
    
    html2canvas(mapElement).then(canvas => {
        if (format === 'png') {
            const imgData = canvas.toDataURL('image/png');
            downloadImage(imgData, 'map.png');
        } else if (format === 'jpeg') {
            const imgData = canvas.toDataURL('image/jpeg');
            downloadImage(imgData, 'map.jpeg');
        } else if (format === 'pdf') {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape');
            const imgWidth = 297;
            const pageHeight = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('map.pdf');
        }
    });
}

function downloadImage(data, filename) {
    const a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Assigner la carte à une variable globale pour vérification ultérieure
window.map = map;

export { map, vector };
