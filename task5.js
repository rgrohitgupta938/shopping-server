const express = require("express");
const app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  next();
});
const { Client } = require("pg");
let { images } = require("./dataTask5");
const client = new Client({
  user: "postgres",
  password: "RgRohitG@938",
  database: "postgres",
  port: 5432,
  host: "db.pnzljmpyxqipzdmohkdj.supabase.co",
  ssl: { rejectUnauthorized: false },
});
client.connect().then(() => {
  console.log("Connected to the database successfully!");
});
const port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}`));
app.get("/resetdata", function (req, res) {
  const delQuery = "DELETE FROM products";
  client.query(delQuery, function (err, delRes) {
    if (err) {
      console.log("Error Deleting Data", err);
      res.status(500).send("An error occured while deleting data");
    } else {
      const insertQuery1 =
        "INSERT INTO products (id,category,description,imglink,name,price) VALUES ";
      const values = images.map(
        (p) =>
          `(${p.id},'${p.category}','${p.description}','${p.imglink}','${p.name}',${p.price})`
      );
      const insertQuery = insertQuery1 + values.join(",");
      client.query(insertQuery, function (err, insRes) {
        if (err) {
          console.log("Error while resetinf Data", err);
          res.status(500).send("An error occurre while reseting data");
        } else {
          res.send("Succesfully reset data.Affected Rows : " + insRes.rowCount);
        }
      });
    }
  });
});
app.get("/products/:category", function (req, res) {
  let { category } = req.params;
  let type = typeof category;
  console.log(type, category);
  if (category !== "All") {
    const query = "SELECT * FROM products WHERE category = $1";
    client.query(query, [category], function (err, selRes) {
      if (err) {
        console.log("Error fetching products : ", err);
        res.status(500).send("An error occurred while fetching products");
      } else {
        res.send(selRes.rows);
      }
    });
  } else {
    const query = "SELECT * FROM products";
    client.query(query, function (err, selRes) {
      if (err) {
        console.log("Error fetching products : ", err);
        res.status(500).send("An error occurred while fetching products");
      } else {
        res.send(selRes.rows);
      }
    });
  }
});
app.get("/products", function (req, res) {
  const query = "SELECT * FROM products";
  client.query(query, function (err, selRes) {
    if (err) {
      console.log("Error fetching products : ", err);
      res.status(500).send("An error occurred while fetching products");
    } else {
      res.send(selRes.rows);
    }
  });
});
app.get("/product/:id", function (req, res) {
  let { id } = req.params;
  console.log(id);
  const query = "SELECT * FROM products WHERE id = $1";
  client.query(query, [id], function (err, selRes) {
    if (err) {
      console.log("Error fetching product : ", err);
      res.status(500).send("An error occurred while fetching product");
    } else {
      res.send(selRes.rows);
    }
  });
});
app.post("/products", function (req, res) {
  let { name, price, category, imglink, description } = req.body;
  console.log(req.body);
  const query =
    "INSERT INTO products (category,description,imglink,name,price) VALUES ($1,$2,$3,$4,$5)";
  const values = [category, description, imglink, name, price];
  client.query(query, values, function (err, insRes) {
    if (err) {
      console.log("Error occured while inserting : ", err);
    } else {
      console.log(insRes);
      res.send(`${insRes.rowCount} insertion Succesfull`);
    }
  });
});
app.put("/products/:id", function (req, res) {
  const id = +req.params.id;
  let { name, price = 0, category, imglink, description } = req.body;
  if (id) {
    const selectQuery = "SELECT * FROM products WHERE id = $1";
    client.query(selectQuery, [id], function (err, result) {
      if (err) {
        res.status(404).send(err);
      } else {
        if (result.rows.length === 0) {
          res.status(404).send("Employee with the given ID not found.");
        } else {
          const updateQuery =
            "UPDATE products SET name=$1, category=$2, description=$3,price=$4,imglink=$5 WHERE id=$6";
          const values = [name, category, description, price, imglink, id];

          client.query(updateQuery, values, function (err, result) {
            if (err) {
              console.error("Error while updating data:", err);
              res.status(500).send("An error occurred while updating data.");
            } else {
              console.log(result);
              res.send(`${result.rowCount} Updated Successful`);
            }
          });
        }
      }
    });
  }
});
app.delete("/products/:id", function (req, res) {
  let { id } = req.params;
  let delQuery = "DELETE FROM products WHERE id = $1";
  client.query(delQuery, [id], function (err, delRes) {
    if (err) {
      console.log("Error deleting product : ", err);
      res.status(500).send("Error deleting product");
    } else {
      console.log(delRes);
      res.send("" + delRes.rowCount);
    }
  });
});
app.get("/orders", function (req, res) {
  const query = "SELECT * FROM orders";
  client.query(query, function (err, selRes) {
    if (err) {
      console.log("Error fetching Order Details : ", err);
      res.status(500).send("An error occurred while fetching Order details");
    } else {
      console.log(selRes.rows);
      res.send(selRes.rows);
    }
  });
});
app.post("/orders", function (req, res) {
  console.log(req.body);
  let { name, address1, city, address2, items, email, totalamount } = req.body;
  const query =
    "INSERT INTO orders (name, address1, city, address2, items, email,totalamount) VALUES ($1,$2,$3,$4,$5,$6,$7)";
  const values = [name, address1, city, address2, items, email, totalamount];
  client.query(query, values, function (err, insRes) {
    if (err) {
      console.log("Error occured while inserting : ", err);
    } else {
      console.log(insRes);
      res.send(`${insRes.rowCount} insertion Succesfull`);
    }
  });
});
app.post("/products", function (req, res) {
  let { name, address, city, totalPrice, items, email } = req.body;
  const query =
    "INSERT INTO orders (name, address, city, totalprice, items, email) VALUES ($1,$2,$3,$4,$5,$6)";
  const values = [name, address, city, totalPrice, items, email];
  client.query(query, values, function (err, insRes) {
    if (err) {
      console.log("Error occured while inserting : ", err);
    } else {
      console.log(insRes);
      res.send(`${insRes.rowCount} insertion Succesfull`);
    }
  });
});
app.post("/login", function (req, res) {
  let { email, password } = req.body;
  let selQuery = "SELECT * FROM users";
  const values = [email, password];
  client.query(selQuery, function (err, selRes) {
    if (err) {
      console.log("Inavlid Login", err);
      res.status(404).send("Invalid email or password");
    } else {
      console.log(selRes);
      let data = selRes.rows;
      let index = data.findIndex(
        (st) => st.email === email && st.password === password
      );
      console.log(index);
      if (index >= 0) {
        res.send(selRes.rows[index]);
      } else {
        res.status(400).send("Invalid Login");
      }
    }
  });
});
app.post("/register", function (req, res) {
  let { email, password, name } = req.body;
  let insQuery = "INSERT INTO users (email,password) VALUES ($1,$2)";
  const values = [email, password];
  client.query(insQuery, values, function (err, selRes) {
    if (err) {
      console.log("Error adding user : ", err);
      res.status(404).send("Error ");
    } else {
      console.log(selRes.rowCount);
      res.send("User added Successfully");
    }
  });
});
