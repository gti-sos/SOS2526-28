// api-JDD.js

import Datastore from "nedb";

const BASE_API_URL = "/api/v1/deliberate-violence-against-civilians-events-worldwide";

const db = new Datastore({
    filename: "./data/violence-events.db",
    autoload: true
});

export default function(app){

// ==============================
// DOCUMENTACION
// ==============================
    app.get(`${BASE_API_URL}/docs`,(req,res)=>{

    res.redirect("https://documenter.getpostman.com/view/52833055/2sBXigMZ14");
    

});

// ==============================
// CAMPOS ESPERADOS
// ==============================

const campos = [
"event_type",
"campaign_identifier",
"event_reporting",
"start_day",
"start_month",
"start_year",
"end_day",
"end_month",
"end_year",
"country",
"region",
"district",
"locality",
"degree",
"minute",
"second",
"direction"
];

// ==============================
// ELIMINAR _id
// ==============================

function quitarID(datos){

    if(Array.isArray(datos)){

        return datos.map(d=>{
            const {_id,...rest}=d;
            return rest;
        });

    }

    const {_id,...rest}=datos;
    return rest;
}

// ==============================
// VALIDAR ESTRUCTURA
// ==============================

function estructuraValida(obj){

    const claves = Object.keys(obj);

    return campos.every(c=>claves.includes(c)) &&
           claves.length === campos.length;
}

// ==============================
// DATOS INICIALES
// ==============================

 const datosIniciales = [
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 6, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "AFG", region: "Jowzjan", district: "Mangajek", locality: "Chahar Shanghoy village", degree: 36, minute: 56, second: 3, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 17, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "AFG", region: "Nangarhar", district: "", locality: "Jalalabad", degree: 34, minute: 26, second: 3, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 20, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "AFG", region: "", district: "", locality: "Kabul", degree: 34, minute: 32, second: 0, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 3, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "BDI", region: "Bujumbura Mairie", district: "Musaga", locality: "", degree: 3, minute: 24, second: 43, direction: "S" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 15, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "BFA", region: "", district: "", locality: "Ouagadougou", degree: 12, minute: 21, second: 26, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 13, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "CMR", region: "Far North", district: "Kolofata", locality: "Kouyape", degree: 11, minute: 1, second: 15, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 25, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "CMR", region: "Far North", district: "", locality: "Bodo", degree: 12, minute: 21, second: 35, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 7, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "COD", region: "Nord Kivu", district: "", locality: "Miriki", degree: 0, minute: 42, second: 43, direction: "S" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 1, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "ELS", region: "", district: "", locality: "Los Cerritos", degree: 13, minute: 46, second: 55, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 28, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "ETH", region: "Gambela Regional State", district: "", locality: "", degree: 7, minute: 50, second: 0, direction: "N" }
];

// ==============================
// LOAD INITIAL DATA
// ==============================

app.get(`${BASE_API_URL}/loadInitialData`,(req,res)=>{

    db.count({},(err,count)=>{

        if(count===0){

            db.insert(datosIniciales,(err,newDocs)=>{

                res.status(201).json(quitarID(newDocs));

            });

        }else{

            db.find({},(err,docs)=>{

                res.status(200).json(quitarID(docs));

            });

        }

    });

});

// ==============================
// GET COLECCIÓN + FILTROS + PAGINACIÓN
// ==============================

app.get(BASE_API_URL,(req,res)=>{

    let query = {};

    Object.keys(req.query).forEach(key=>{

        if(key!=="limit" && key!=="offset"){

            if(!isNaN(req.query[key])){
                query[key]=parseInt(req.query[key]);
            }else{
                query[key]=req.query[key];
            }

        }

    });

    let limit=parseInt(req.query.limit)||0;
    let offset=parseInt(req.query.offset)||0;

    db.find(query)
      .skip(offset)
      .limit(limit)
      .exec((err,docs)=>{

        res.status(200).json(quitarID(docs));

    });

});

// ==============================
// GET RECURSO
// ==============================

app.get(`${BASE_API_URL}/:country/:year/:month/:day`,(req,res)=>{

    db.findOne({

        country:req.params.country,
        start_year:parseInt(req.params.year),
        start_month:parseInt(req.params.month),
        start_day:parseInt(req.params.day)

    },(err,doc)=>{

        if(doc){

            res.status(200).json(quitarID(doc));

        }else{

            res.sendStatus(404);

        }

    });

});

// ==============================
// POST
// ==============================

app.post(BASE_API_URL,(req,res)=>{

    if(!estructuraValida(req.body)){

        return res.sendStatus(400);

    }

    const nuevo=req.body;

    db.findOne({

        country:nuevo.country,
        start_year:nuevo.start_year,
        start_month:nuevo.start_month,
        start_day:nuevo.start_day

    },(err,doc)=>{

        if(doc){

            return res.sendStatus(409);

        }

        db.insert(nuevo,(err,newDoc)=>{

            res.status(201).json(quitarID(newDoc));

        });

    });

});

// ==============================
// PUT COLECCIÓN (NO PERMITIDO)
// ==============================

app.put(BASE_API_URL,(req,res)=>{

    res.sendStatus(405);

});

// ==============================
// DELETE COLECCIÓN
// ==============================

app.delete(BASE_API_URL,(req,res)=>{

    db.remove({}, {multi:true},()=>{

        res.sendStatus(200);

    });

});

// ==============================
// PUT RECURSO
// ==============================

app.put(`${BASE_API_URL}/:country/:year/:month/:day`,(req,res)=>{

    if(!estructuraValida(req.body)){

        return res.sendStatus(400);

    }

    const body=req.body;

    if(
        body.country!==req.params.country ||
        body.start_year!==parseInt(req.params.year) ||
        body.start_month!==parseInt(req.params.month) ||
        body.start_day!==parseInt(req.params.day)
    ){

        return res.sendStatus(400);

    }

    db.update({

        country:req.params.country,
        start_year:parseInt(req.params.year),
        start_month:parseInt(req.params.month),
        start_day:parseInt(req.params.day)

    },body,{},(err,num)=>{

        if(num===0){

            res.sendStatus(404);

        }else{

            res.sendStatus(200);

        }

    });

});

// ==============================
// DELETE RECURSO
// ==============================

app.delete(`${BASE_API_URL}/:country/:year/:month/:day`,(req,res)=>{

    db.remove({

        country:req.params.country,
        start_year:parseInt(req.params.year),
        start_month:parseInt(req.params.month),
        start_day:parseInt(req.params.day)

    },{},(err,num)=>{

        if(num===0){

            res.sendStatus(404);

        }else{

            res.sendStatus(200);

        }

    });

});

}