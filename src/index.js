const express = require('express');
const xlsx = require('xlsx');
const ejs = require('ejs');
const app = express(); // Renombrar la instancia de express a 'server'
const { engine }  = require("express-handlebars");
const myconnection = require("express-myconnection");
const mysql = require("mysql");
const session = require("express-session");
const bodyParser = require('body-parser');
const loginRoutes = require('./routes/login');
const dotenv = require('dotenv');
require('dotenv').config();


app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
  extname : '.hbs',
}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.use(myconnection(mysql, {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true'
}));


app.use(session({
  secret : 'secret',
  resave : true,
  saveUninitialized : true
}))


const path = require('path');
const workbook1 = xlsx.readFile(path.resolve(__dirname, 'aliseda.xlsx'));
const worksheet1 = workbook1.Sheets['Sheet1'];
const data1 = xlsx.utils.sheet_to_json(worksheet1);
const workbook2 = xlsx.readFile(path.resolve(__dirname, 'data_97.xlsx'));
const worksheet2 = workbook2.Sheets['Sheet1'];
const data2 = xlsx.utils.sheet_to_json(worksheet2);
const workbook3 = xlsx.readFile(path.resolve(__dirname, 'data_solvia.xlsx'));
const worksheet3 = workbook3.Sheets['Sheet1'];
const data3 = xlsx.utils.sheet_to_json(worksheet3);
const workbook4 = xlsx.readFile(path.resolve(__dirname, 'diglo_data.xlsx'));
const worksheet4 = workbook4.Sheets['Sheet1'];
const data4 = xlsx.utils.sheet_to_json(worksheet4);
const workbook5 = xlsx.readFile(path.resolve(__dirname, 'PortalNow_1.xlsx'));
const worksheet5 = workbook5.Sheets['Sheet1'];
const data5 = xlsx.utils.sheet_to_json(worksheet5);
const workbook6 = xlsx.readFile(path.resolve(__dirname, 'portalNow_2.xlsx'));
const worksheet6 = workbook6.Sheets['Sheet1'];
const data6 = xlsx.utils.sheet_to_json(worksheet6);
const workbook7 = xlsx.readFile(path.resolve(__dirname, 'portalNow_3.xlsx'));
const worksheet7 = workbook7.Sheets['Sheet1'];
const data7 = xlsx.utils.sheet_to_json(worksheet7);
const data = data1.concat(data2, data3, data4, data5, data6, data7);

const OcupadosBook = xlsx.readFile(path.resolve(__dirname, 'okupados2.xlsx'));
const OcupadosSheet = OcupadosBook.Sheets['Sheet1'];
const dataOcupados = xlsx.utils.sheet_to_json(OcupadosSheet);





