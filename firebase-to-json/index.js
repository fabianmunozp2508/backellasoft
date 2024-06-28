const admin = require('firebase-admin');
const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');

// Reemplaza con la ruta correcta a tu archivo de clave de servicio
const serviceAccount = require('./asset/elshaddai-928fd-firebase-adminsdk-y26o9-37eec7b068.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Función para exportar un documento y sus subcolecciones
async function exportDocument(docRef) {
  const docSnapshot = await docRef.get();
  if (!docSnapshot.exists) {
    console.log(`Document ${docRef.id} does not exist.`);
    return null;
  }

  const docData = { id: docSnapshot.id, ...docSnapshot.data() };
  console.log(`Document ${docRef.id} data:`, docData);

  // Exportar subcolecciones del documento
  const subcollections = await docRef.listCollections();
  for (const subcollection of subcollections) {
    console.log(`Exporting subcollection ${subcollection.id} of document ${docRef.id}`);
    const subcollectionData = await exportCollection(subcollection);
    docData[subcollection.id] = subcollectionData;
  }

  return docData;
}

// Función para exportar una colección y sus subcolecciones
async function exportCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  const collectionData = [];
  console.log(`Exporting collection ${collectionRef.id}`);

  for (const doc of snapshot.docs) {
    const docData = await exportDocument(doc.ref);
    if (docData) {
      collectionData.push(docData);
    }
  }

  return collectionData;
}

// Lista de colecciones a exportar
const collectionNames = [
  'Courses',
  'Datadeconsulta',
  'Datadeenrollment',
  'Docentes',
  'Indicadores',
  'PeriodosAcademicos',
  'StudentCourse',
  'StudentObservers',
  'actividades',
  'asistencia',
  'configurationSite',
  'finalNotes',
  'generalIndicator',
  'horariosacademicos',
  'observacionInformes',
  'sedeIndicator',
  'studentReports',
  'users'
];

// Función para exportar todas las colecciones a un solo archivo JSON
async function exportAllCollections() {
  const allData = {};

  for (const collectionName of collectionNames) {
    const collectionRef = db.collection(collectionName);
    console.log(`Starting export for collection ${collectionName}`);
    allData[collectionName] = await exportCollection(collectionRef);
    console.log(`Finished export for collection ${collectionName}`);
  }

  const filePath = path.join(__dirname, 'datosFirebase.json');
  console.log(`Writing data to ${filePath}`);
  jsonfile.writeFile(filePath, allData, { spaces: 2 }, err => {
    if (err) console.error(`Error writing file:`, err);
    else console.log(`Data successfully written to ${filePath}`);
  });
}

exportAllCollections().then(() => {
  console.log('Data export completed.');
}).catch(error => {
  console.error('Error exporting data:', error);
});


//const serviceAccount = require('./asset/elshaddai-928fd-firebase-adminsdk-y26o9-37eec7b068.json');
