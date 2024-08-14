import { vector, map } from "./main.js"
import VectorSource from '../node_modules/ol/source/Vector';
import VectorLayer from '../node_modules/ol/layer/Vector';
import Style from '../node_modules/ol/style/Style';
import Stroke from '../node_modules/ol/style/Stroke';
import { combinaisons_tab, dictionnaire } from "./index.js";
import { mapFermetures } from "./index.js";
import { Combinaison } from "./index.js";


export function afficher_route(entry,pr1, pr2, sens, couleur){
   var creation=0;

  //On attend que les données soient prêtes
  if (vector.getSource().getState() === 'ready') {
    
    if(sens==="2"){
      sens="";
    }

    else if(sens=="Int"){
      sens="I";
    }

    else if(sens=="Ext"){
      sens="E";
    }


 
   
    //On récupère chaque Features du tableau de features de dirif.geojson
    var features = vector.getSource().getFeatures();

    //On crée une nouvelle source de données (vide pour l'instant)
    var filteredSource = new VectorSource();

    //Pour chaque ligne du tableau features
    features.forEach(function(feature) {
      //On récupère les propriétés de chaque Feature (NOM_USAGE, NOM_SEGMENT...)
      var properties = feature.getProperties();
      var debut=parseInt(properties.PR_DEBUT);
      var fin=parseInt(properties.PR_FIN);
      var tmp=0;
      var tab_infos=properties.NOM_SEGMENT.split("/");

      if(fin < debut){
        tmp=fin;
        fin=debut;
        debut=tmp;
        
      }
    
      //Si le nom de la route correspond et le PR de début et de fin sont dans ceux rentrés on rajoute le segment à la source de données VectorSource
      //De plus on regarde les routes donnant sur celle qui est rentrée.
                                           /* Si une sortie donne sur la route*/                                                          /* Si une entrée donne sur la route*/                                                     /* Si un segment de la couche vectorielle correspond*/    /* S'il y a une route qui donne sur la route rentrée ex : A3 donnant sur A1 sera fermée si A1 fermée*/
      if ( (properties.NOM_SEGMENT.includes("SEG/S/"+entry+"-"+sens) && (debut>=pr1 && fin<=pr2 ) ) || (properties.NOM_SEGMENT.includes("SEG/E/"+entry+"-"+sens) && (debut>=pr1 && fin<=pr2 ) ) || (properties.NOM_SEGMENT.includes("SEG/"+entry+"-"+sens) && (debut>=pr1 && fin<=pr2 ) ) || (tab_infos[tab_infos.length-1].includes(entry+"-"+sens) && (debut>=pr1 && fin<=pr2 ) )) {
        filteredSource.addFeature(feature);
        creation++;

      }

      


    });

    //On vérifie si on a trouvé une route correspondante à l'entrée
    if(creation > 0){
      //Création de la nouvelle couche vectorielle
      var new_layer = new VectorLayer({
        
        nom: entry+" "+sens,
        source: filteredSource,
        style: new Style({
          stroke: new Stroke({
            color: couleur,
            width: 2,
            
          })/*,
          text: new Text({
            text: sens,
            offsetX: 10
          })*/
        })

      });
  
      //console.log(new_layer.getSource().getFeatures());
      map.addLayer(new_layer);
    }
    else{
      console.log("Aucune route correspond à "+entry+" "+sens+" "+pr1+" "+pr2);
    }
  }

}


export function getPr(pr){
  var tab=[];
  var num=0;
  if(pr.includes('+')){
    tab=pr.split('+');
    
   if(parseInt(tab[1])<=9999){
      num=parseInt(tab[0]*10000)+parseInt(tab[1]);
   }

   else{
    num=parseInt(tab[0]*10000);
   }

  }

  else{
    num = parseInt(pr)*10000;
  }

  
 return num;

}