app.post('/filtrar', (req, res) => {
  function capitalizeFirstLetter(str) {
    if (!str) {
      return '';
    }
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  }
  req.session.filtro = {
    provincia: req.body.provincia,
    referencia: req.body.referencia ? req.body.referencia.toUpperCase() : '',
    ciudad: req.body.ciudad,
    precioMinimo: req.body.precioMinimo,
    precioMaximo: req.body.precioMaximo,
    busqueda: req.body.busqueda
  };

  const provincia = req.body.provincia;
  const referencia = req.body.referencia ? req.body.referencia.toUpperCase() : '';
  const ciudad = req.body.ciudad;
  const precioMinimo = req.body.precioMinimo;
  const precioMaximo = req.body.precioMaximo;
  const busqueda = req.body.busqueda;
  const propiedadesTotales = data.length;
  let propiedadesFiltradas = 0;

  const filteredData = data.filter(item => {
    if (!item.Price) {
      return false;
    }
    const itemPrice = parseFloat(item.Price.replace('€', '').replace('.', '').replace('.','').replace('.','').trim());
    const isProvinciaMatch = !provincia || (item.Provincia && item.Provincia.toLowerCase().includes(provincia.toLowerCase()));
    const isCiudadMatch = !ciudad || (item.Municipio && item.Municipio.toLowerCase().includes(ciudad.toLowerCase()));
    // const isReferenciaMatch = !referencia || (item.Id && item.Id.toLowerCase().includes(referencia.toLowerCase()));
    const isReferenciaMatch = !referencia || (item.Id && item.Id.toString().toLowerCase().includes(referencia.toLowerCase()));
    const isBusquedaMatch = !busqueda || (
      (item.Provincia && item.Provincia.toLowerCase().includes(busqueda.toLowerCase())) ||
      (item.Municipio && item.Municipio.toLowerCase().includes(busqueda.toLowerCase())) ||
      (item.Id && item.Id.toString().toLowerCase().includes(busqueda.toLowerCase())) ||
      (item.Title && item.Title.toLowerCase().includes(busqueda.toLowerCase())) ||
      (item.Direccion && item.Direccion.toLowerCase().includes(busqueda.toLowerCase()))
    );
    const isPrecioMinimoMatch = !precioMinimo || itemPrice >= precioMinimo;
    const isPrecioMaximoMatch = !precioMaximo || itemPrice <= precioMaximo;

    if (isProvinciaMatch || isCiudadMatch || isReferenciaMatch || isBusquedaMatch || isPrecioMinimoMatch || isPrecioMaximoMatch) {
      propiedadesFiltradas++;
    }

    return isProvinciaMatch && isCiudadMatch && isReferenciaMatch && isBusquedaMatch && isPrecioMinimoMatch && isPrecioMaximoMatch;
  });

  // Ordenar los resultados en orden descendente basado en el precio de la propiedad
  const orderedData = filteredData.sort((item1, item2) => {
    const item1Price = parseFloat(item1.Price.replace('€', '').replace('.', '').replace('.','').replace('.','').trim());
    const item2Price = parseFloat(item2.Price.replace('€', '').replace('.', '').replace('.','').replace('.','').trim());

    return item2Price - item1Price;
  });

  const page = parseInt(req.query.page) || 1;
  const limit = 200;
  const skip = (page - 1) * limit;

  const paginatedData = orderedData.slice(skip, skip + limit);
  const totalPropiedadesFiltradas = orderedData.length;
  const totalPropiedades = totalPropiedadesFiltradas;
  const totalPages = Math.ceil(totalPropiedades / limit);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const propiedadesNoFiltradas = propiedadesTotales - propiedadesFiltradas;

  const propiedadesFiltradasBusqueda = orderedData.reduce((count, item) => {
    const itemPrice = parseFloat(item.Price.replace('€', '').replace('.', '').replace('.','').replace('.','').trim());
    const isProvinciaMatch = !provincia || (item.Provincia && item.Provincia.toLowerCase().includes(provincia.toLowerCase()));
    const isCiudadMatch = !ciudad || (item.Municipio && item.Municipio.toLowerCase().includes(ciudad.toLowerCase()));
    // const isReferenciaMatch = !referencia || (item.Id && item.Id.toLowerCase().includes(referencia.toLowerCase()));
    const isReferenciaMatch = !referencia || (item.Id && item.Id.toString().toLowerCase().includes(referencia.toLowerCase()));
    const isBusquedaMatch = !busqueda || (
      (item.Provincia && item.Provincia.toLowerCase().includes(busqueda.toLowerCase())) ||
      (item.Municipio && item.Municipio.toLowerCase().includes(busqueda.toLowerCase())) ||
      (item.Id && item.Id.toString().toLowerCase().includes(busqueda.toLowerCase())) ||
      (item.Title && item.Title.toLowerCase().includes(busqueda.toLowerCase())) ||
      (item.Direccion && item.Direccion.toLowerCase().includes(busqueda.toLowerCase()))
    );
    const isPrecioMinimoMatch = !precioMinimo || itemPrice >= precioMinimo;
    const isPrecioMaximoMatch = !precioMaximo || itemPrice <= precioMaximo;

    if (isProvinciaMatch || isCiudadMatch || isReferenciaMatch || isBusquedaMatch || isPrecioMinimoMatch || isPrecioMaximoMatch) {
      return count + 1;
    }
    return count;
  }, 0);


  res.render('home', {
    data: paginatedData,
    pages,
    name: req.session.name,
    totalPropiedadesFiltradas,
    provincia,
    propiedadesTotales,
    referencia,
    ciudad,
    precioMaximo,
    precioMinimo,
    propiedadesNoFiltradas,
    propiedadesFiltradasBusqueda,
    busqueda,
    precioMinimo: req.session.filtro.precioMinimo,
    precioMaximo: req.session.filtro.precioMaximo,
  }, (err, html) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error al renderizar la página');
    } else {
      console.log('Valores enviados al renderizado:', totalPropiedadesFiltradas, propiedadesFiltradasBusqueda);
      res.send(html);
    }
  });
});


app.get('/okupados', (req, res) => {
  const data = dataOcupados.map((item) => {
    return {
      referencia: item.REFERENCIA,
      direccion: item.DIRECCION,
      estatus: item.ESTATUS,
      ocupado: item.OCUPADO,
      tipo: item.TIPO,
      fondo: item.FONDO,
      precio: item.PRECIO
    };
  });

  console.log(data); // Agregado para imprimir los datos de dataOcupados

  res.render('okupados', { 
    data: data,
    name: req.session.name 
  });
});

app.get('/detalle/:id', (req, res) => {
  const id = req.params.id;
  const detalle = data.find((item) => item.Id == id); // Usa 'Id' y '==' en lugar de 'id' y '==='

  if (typeof detalle.ImageSources === 'string') {
    try {
      detalle.ImageSources = JSON.parse(detalle.ImageSources);
    } catch (error) {
      console.log('Error al parsear la cadena JSON de detalle.ImageSources:', error);
      detalle.ImageSources = [];
    }
  } else {
    detalle.ImageSources = [];
  }
  console.log(detalle);
  
  res.render('detallePropiedad', { detalle: detalle, name: req.session.name }, (err, html) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error al renderizar la página');
    } else {
      console.log(detalle)
      console.log(id);
      res.send(html);
    }
  });
});


