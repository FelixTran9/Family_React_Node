import db from "../config/db.js";

export const getProducts = (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) return res.json(err);

    res.json(result);
  });
};