/*Fonction servant à afficher le contenu selon le menu déroulant */
export function actionner() {

  var action=document.getElementById("sel_action");
  var content=document.getElementById("contenu");

  
  if(action.value==="Afficher fermetures depuis fichier"){

    content.style.display="flex";
  
  }
  else{
    content.style.display="none";
  
  }
}

//Affichage et réduction du block "Ajouter une fermeture"
export function ajouter_route(){
  var nuit=document.getElementById("choix_nuit");
  var but=document.getElementById("add_line");

  if(nuit.style.display == "none"){
    nuit.style.display="flex";
    but.value="Réduire";
  }
  else{
    but.value="Ajouter fermeture";
    nuit.style.display="none";
  }
}


//Cette fonction sert à vérifier si une route rentrée dans un PR précis existe bel et bien
export function get_route(route, sens, pr1, pr2){
  var check=0;
  

  if(sens=="2"){
    sens="";
  }

  else if(sens=="Int"){
    sens="I";
  }

  else if(sens=="Ext"){
    sens="E";
  }
  //On attend de recevoir des données de geoJSON car il y a asynchronisation
  if (vector.getSource().getState() === 'ready') {
   
    //On récupère chaque Features du tableau de features de dirif.geojson
    var features = vector.getSource().getFeatures();
 
    //On crée une nouvelle source de données (vide pour l'instant)
    //Pour chaque ligne du tableau features

    features.forEach(function(feature) {
      //On récupère les propriétés de chaque Feature (NOM_USAGE, NOM_SEGMENT...)
      var properties = feature.getProperties();
      var noms=properties.NOM_SEGMENT/*.split("/")*/;
      var debut=parseInt(properties.PR_DEBUT);
      var fin=parseInt(properties.PR_FIN);
      var tmp=0;

      if(fin < debut){
        tmp=fin;
        fin=debut;
        debut=tmp;
      
      }
    
      //Si le nom de la route + le sens existe dans l'intervalle de PR entré, c'est bon
      if(noms.includes("SEG/"+route+"-"+sens) && (debut>=pr1 && fin<=pr2)){
     
        check++;
      }

    });

    if(check==0){
      return false;
    }

    else{
      return true;
    }
  
  }

}

//Fonction pour supprimer les lignes du tableau de droite
export function del_tab(text){
  var table=document.getElementById(text);

  var child = table.lastElementChild; 

    while (child) {
        
            table.removeChild(child);
            child = table.lastElementChild;
    }
}

//Fonction pour supprimer toutes les couches. Sauf la carte est le réseau de base
export function del_layers(){
  var osmV=map.getLayers().getArray(); //tableau du style [TileLayer, VectorLayer, VectorLayer]. Les 2 premières doivent tout le temps être là
  var len = osmV.length;
  mapFermetures.clear();

  if(osmV.length>2){
    //console.log("ya des couches de rouges");
    for(var i=len-1;i>1;i--){
      map.removeLayer(osmV[i]);
    }

    del_tab("ferm_list");

  }


}

export function renvoyer_mois(num){
  var nb=parseInt(num);

  if(nb==1){
    return "janvier";
  }

  else if(nb==2){
    return "fevrier";
  }
  else if(nb==3){
    return "mars";
  }
  else if(nb==4){
    return "avril";
  }
  else if(nb==5){
    return "mai";
  }
  else if(nb==6){
    return "juin";
  }

  else if(nb==7){
    return "juillet";
  }
  else if(nb==8){
    return "aout";
  }
  else if(nb==9){
    return "septembre";
  }
  else if(nb==10){
    return "octobre";
  }
  else if(nb==11){
    return "novembre";
  }
  else if(nb==12){
    return "decembre";
  }
}

//Récupération du nom des routes
export function renvoyer_route(tab){
  for(let i=0;i<=5;i++){
   
    tab.shift();
  }

  var z=0;

  //Les 1ères colonnes du tableau de fermetures sont inutiles
  while(z != 6){
    tab.splice(2,1);
    z++;
  }

  return tab;
}

