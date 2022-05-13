const express = require('express')
const fs = require('fs')
const axios = require('axios')
const { response } = require('express')

const port = 5000
const server = express()
const putanjaServera = 'http://localhost:3000'

server.use(express.urlencoded({ extended: false }))
server.use(express.json())

function procitajPogledZaNaziv(naziv){
    return fs.readFileSync('pogledi/' + naziv + '.html', 'utf-8')
}

server.get('/', (request, response) => {
    response.redirect('/oglasi')
})

server.get('/oglasi', (request, response) => {
    axios.get(putanjaServera + '/oglasi').then(res => {
        let prikaz = ''
        res.data.forEach(
            o => {
                prikaz += `
                <tr>
                    <td>${o.kategorija}</td>
                    <td>${o.tekst}</td>
                    <td>${o.datumIsteka}</td>
                    <td>${o.cena.vrednost} ${o.cena.valuta}</td>
                    <td><a href='/detalji/${o.id}'>Detaljnije/Izmeni</a></td>
                    <td><a href='/obrisi/${o.id}'>Obriši</a></td>
                </tr>
                `
            }
        )

        response.send(procitajPogledZaNaziv('oglasi').replace('#{data}', prikaz))
    }).catch(err => {
        response.send(procitajPogledZaNaziv('greska').replace('#{data}', err))
    })
})

server.get('/obrisi/:id', (request, response) => {
    axios.delete(putanjaServera + '/izbrisiOglas/' + request.params['id']).catch(err => {
        response.send(procitajPogledZaNaziv('greska').replace('#{data}', err))
    })
    response.redirect('/oglasi')
})

server.get('/detalji/:id', (request, response) => {
    axios.get(putanjaServera + '/oglasi/' + request.params['id']).then(res =>  {
        let oznakeHtml = ''
        res.data.oznake.forEach(oz => {oznakeHtml+=`<br><input type="text" name="oznake" value="${oz}">`})

        let mejloviHtml = ''
        res.data.mejlovi.forEach(m => {mejloviHtml+=`<br><input type="email" name="mejl" value="${m.adresa}"><select name="tipMejla" value="${m.tip}">
        <option>Privatni</option>
        <option>Poslovni</option>
    </select>`})

        let prikaz = `
        <input hidden value="${res.data.id}" name="id">
        <label for="kategorija">Kategorija: </label>
        <select name="kategorija" value="${res.data.kategorija}">
            <option>Automobili</option>
            <option>Racunarske komponente</option>
            <option>Motocikli</option>
            <option>Bicikle</option>
            <option>Alati</option>
            <option>Stanovi</option>
        </select><br>
        <label for="tekst">Tekst: </label><input type="text" name="tekst" value="${res.data.tekst}"><br>
        <div>
            <h3>Cena:</h3>
            <label for="valuta">Valuta: </label><input type="text" name="valuta" value="${res.data.cena.valuta}"><br>
            <label for="cena">Cena: </label><input type="text" name="cena" value="${res.data.cena.vrednost}"><br>
        </div><br>
        <label for="datumIsteka">Datum isteka oglasa: </label><input type="date" name="datumIsteka" value="${res.data.datumIsteka}">
        <h3>Oznake:</h3>
        <button onclick="dodajOznaku()" type="button">Dodaj oznaku</button>
        <div id="oznake">
            ${oznakeHtml}
        </div>
        <h3>Mejlovi:</h3>
        <button onclick="dodajMejl()" type="button">Dodaj mejl</button>
        <div id="mejlovi">
            ${mejloviHtml}
        </div>
        `
        response.send(procitajPogledZaNaziv('detalji').replace('#{data}', prikaz))
    }
    ).catch(
        err => {
            response.send(procitajPogledZaNaziv('greska').replace('#{data}', err))
        }
    )
})

server.get('/dodavanje', (request, response) => {
    response.send(procitajPogledZaNaziv('dodavanje'))
})

server.post('/dodajOglas', (request, response) => {
    /*let mejlovi = []
    for (let i in request.body.mejl){
        mejlovi.push({
            "adresa": request.body.mejl[i],
            "tip": request.body.tip[i]
        })
    }*/
    let mejlovi = []
    let oznake = []
    if (Array.isArray(request.body.mejl)){
        for (let i in request.body.mejl){
            mejlovi.push({
                "adresa":request.body.mejl[i],
                "tip": request.body.tipMejla[i]
            })
        }
    }
    else{
        mejlovi.push({
            "adresa":request.body.mejl,
            "tip": request.body.tipMejla
        })
    }

    if(Array.isArray(request.body.oznake)){
        request.body.oznake.forEach(oz => oznake.push(oz))
    }
    else{
        oznake.push(request.body.oznake)
    }
    let noviOglas = {
        "id": 0,
        "kategorija": request.body.kategorija,
        "datumIsteka": request.body.datumIsteka,
        "cena": {
            "valuta": request.body.valuta.toUpperCase(),
            "vrednost": parseInt(request.body.cena)
        },
        "tekst": request.body.tekst,
        "oznake": oznake,
        "mejlovi": mejlovi
    }
    axios.post(putanjaServera + '/dodajOglas', noviOglas).catch(
        err => {
            response.send(procitajPogledZaNaziv('greska').replace('#{data}', err))
        }
    )
    response.redirect('/oglasi')
})

server.post('/izmeniOglas', (request, response) => {
    let mejlovi = []
    let oznake = []
    if (Array.isArray(request.body.mejl)){
        for (let i in request.body.mejl){
            mejlovi.push({
                "adresa":request.body.mejl[i],
                "tip": request.body.tipMejla[i]
            })
        }
    }
    else{
        mejlovi.push({
            "adresa":request.body.mejl,
            "tip": request.body.tipMejla
        })
    }

    if(Array.isArray(request.body.oznake)){
        request.body.oznake.forEach(oz => oznake.push(oz))
    }
    else{
        oznake.push(request.body.oznake)
    }
    
    let oglas = {
        "id": parseInt(request.body.id),
        "kategorija": request.body.kategorija,
        "datumIsteka": request.body.datumIsteka,
        "cena": {
            "valuta": request.body.valuta.toUpperCase(),
            "vrednost": parseInt(request.body.cena)
        },
        "tekst": request.body.tekst,
        "oznake": oznake,
        "mejlovi": mejlovi
    }
    axios.put(putanjaServera + '/promeniOglas', oglas).catch(
        err => {
            response.send(procitajPogledZaNaziv('greska').replace('#{data}', err))
        }
    )
    response.redirect('/oglasi')
})

server.get('/filtriraj', (request, response) => {
    axios.get(putanjaServera + '/oglasi?kategorija=' + request.query['kategorija']).then(res => {
        let prikaz = ''
        res.data.forEach(
            o => {
                prikaz += `
                <tr>
                    <td>${o.kategorija}</td>
                    <td>${o.tekst}</td>
                    <td>${o.datumIsteka}</td>
                    <td>${o.cena.vrednost} ${o.cena.valuta}</td>
                    <td><a href='/detalji/${o.id}'>Detaljnije/Izmeni</a></td>
                    <td><a href='/obrisi/${o.id}'>Obriši</a></td>
                </tr>
                `
            }
        )

        response.send(procitajPogledZaNaziv('oglasi').replace('#{data}', prikaz))
    }).catch(err => {
        response.send(procitajPogledZaNaziv('greska').replace('#{data}', err))
    })
})

server.listen(port, () => {console.log('Pokrenut klijent na portu ' + port)})