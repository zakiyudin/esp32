import express from "express";
import mysql from "mysql2";
import cron from "node-cron";
import cors from "cors";


const app = express();
const PORT = 8990;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'esp32'
});

db.connect((error) => {
    if(error)
        throw error;
        console.log(error);
    
    console.log('Mysql tersambung');
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/led', (req, res) => {
    db.query('SELECT * FROM monitor_mesin', (err, results) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        res.json(results);
    });
})

app.post('/led', (req, res) => {
    const { 
        id_mesin,
        m1,
        m2,
        m3,
        m4,
        d1,
        d2,
     } = req.body;

     const timestamp = new Date();
    
    const query = 'INSERT INTO monitor_mesin (id_mesin, m1, m2, m3, m4, d1, d2, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    let values = [
        id_mesin, m1, m2, m3, m4, d1, d2, timestamp
    ]
    db.query(query, values, (error, result) => {
        if (error){
            res.status(500).send('Gagal save data');
            throw error;
        }
        
        res.send('Berhasil save data')
    })
})

cron.schedule('*/2 * * * *', () => {
    console.log('running a task every two minutes');
    deleteRecords(10);
  });

const deleteRecords = (minutes) => {
    const query = `DELETE FROM monitor_mesin
                    WHERE create_time < DATE_SUB(NOW(), INTERVAL ? MINUTE);`;
    db.query(query, [minutes], (err, results) => {
        if (err) {
        console.error('Error deleting old data:', err.message);
        } else {
        console.log(`Deleted ${results.affectedRows} rows of old data`);
        }
    });
}

app.listen(PORT, () => console.log(`server berjalan  🚀`))