//nom_route est le nom de la route + sens. Cell est le contenu de la cellule du tableau. Mano (0 ou 1) est si la lecture est du tableau ou ajoutée en mode libre ou non
//Cette fonction sert à créer une ligne dans le tableau de droite
export function creertableau(nom_route, cell, mano, color) { 
  
  //On va créer des enfants à la balise <table>
  var table=document.getElementById("ferm_list");
  var new_row=document.createElement("tr");
  var new_td=[];
  var route=document.createTextNode(nom_route[0]);
  var sens=document.createTextNode(nom_route[1]);
  var infos=document.createTextNode(cell);
  var io=document.createElement("i");

  io.setAttribute("class", "fas fa-times del_but");
 
  //je crée les 3 cellules
  for(let i=0;i<4;i++){
    new_td.push(document.createElement("td"));
  }
  
  new_td[0].appendChild(route);
  new_td[1].appendChild(sens);
  new_td[2].appendChild(infos);
  new_td[3].appendChild(io);

  new_row.appendChild(new_td[0]);
  new_row.appendChild(new_td[1]);
  new_row.appendChild(new_td[2]);
  new_row.appendChild(new_td[3]);

  new_row.setAttribute("class", "rowy");

  if(mano==1){
    new_row.setAttribute("style", "background-color: "+color+";");
  }
  
  table.appendChild(new_row);
  
}

//Ajout d'une fermeture manuellement
export function appel_mode_libre(){
  //Variables nécessaires pour récupérer les informations rentrées sur la page
  var nom=document.getElementById("val_route").value;
  var debut=document.getElementsByClassName("pr_value")[1].value;
  var fin = document.getElementsByClassName("pr_value")[2].value;
  //Valeur correspondant au sens, la chaine de caractère est traitée sous forme de tableau
  var sens_val=document.getElementById("sel_direction").value.split(" ");
  var portion=document.getElementById("sel_type");
  var a=0;
  var b=0;
  var color_choice=document.getElementById("color_selection").value;
  
  //Le sens est écrit: Yanky Y. On récupère le Y
  var sens="";

  if(sens_val.length==3){
    sens=sens_val[2];
  }
  else{
    sens=sens_val[1];
  }

 
  /////1er élé du tableau
  var infos=[nom, sens];
  var vide=[0, 100000000];
  var lastkey=infos.toString();
 

  //Verif si la clef n'existe pas deja dans la map. Car elle doit être UNIQUE
  if (mapFermetures.has(lastkey)) {

    //On incrémente jusqu'à ce qu'on ait une clef nouvelle
    var counter = 2;
    while (mapFermetures.has(infos[0] + "_" + counter+","+sens)) {
      counter++;
    }
    infos[0] = infos[0] + "_" + counter;
  
  }

  //Affichage de la route entière
  if(portion.value === "Toute la route"){

    if(nom.trim() != "" && get_route(nom, sens, 0,100000000)){
      

      mapFermetures.set(infos.toString(), vide);
      afficher_route(nom, 0,100000000, sens, color_choice);
      creertableau(infos, "Toute la route", 1, color_choice);

     
    }
    else{
      alert("Nom de route incorrect. Attention au sens");
      return;
    }
  }

    //Affichage sur des PR précis
  else if(portion.value==="PR"){

    //Vérification des 2 PR rentrées
    if(debut != "" && fin != "" && nom.trim() != ""){
      a=getPr(debut);
      b=getPr(fin);
      if(a <= b){

        if(get_route(nom, sens, a, b)){
          var PRs=[a, b];
          mapFermetures.set(infos.toString(), PRs);
          creertableau(infos, "PR"+debut+" a "+fin, 1, color_choice);
          afficher_route(nom, getPr(debut),getPr(fin), sens, color_choice);
        }
        else{
          alert("Route inexistante. Veuillez vérifier le nom, le sens et les PR rentrés");
          return;
        }
      }
  
      else{
        alert("Erreur dans la lecture d'une valeur PR\nIls doivent être mis dans l'ordre croissant");
        return;
      }
    }
  
    else{
      alert("Une entrée (nom et/ou PR) est vide");
      return;
    }

    
  }

  //Surnom
else{
    afficher_route(nom, 0,100000000, sens, "#11CD1");
  }

  
  

}

