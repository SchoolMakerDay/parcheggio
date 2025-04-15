//Per evitare il cors da opera: opera --disable-web-security --disable-site-isolation-trials --user-data-dir="c:\insecurebrowserdata"

//Cambia la variabile se vuoi usare il server rabbits pubblico
let locale = true

//Inserisci l'ip della macchina
let ipLocale = "192.168.1.39"

let baseUrl
let prefissoVariabili = ""

//Se il server è locale, le variabili non avranno alcun prefisso,
//altrimenti avranno il prefisso "parcheggioArduino" per non intasare le variabili di rabbits
if (locale){
    baseUrl = `http://${ipLocale}/SchoolMakerDay-Parcheggio-Interfaccia-Utente/rabbits-main/`
}else{
    baseUrl = "https://www.schoolmakerday.it/rabbits/"
    prefissoVariabili = "parcheggioArduino"
}

//I comandi sono inviati dall'utente tramite il panel/dashboard
//Gli stati sono ricevuti dall'Arduino e indicano lo stato del field
//Gli enable fanno in modo di accettare variazioni dei comandi dall'arduino
let nomiVariabili = [
                    "ELmp",     //Enable  Lampioni
                    "CLmp",     //Comando Lampioni
                    "SLmp",     //Stato   Lampioni

                    "ESrvEnt",  //Enable  Servo Entrata
                    "CSrvEnt",  //Comando Servo Entrata
                    "SSrvEnt",  //Stato   Servo Entrata

                    "ESrvUsc",  //Enable  Servo Uscita
                    "CSrvUsc",  //Comando Servo Uscita
                    "SSrvUsc",  //Stato   Servo Uscita

                    "posti", //Numero posti disponibili
                    ]


// Dichiaro la funzione rabbits che manda una richiesta http GET se nessun valore è impostato
// Altrimenti impostando un valore la funzione manda una richiesta http POST 
async function rabbits(key, valore = null){
    
    //Aggiunge il prefisso alla chiave
    key = prefissoVariabili + key //Nessun prefisso se il server è locale 

    let url = baseUrl
    if(valore === null){ //Se il valore non viene impostato si fa una richiesta GET
        url += `get.php?key=${key}`
    }else{ //Altrimenti si fa una richiesta POST
        url += `set.php?key=${key}&value=${valore}`
    }
    console.log(url)
    
    let RispostaRabbits = await fetch(url); // ASPETTA la risposta
    let data = await RispostaRabbits.json(); // ASPETTA la conversione in JSON
    return data //Ritorna la risposta
}


//Funzione per invertire lo stato di una variabile
async function rabbitsToggle(key){
    let valoreChiave = await rabbits(key)
    valoreChiave = valoreChiave["data"]["value"]
    
    if (valoreChiave == "true"){
        valoreChiave = true
    }else{
        valoreChiave = false
    }
    console.log(!valoreChiave)
    await rabbits(key, !valoreChiave)
}

//Funzione per ottenere tutte le chiavi e i loro valori corrispondenti
async function rabbitsOttieniTutteLeKey(){
    let url = baseUrl + `getkeys.php?keys=[`
    
    nomiVariabili.forEach(element => {
        url += '"' + prefissoVariabili + element + '",'
    });
    url = url.slice(0, -1)
    url += "]"

    console.log(url)

    let RispostaRabbits = await fetch(url); // ASPETTA la risposta
    let data = await RispostaRabbits.json(); // ASPETTA la conversione in JSON
    console.log(data)
    return data
    }

//Funzione per dichiarare tutte le chiavi,
//questo serve all'inizio quando le variabili non sono dichiarate,
//una volta dichiarate non serve più, è una funzione puramente di debug
async function rabbitsDichiaraTutteLeKey(){
    nomiVariabili.forEach(element => {
        rabbits(element, false).then(data => console.log(data))
    });
}

//Funzione che cambia l'interfaccia utente in base alle variabili
//attualmente cambia il colore dei bottoni ma in futuro spero di riuscire
//a mettere delle piccole animazioni :)
async function sistemaUI(data){
    document.querySelector(".display").setAttribute("src",`display7Segmenti/${data["data"]["posti"]["value"]}.png`);
    
    if(data["data"]["SSrvEnt"]["value"] == "true"){
        document.querySelector("#entrata").setAttribute(
        "style",
            "background-color: rgba(141, 252, 97, 0.5)"
        )
    }else{
        document.querySelector("#entrata").setAttribute(
            "style",
                "background-color: rgba(255, 146, 146, 0.5)"
            )
    }

    if(data["data"]["SSrvUsc"]["value"] == "true"){
        document.querySelector("#uscita").setAttribute(
        "style",
            "background-color: rgba(141, 252, 97, 0.5)"
        )
    }else{
        document.querySelector("#uscita").setAttribute(
            "style",
                "background-color: rgba(255, 146, 146, 0.5)"
            )
    }

    if(data["data"]["SLmp"]["value"] == "true"){
        document.querySelector("#lampioni").setAttribute(
        "style",
            "background-color: rgba(141, 252, 97, 0.5)"
        )
    }else{
        document.querySelector("#lampioni").setAttribute(
            "style",
                "background-color: rgba(255, 146, 146, 0.5)"
            )
    }

}

//Ciclo infinito di polling di tutte le variabili
async function loop(){
    rabbitsOttieniTutteLeKey().then(data => sistemaUI(data))
    await new Promise(resolve => setTimeout(resolve, 100)); //Attende 100ms
    loop()
}

loop()