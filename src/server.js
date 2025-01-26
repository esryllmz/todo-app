const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");

const app = express();
const PORT = 5000;

// CORS'u etkinleştir
app.use(cors());
app.use(bodyParser.json());

// MSSQL bağlantı ayarları
const dbConfig = {
  user: "sa",
  password: "admin123456789",
  server: "localhost",
  database: "TodoApp",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Veritabanı bağlantısı
sql.connect(dbConfig, (err) => {
  if (err) {
    console.error("Veritabanına bağlanırken hata:", err.message);
  } else {
    console.log("MSSQL'e başarıyla bağlanıldı!");
  }
});

// Veritabanından tüm todo'ları al
app.get("/todos", async (req, res) => {
  try {
    const result = await sql.query("SELECT * FROM Todos");
    res.json(result.recordset); // Verileri JSON formatında gönder
  } catch (err) {
    res.status(500).json({ message: "Veritabanı hatası: " + err.message });
  }
});

// Yeni todo ekle
app.post("/todos", async (req, res) => {
  const { title, completed } = req.body;

  if (!title) {
    return res.status(400).send("Title is required");
  }

  try {
    const result = await sql.query`
      INSERT INTO Todos (title, completed) VALUES (${title}, ${completed});
    `;
    res.status(201).json({
      id: result.recordset[0].id, // Yeni eklenen todo'nun ID'si
      title,
      completed,
    });
  } catch (err) {
    res.status(500).send("Veritabanına kayıt yaparken hata: " + err.message);
  }
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params; // URL parametresi olan id'yi alıyoruz

  try {
    const result = await sql.query`
      DELETE FROM Todos WHERE id = ${id};
    `;

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Todo not found");
    }

    res.status(200).send({ id }); // Silinen todo'nun id'sini geri gönderiyoruz
  } catch (err) {
    res.status(500).send("Veritabanı hatası: " + err.message);
  }
});


// Todo güncelleme
app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  try {
    const result = await sql.query`
      UPDATE Todos SET completed = ${completed} WHERE id = ${id};
    `;
    res.status(200).json({
      id,
      completed,
    });
  } catch (err) {
    res.status(500).json({ message: "Güncelleme hatası: " + err.message });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