//Fonction pour supprimer une couche donc une fermeture !
export function del_line(idx) { 
    var mapLayers=map.getLayers().getArray();
    var table=document.getElementById("ferm_list");
    //console.log(mapLayers);

    if(mapLayers.length > 2){
      map.removeLayer(mapLayers[idx+1]);
    }

    idx--;
    // Check if the childIndex is within valid range
    if (idx >= 0 && idx < table.children.length) {
      var childNode = table.children[idx];
      table.removeChild(childNode);

   
      var zazou=childNode.getElementsByTagName("td");
      var tabou=[zazou[0].innerHTML, zazou[1].innerHTML];
  
      //Suppression dans la map
      if(mapFermetures.has(tabou.toString())){
        mapFermetures.delete(tabou.toString());
      }

      else{
        console.log("Clef introuvable pour suppression !");
      }

      
    }

}

//Ici on va transfomer "1a15" en [10000, 150000]
export function transform(text) { 

  var tab=text.split("a");
  var tmp=0;

  tab[0]=getPr(tab[0]);
  tab[1]=getPr(tab[1]);
  
  if(tab[0]>tab[1]){
    tmp=tab[0];
    tab[0]=tab[1];
    tab[1]=tmp;
  }

  return tab;
}

//Cette fonction sert à voir si le valeur de la cellule est dans le Dictionnaire ou non
export function recherche_dico(text, nom_route){

    //On enlève les espaces et on met tout en minuscule
    text=text.toLowerCase().replaceAll(" ", "");
    text=text.replaceAll("\t", "");
    nom_route=nom_route.toLowerCase(" ","");

    var all=nom_route+"_"+text;
    
  //Recherche dans le dictionnaire, qui ici est une Map
  if(dictionnaire.has(all)){
  
    return dictionnaire.get(all);
  }

  else if(dictionnaire.has(text)){
   
    return dictionnaire.get(text);
  }

  else{
    return false;
  }
}

//Dans cette fonction on va vérifier la forme de la cellule trouvée.
//Soit elle est déjà sous forme PR10a15 (forme idéale) ou en surnom
export function checkline(cell, nom_route){
  
  //Supression de tous les espaces
  cell=cell.replaceAll(" ", "");  
  const pattern = /^PR.*a.*$/;
 
  //On teste si la valeur de la cellule a une forme facile (PR__a__)
  if(pattern.test(cell)){
    
    //Suppression de "PR"
    cell=cell.substr(2);
    //Création du tableau avec les 2 valeurs PR
    var tab=cell.split("a");

    //ici on va voir si les valeurs de tab sont bien des entiers. Et si il y a un 10+120 on verifie qu'il y a bien un entier de chaque côté
    for(let i=0;i<tab.length;i++){
   
      if(tab[i].includes("+")){
        
        var sous_tab=tab[i].split("+");
        if(sous_tab.length == 2 && !isNaN(sous_tab[0]) && !isNaN(sous_tab[1])){
            //on passe car c'est bon
         }

        else{
          console.log("pas content");
          return false;
        }
        
      }

      else if(!isNaN(tab[i])){
        //on passe car c'est bon
      }

      else{
        //afficher sur la page
       
        return false;
      }
    }

    //si on arrive ici, c'est que tout est bon
    return cell;
  }

  //Sinon on vérifie dans le dictionnaire des surnoms
  else {
      var result=recherche_dico(cell, nom_route);
      return result;
  }


  //Si une valeur est retournée, c'est sous la forme 0a15+200
}

