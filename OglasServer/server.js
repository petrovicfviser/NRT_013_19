var servis = require('oglasservis')
var express = require('express')
const { request, response } = require('express')

var server = express()
const port = 3000

server.use(express.urlencoded({ extended: false }))
server.use(express.json())

server.get('/', (request, response) => {
    response.redirect('/oglasi')
})

server.get('/oglasi', (request, response) => {
    if (request.query['kategorija'] != undefined)
        response.send(servis.filtriraniOglasi(request.query['kategorija']))
    else
        response.send(servis.listaOglasa)
})

server.get('/oglasi/:id', (request, response) => {
    response.send(servis.vratiOglasZaId(request.params['id']))
})

server.delete('/izbrisiOglas/:id', (request, response) => {
    servis.izbrisiOglas(request.params['id'])
    response.end('Obrisan oglas')
})

server.post('/dodajOglas', (request, response) => {
    servis.dodajOglas(request.body)
    response.end('Dodat oglas')
})

server.put('/promeniOglas', (request, response) => {
    servis.promeniOglas(request.body)
    response.end('Promenjen oglas')
})

server.listen(port, () => {console.log('Startovan server na portu ' + port)})