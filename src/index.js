// const express = require('express');
// const xlsx = require('xlsx');
// const ejs = require('ejs');
// const app = express();
// const bodyParser = require('body-parser');
// const firebase = require('firebase/app');
// require('firebase/auth');
// // const firebase = require('./firebaseConfig');
// const { auth } = require('./firebaseConfig');




// // Configura body-parser para analizar datos en formato JSON
// app.use(bodyParser.json());

// // Configura body-parser para analizar datos en formato x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true }));

// const workbook = xlsx.readFile('data_97.xlsx');
// const worksheet = workbook.Sheets['Sheet1'];
// const data = xlsx.utils.sheet_to_json(worksheet);




// app.get('/login', (req, res) => {
//   res.sendFile(__dirname + '/login.html');
// });

// app.get('/register', (req, res) => {
//   res.sendFile(__dirname + '/register.html');
// });



// app.post('/register', (req, res) => {
//   const { email, password } = req.body;
//   auth.createUserWithEmailAndPassword(email, password)
//     .then((userCredential) => {
//       res.status(200).send({ message: 'Usuario registrado con éxito', user: userCredential.user });
//     })
//     .catch((error) => {
//       console.error("Error al registrar usuario:", error.code, error.message);
//       res.status(400).send({ message: 'Error al registrar el usuario', error: error.message });
//     });
// });

// app.post('/login', (req, res) => {
//   const { email, password } = req.body;
//   auth.signInWithEmailAndPassword(email, password)
//     .then((userCredential) => {
//       res.status(200).send({ message: 'Inicio de sesión exitoso', user: userCredential.user });
//     })
//     .catch((error) => {
//       res.status(400).send({ message: 'Error al iniciar sesión', error: error.message });
//     });
// });


// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).send({ message: 'Error interno del servidor', error: err.message });
// });




// app.get('/', (req, res) => {
//   ejs.renderFile('propiedades.html', { data: data }, (err, html) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send('Error al renderizar la página');
//     } else {
//       console.log(data);
//       res.send(html);
//     }
//   });
// });

// app.get('/propiedad/:id', (req, res) => {
//   const id = req.params.id;
//   const propiedad = data.find((item) => item.Id == id); // Usa 'Id' y '==' en lugar de 'id' y '==='
//   console.log(propiedad);
  
//   ejs.renderFile('detallePropiedad.html', { propiedad: propiedad }, (err, html) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send('Error al renderizar la página');
//     } else {
//       console.log(propiedad)
//       console.log(id);
//       res.send(html);
//     }
//   });
// });



// app.listen(3000, () => {
//   console.log('Servidor iniciado en el puerto 3000');
// });


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



app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
  extname : '.hbs',
}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(myconnection(mysql, {
  host : '50.31.177.50',
  user : 'lrdlmrgw_hector',
  password : 'alejandro20759364',
  port : 3306,
  database : 'lrdlmrgw_directorio',
  connectTimeout: 550000 // Añade esta línea, tiempo de espera de conexión en milisegundos (10 segundos)

}))


app.use(session({
  secret : 'secret',
  resave : true,
  saveUninitialized : true
}))




// Configuración de la hoja de cálculo y los datos
// const workbook = xlsx.readFile('aliseda.xlsx');
// const worksheet = workbook.Sheets['Sheet1'];
// const data = xlsx.utils.sheet_to_json(worksheet);


// const workbook1 = xlsx.readFile('aliseda.xlsx');
// const worksheet1 = workbook1.Sheets['Sheet1'];
// const data1 = xlsx.utils.sheet_to_json(worksheet1);

// const workbook2 = xlsx.readFile('data_97.xlsx');
// const worksheet2 = workbook2.Sheets['Sheet1'];
// const data2 = xlsx.utils.sheet_to_json(worksheet2);

// const data = data1.concat(data2);

const path = require('path');

const workbook1 = xlsx.readFile(path.resolve(__dirname, 'aliseda.xlsx'));
const worksheet1 = workbook1.Sheets['Sheet1'];
const data1 = xlsx.utils.sheet_to_json(worksheet1);

const workbook2 = xlsx.readFile(path.resolve(__dirname, 'data_97.xlsx'));
const worksheet2 = workbook2.Sheets['Sheet1'];
const data2 = xlsx.utils.sheet_to_json(worksheet2);

const data = data1.concat(data2);




// app.get('/login', (req, res) => {
//   ejs.renderFile('views/login.html')
// });

// app.get('/register', (req, res) => {
//   ejs.renderFile('views/register.html');
// });


// app.get('/home', (req, res) => {
//   ejs.renderFile('views/propiedades.html', { data: data }, (err, html) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send('Error al renderizar la página');
//     } else {
//       console.log(data);
//       res.send(html);
//     }
//   });
// });


app.get('/detalle/:id', (req, res) => {
  const id = req.params.id;
  const detalle = data.find((item) => item.Id == id); // Usa 'Id' y '==' en lugar de 'id' y '==='
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
// app.get('/', (req, res) => {
//   res.render('home', { data: data }, (err, html) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send('Error al renderizar la página');
//     } else {
//       console.log(data);
//       res.send(html);
//     }
//   });
// });

const hbs = require('handlebars');

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

  const totalPropiedades = data.length;
  const totalPages = Math.ceil(totalPropiedades / limit);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const paginatedData = data.slice(skip, skip + limit);
  res.render('home', { data: paginatedData, pages, name: req.session.name }, (err, html) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error al renderizar la página');
    } else {
      console.log(paginatedData);
      res.send(html);
    }
  });
  }else{
      res.redirect('/login');
  }   

  
});


app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});