var pop=0;
//Fonction qui va lire toute la ligne, qui est un tableau
export function read_line(line, routes){
  
  var systemd="";
  pop=0;
  //console.clear();
  //On parcourt tout le tableau
 
  for(let i=0;i<line.length;i++){
    line[i]=line[i].trim();

    if(line[i] != "" && line[i]!="0"){
      var nom_route=routes[i].trim().split(" ");


      //Dans le cas où on a A86 Nord
      if(nom_route.length==3){
        systemd=nom_route[1];
        nom_route.splice(1,1);
      }

      //On vérifie si le nom de la route existe et que le sens est correct
      //ATTENTION : Les PR doivent être corrects à l'avance ! (Quand ils sont rentrés dans le tableau)
     
      if(!get_route(nom_route[0], nom_route[1],0,10000000)){
        alert(nom_route[0]+" n'existe pas ! Il y a peut être une erreur de sens dans le fichier. Voir ligne 2");
      }

      
      //Erreur si le nom de la route est mal écrit dans le fichier .csv
      else if(nom_route[1] != "Y" && nom_route[1] != "W" && nom_route[1] != "Int" && nom_route[1] != "Ext"){
        alert("Le sens doit être Y W Int ou Ext. Veuillez vérifier le fichier .csv");
    
      }

        //Erreur si le nom de la route est très mal écrit dans le fichier .csv
      else if(nom_route.length==1 || nom_route.length > 3){
        alert("Erreur : Nom de route INCORRECT dans le fichier csv. Le Nom doit respecter cette forme là : A89 infos_optionnelles Y");
      
      }


      else{
        
        //on vérifie la forme de la cellule. Si c'est "PR__a__" ou un surnom. Dans les 2 cas, result devient de la forme PR__a__.
       
        var result = checkline(line[i], nom_route[0]);
      
        //Soit result est sous forme PR0a15 ou false
        if (result !== false) {
          
          //On récupère un tableau de la forme [400351, 120653] représentant les 2 PR
          var restab=transform(result);

          //Création de la ligne dans le tableau à droite
          
         
          pop++;
          afficher_route(nom_route[0], restab[0] , restab[1], nom_route[1], "red");
        
          //Ajout à la map. Or la clef doit être unique donc si A86 on rajoute le secteur !

          if(mapFermetures.has(nom_route.toString()) || nom_route[0] === "A86"){
            mapFermetures.set(nom_route[0]+" "+systemd+","+nom_route[1], restab);
            nom_route[0]=nom_route[0]+" "+systemd;
            creertableau(nom_route, line[i], 0, "red");
          }

          else{
            mapFermetures.set(nom_route.toString(), restab);
            creertableau(nom_route, line[i], 0, "red");
          }


        } 
        
        //Affichage des cellules incomprises en bas de la page
        else {

          var diva=document.getElementById("last_one");
          var p=document.createElement("span");
          var son=document.createTextNode(nom_route[0]+" "+nom_route[1]+" "+line[i]+" ");
          
          p.appendChild(son);
          diva.appendChild(p);
        
        }
            
      }

      
    }

   

    
  }

  console.log(pop);
  
}

