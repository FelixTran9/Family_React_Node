import pool from "./src/config/db.js";

async function run() {
  try {
    const [truong] = await pool.query("SELECT * FROM CUA_HANG_TRUONG LIMIT 5");
    const [troly] = await pool.query("SELECT * FROM TRO_LY_CUA_HANG LIMIT 5");
    console.log("=== Trưởng Cửa Hàng ===");
    console.log(truong);
    console.log("=== Trợ Lý Cửa Hàng ===");
    console.log(troly);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