app.use('/', loginRoutes);

const hbs = require('handlebars');

hbs.registerHelper('if_eq', function(a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

hbs.registerHelper('if_or', function() {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  const opts = arguments[arguments.length - 1];
  
  // Verifica si alguno de los argumentos es verdadero
  const hasTrue = args.some(Boolean);

  if (hasTrue) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

// Registrar un helper personalizado en Handlebars
hbs.registerHelper('checkMainPhoto', function(MainPhoto, options) {
  if (MainPhoto) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});


hbs.registerHelper('if_eq', function(a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});




app.get('/', (req, res) => {
  if(req.session.loggedin == true) {
    const page = parseInt(req.query.page) || 1;
    const limit = 200;
    const skip = (page - 1) * limit;

    // Usar los criterios de búsqueda de la sesión para filtrar
    const filtro = req.session.filtro || {};
    // const filteredData = data.filter(item => {
    //   // Aplicar el filtro basado en los criterios de búsqueda
    //     const itemPrice = item.Price ? parseFloat(item.Price.replace('€', '').replace('.', '').replace('.','').replace('.','').trim()) : 0;
    //     const isProvinciaMatch = !filtro.provincia || (item.Provincia && item.Provincia.toLowerCase().includes(filtro.provincia.toLowerCase()));
    //     const isCiudadMatch = !filtro.ciudad || (item.Municipio && item.Municipio.toLowerCase().includes(filtro.ciudad.toLowerCase()));
    //     const isReferenciaMatch = !filtro.referencia || (item.Id && item.Id.toLowerCase().includes(filtro.referencia.toLowerCase()));
    //     const isBusquedaMatch = !filtro.busqueda || (
    //       (item.Provincia && item.Provincia.toLowerCase().includes(filtro.busqueda.toLowerCase())) ||
    //       (item.Municipio && item.Municipio.toLowerCase().includes(filtro.busqueda.toLowerCase())) ||
    //       (item.Id && item.Id.toLowerCase().includes(filtro.busqueda.toLowerCase())) ||
    //       (item.Title && item.Title.toLowerCase().includes(filtro.busqueda.toLowerCase())) ||
    //       (item.Direccion && item.Direccion.toLowerCase().includes(filtro.busqueda.toLowerCase()))
    //     );
    //     const isPrecioMinimoMatch = !filtro.precioMinimo || itemPrice >= filtro.precioMinimo;
    //     const isPrecioMaximoMatch = !filtro.precioMaximo || itemPrice <= filtro.precioMaximo;  

    //     return isProvinciaMatch && isCiudadMatch && isReferenciaMatch && isBusquedaMatch && isPrecioMinimoMatch && isPrecioMaximoMatch;
    // });

    const filteredData = data.filter(item => {
      const itemPrice = item.Price ? parseFloat(item.Price.replace('€', '').replace('.', '').replace('.','').replace('.','').trim()) : 0;
      const isProvinciaMatch = !filtro.provincia || (item.Provincia && item.Provincia.toLowerCase().includes(filtro.provincia.toLowerCase()));
      const isCiudadMatch = !filtro.ciudad || (item.Municipio && item.Municipio.toLowerCase().includes(filtro.ciudad.toLowerCase()));
      const idValue = typeof item.Id === 'string' ? item.Id : '';
      const isReferenciaMatch = !filtro.referencia || (idValue && idValue.toLowerCase().includes(filtro.referencia.toLowerCase()));
      const isBusquedaMatch = !filtro.busqueda || (
        (item.Provincia && item.Provincia.toLowerCase().includes(filtro.busqueda.toLowerCase())) ||
        (item.Municipio && item.Municipio.toLowerCase().includes(filtro.busqueda.toLowerCase())) ||
        (idValue && idValue.toLowerCase().includes(filtro.busqueda.toLowerCase())) ||
        (item.Title && item.Title.toLowerCase().includes(filtro.busqueda.toLowerCase())) ||
        (item.Direccion && item.Direccion.toLowerCase().includes(filtro.busqueda.toLowerCase()))
      );
      const isPrecioMinimoMatch = !filtro.precioMinimo || itemPrice >= filtro.precioMinimo;
      const isPrecioMaximoMatch = !filtro.precioMaximo || itemPrice <= filtro.precioMaximo;  
    
      return isProvinciaMatch && isCiudadMatch && isReferenciaMatch && isBusquedaMatch && isPrecioMinimoMatch && isPrecioMaximoMatch;
    });

    const totalPropiedades = filteredData.length;
    const totalPages = Math.ceil(totalPropiedades / limit);

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

  
    const paginatedData = filteredData.slice(skip, skip + limit);
    res.render('home', { data: paginatedData, pages, name: req.session.name, totalPropiedades }, (err, html) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error al renderizar la página');
      } else {
        console.log(paginatedData);
        res.send(html);
      }
    });
  } else {
      res.redirect('/login');
  }   
});


app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});