export function read_file(){

  //Fichiers importés
  var files = document.querySelector('#add_file').files;  //Fichier des fermetures
  var dico =document.querySelector("#add_dico").files;   //Fichier des surnoms (dictionnaire)

  //Date rentrée par l'utilisateur
  var date=document.getElementById("calendar").value;

  //Ce tableau accueillera le nom des routes + sens ex: A2 Y. Il suit la 2è ligne du tableau des fermetures
  var liste_route=[];

  //Servira à trouver la bonne ligne selon la date entrée en lisant la 1ère colonne. Dès qu'on change de mois, cette variable change aussi
  var mois="janvier";

  //Ecran blanc pendant le chargement
  var chargement = document.getElementById("white_pane");

  //On sépare la date reçue 12-07-2023 en un tableau  ["12", "07", "2023"]
  date=date.split("-");
 
 
  //On vérifie si il y a bien 2 fichiers rentés et que le champ date n'est pas vide. 
  if(files.length > 0 && date != "" && dico.length > 0){
      chargement.style.display="inline-block";

      /*On supprime les couches existantes, les lignes du tableau et on réinitialise la map*/
      del_layers();
      del_tab("ferm_list");
      del_tab("last_one");
      del_tab("INC_son");
      

      // Fichier des fermetures
      var file = files[0];
  
      // FileReader Object
      var reader = new FileReader();

      // Read file as string 
      reader.readAsText(file, 'utf-8');

      reader.onload = function (e) {

        //Données du fichier 
          var text = e.target.result; 
          
          var rowData = text.split('\n');
        
          //On va boucler en analysant chaque ligne afin de trouver celle correspondant à la date rentrée
          for(let i=0;i<rowData.length;i++){
           

            //On crée un tableau à partir de chaque ligne
            var lineTable=rowData[i].split(";");

            //On change de mois quand il y en a besoin
            if(lineTable[0] != mois && lineTable[0].length > 2){
              mois=lineTable[0];
            }
           

            if(i>3){
              var meso = renvoyer_mois(date[1]); 
              //Il n'y a ni de dimanche, samedi ou vendredi et jours fériés
              //Ici on trouve la ligne correspondante dans le tableau
              //Et dès qu'on l'a on lit la ligne en question

              //Des qu'on trouve la bonne ligne, on l'envoie dans une fonction qui va la lire
              if(parseInt(lineTable[2])==parseInt(date[2]) && mois==meso){
                read_line(renvoyer_route(lineTable), liste_route);
              }
              
            }

            else if(i==1){
              //On met dans un tableau le noms des routes (ligne 2 du fichier fermetures)
              liste_route=renvoyer_route(lineTable);
              //console.log(liste_route);

            }

            
            
          }

          chargement.style.display="none";
          };

  }
  
  
  if(files.length <= 0 || dico.length <= 0){
    alert("Veuillez introduire les 2 fichiers");
  }

  else if(date == ""){
    alert("Date non valide");
  }

 
}

/*Création des couples d'incompatibilités*/
export function combi_inc(noms, portion, line, idx) { 

  var nom_g=line[1].split(" ");
 
  var portion2=checkline(line[2], nom_g[0]);

  var systemd="";
  var systemd2="";

  //Tableau des PR des 2 éléments du couple <3
  var ptab1; //PR des horizontaux
  var ptab2; //PR des verticaux

  
  
  if(nom_g.length == 3){
   
    systemd=nom_g[1];
    nom_g.splice(1,1);
    nom_g[0]=nom_g[0]+" "+systemd;
    
  }

  
  if(portion2 != false){
    //console.log(nom_g+" "+portion_g);
    //ATTENTION, index décalés entre noms portion et line de 3 crans
    for(let i=idx+1;i<line.length;i++){

      
      if(line[i].toLowerCase() === "x"){
        /*Pq une différence d'indice me direz-vous ? Pcq noms[i-3] est une chaine de caractères. Or nom_g est un tableau*/
    
        
        //On recupere le nom horizontal et on extrait le nom + on gère si il y a une précision. Ex : A86 Nord Int
        var horiz_test=noms[i-3].split(" ");
      
        //On regarde la valeur de la cellule contenant la portion
        var result=checkline(portion[i-3].trim(), horiz_test[0]);

        //S'il y a une précision on fusionne le nom et cette précision
        if(horiz_test.length == 3){
          systemd2=horiz_test[1];
          horiz_test.splice(1,1);
          horiz_test[0]=horiz_test[0]+" "+systemd2;
        }


        if(result != false && portion2 != false){
          ptab1=transform(result);
          ptab2=transform(portion2);
        }

        else{
          //Erreur si on ne trouve pas dans le dico
          
          var diva=document.getElementById("error_log2");
          var p=document.createElement("span");
          var son=document.createTextNode(portion[i-3]+" ou "+line[2]);
          
          p.appendChild(son);
          diva.appendChild(p);

        }
        
        //console.log(nom_g+" "+horiz_test);
        var combi = new Combinaison();

        
        combi.addToMap(horiz_test.toString(), ptab1); //nom horizontal + PR
        if(combi.hasKeyInMap(nom_g.toString())){
          combi.addToArray2(ptab2);
        }

        else{
          combi.addToMap(nom_g.toString(), ptab2); //nom vertical + PR
        }
      

        combinaisons_tab.push(combi);
        
      }   
    }
  }


}

