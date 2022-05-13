const fs = require('fs')
const datPutanja = '../oglasi.json'

exports.listaOglasa = procitajPodatkeIzFajla()

function procitajPodatkeIzFajla(){
    return JSON.parse(fs.readFileSync(datPutanja, (err, data) => {
        if (err) throw err
        return data
    }).toString())
}

function sacuvajOglaseUDatoteku (podaci) {
    fs.writeFileSync(datPutanja, JSON.stringify(podaci, null, 4))
}

exports.vratiOglasZaId = (id) => {
    return this.listaOglasa.find(o => o.id == id)
}

exports.izbrisiOglas = (id) => {
    this.listaOglasa = this.listaOglasa.filter(o => o.id != id)
    sacuvajOglaseUDatoteku(this.listaOglasa)
}

exports.dodajOglas = (oglas) => {
    let id = this.listaOglasa.length > 0 ? this.listaOglasa[this.listaOglasa.length-1].id+1 : 0;
    oglas.id = id;
    this.listaOglasa.push(oglas);
    sacuvajOglaseUDatoteku(this.listaOglasa)
}

exports.promeniOglas = (oglas) => {
    this.listaOglasa[this.listaOglasa.findIndex(o => o.id == oglas.id)] = oglas

    sacuvajOglaseUDatoteku(this.listaOglasa)
}

exports.filtriraniOglasi = (kategorija) => {
    return this.listaOglasa.filter(o => o.kategorija.toLowerCase().includes(kategorija.toLowerCase()))
}