function parmi(n, k) {
  if ((typeof n !== 'number') || (typeof k !== 'number')) 
return false; 
 var coeff = 1;
 for (var x = n-k+1; x <= n; x++) coeff *= x;
 for (x = 1; x <= k; x++) coeff /= x;
 return coeff;
}

function test_pr(tab1, tab2){
  var a=tab1[0];
  var b=tab1[1];
  var c=tab2[0];
  var d=tab2[1];

  if((d >= a && d<=b) || (c>=a && c<=b)){
    console.log("ici");
    return true;
  }
  else if(c<=a && d>=b){
    console.log("present quoi");
    return true;
  }

  else{
    console.log("falso");
    return false;
  }
}


//Cette fonction renvoie A6_15,Y sans "_15". Afin de faciliter le traitement ultérieur
function return_check(text){
  var tab=[];
  if(text.includes('_')){
    var under_idx=text.indexOf('_');
    var comma_idx=text.indexOf(',');
    var tab = text.split('');
   
    for(let i=under_idx;i<comma_idx;i++){
    
      tab.splice(under_idx, 1);
    }
   
    text=tab.join("");

  }

  return text;
  

}

function transformers(nb){
  var a=nb[0];
  var b=nb[1];
  var value1=0, value2=0;

  if(b==100000000){
    return "Toute la route";
  }


  if((a%10000 == 0) && (b %10000==0)){
    return "PR "+(a/10000)+" a "+(b/10000);
  }

  else{
    value1=a%10000;
    value2=b%10000;

    a=Math.floor(a/10000);
    b=Math.floor(b/10000);

    console.log(value1+" "+value2);

    if(value1==0){
      return "PR "+a+" a "+b+"+"+value2;
    }

    else if(value2==0){
      return "PR "+a+"+"+value1+" a "+b;
    }

    

    return "PR "+a+"+"+value1+" a "+b+"+"+value2;
  }
}

function createTable(tableBodyData, key1, key2) {
  const table = document.createElement('table');
  table.border = '1'; // Add a border for visual clarity (optional)

  // Create the table header
  const headerRow = document.createElement('tr');
  headerRow.style.fontWeight="bold";
  headerRow.innerHTML = `
      <td class="small"></td>
      <td class="bigone">`+key1+`</td>
      <td class="bigone">`+key2+`</td>
  `;
  table.appendChild(headerRow);

  // Create and populate the table body using tableBodyData
  for (const rowData of tableBodyData) {
      const row = document.createElement('tr');
      for (const cellData of rowData) {
          const cell = document.createElement('td');
          cell.textContent = cellData;
          row.appendChild(cell);
      }
      table.appendChild(row);
  }

  return table;
}

export function verifer_inc(){

  var inc_file=document.querySelector("#add_inco").files;
  var go=0;
  var sysd=-1;
  //Pour récuperer la portion où l'incompatibilité fait effet
  var PR_C1;
  var PR_C2;
  del_tab("INC_son");
  //console.log(mapFermetures);
 
  if(inc_file.length != 0){
    if(mapFermetures.size > 1){
      var keysArray = Array.from(mapFermetures.keys());
      //On va analyser tous les couples possibles (sans doublons)
      for (let i = 0; i < keysArray.length; i++) {
        var key1 = keysArray[i];
        var value1 = mapFermetures.get(key1);
      
        //on commence à i + 1 pour ne pas avoir de doublons
        for (let j = i+1; j < keysArray.length; j++) {
          //Ne pas avoir de couple avec lui-même
      
            var key2 = keysArray[j];
            var value2 = mapFermetures.get(key2);
            /* 
              <key1, value1> : <NOM, PR>
              <key2, value2>
              On va chercher si ce couple existe dans combinaison_tab
            */
            

            //ATTENTION à l'A86 !!!!! avec ses Nord, SO etc.

            //On regarde si la clef est dans une des des maps des élé du tab combinaisons_tab
            //Puis on compare PR

            /*On a un couple et on va tester toutes les combinaisons dans combinaisons_tab*/
            for(let i=0;i<combinaisons_tab.length;i++){
              
              //On regarde si le couple a nos 2 clefs
         
              /*
              1) Check si _x 
              2) Check si 2 sens 
              3) Check si toute la route
              */

              //Si on a 2 fermetures sur la même voie, on supprime le _x 
              var key1_check=key1.includes('_');
              var key2_check=key2.includes('_');
              

              if(key1_check && key2_check){
                
                key1=return_check(key1);
                key2=return_check(key2);
              }

              else if(key1_check){
                key1=return_check(key1);
              }

              else if(key2_check){
                key2=return_check(key2);
              }

              else{
               
              }

              
        
              
              if(combinaisons_tab[i].hasKeyInMap(key1) && combinaisons_tab[i].hasKeyInMap(key2)){ 
               
                //Parfois on peut avoir un couple avec le meme axe et pas les meme PR. Or dans une map on ne peut avoir 2 fois la meme clef
                //Le 2e tableau de PR est donc mis dans un tableau annexe disponible dans la class Combinaison
                if(combinaisons_tab[i].mapSize() == 1){
                  PR_C1=combinaisons_tab[i].getValueFromMap(key1); /*Tableau de données venant du fichier tableauincompa.csv*/
                  PR_C2=combinaisons_tab[i].gettab();
                  
                  //Comme c'est le meme axe, on teste les 2 intervalles, question de logique
                  if(test_pr(value1, PR_C1) && test_pr(value2, PR_C2)){
                    go=1;
                  }

                  else if(test_pr(value2, PR_C1) && test_pr(value1, PR_C2)){
                    go=1;
                    sysd=PR_C1[0];
                    PR_C1[0]=PR_C2[0];
                    PR_C2[0]=sysd;

                    sysd=PR_C1[1];
                    PR_C1[1]=PR_C2[1];
                    PR_C2[1]=sysd;
                  }

                }
                else{
                  PR_C1=combinaisons_tab[i].getValueFromMap(key1); /*Données venant du fichier tableauincompa.csv*/
                  PR_C2=combinaisons_tab[i].getValueFromMap(key2); /*Données venant du fichier tableauincompa.csv*/

                  if(test_pr(value1, PR_C1) && test_pr(value2, PR_C2)){
                    console.log("yoooooo");
                    go=1;
                  }

                 
                }

              

                if(go==1){
                  console.log(key1+"- => INC. entre : "+transformers(PR_C1)+" | Value : "+transformers(value1));
                  console.log(key2+"- => INC. entre : "+transformers(PR_C2)+" | Value : "+transformers(value2));

                  const tableBodyData = [
                    ['INC', transformers(PR_C1), transformers(PR_C2)],
                    ['VAL', transformers(value1), transformers(value2)],
                  ];
        
                // Function to create and populate the table
                
        
                // Get the container element and append the table to it
                const tableContainer = document.getElementById('INC_son');
                const tableElement = createTable(tableBodyData, key1, key2);
                tableContainer.appendChild(tableElement);
                tableContainer.appendChild(document.createElement("br"));



                }

              }

              

            go=0;
            }
            
            
        }
      }
    }
  
    else{
      alert("Veuillez rajouter des fermetures");
    }
  }

  else{
    alert("Veuillez rentrer le fichier des incompatibilités et le dictionnaire ! Merci");
  }

  /*console.log(pipo);
  console.log(parmi(mapFermetures.size,2));*/
  //console.log(combinaisons_tab);

}