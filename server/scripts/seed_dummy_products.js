import "dotenv/config";
import pool from "../db.js";
import bcrypt from "bcrypt";

const categories = [
  "Canvas Painting",
  "Handmade Pottery",
  "Calligraphy Art",
  "Wooven Basket",
  "Ceramic Vase",
  "Wood Carving",
  "Handmade Jewelry",
  "Embroidery",
  "Fabric/Batik",
  "Sketch/Drwaing",
  "Sculpture",
  "Home Decor Craft",
];

const dummyProducts = [
  { name: "Canvas Painting", description: "Hand-painted expression for timeless spaces.", price: 999, category: "Canvas Painting" },
  { name: "Handmade Pottery", description: "Earth-shaped by hand,made to last.", price: 999, category: "Handmade Pottery" },
  { name: "Calligraphy Art", description: "Where words become visual poetry.", price: 999, category: "Calligraphy Art" },
  { name: "Woven Basket", description: "Traditionally woven,naturally beautiful.", price: 499, category: "Wooven Basket" },
  { name: "Ceramic Vase", description: "Crafted curves with artisanal charm.", price: 1999, category: "Ceramic Vase" },
  { name: "Wood Carving", description: "Nature carved into lasting art.", price: 499, category: "Wood Carving" },
  { name: "Handmade Jewelry", description: "Delicate design,handcrafted elegance.", price: 499, category: "Handmade Jewelry" },
  { name: "Embroidery", description: "Stitched by hand,rich in heritage.", price: 999, category: "Embroidery" },
  { name: "Fabric/Batik", description: "Patterns dyed with cultural soul.", price: 999, category: "Fabric/Batik" },
  { name: "Sketch/Drawing", description: "Raw lines,pure artistic emotion.", price: 999, category: "Sketch/Drwaing" },
  { name: "Sculpture", description: "Form shaped by vision and skill.", price: 2999, category: "Sculpture" },
  { name: "Home Decor Craft", description: "Artful details for inspired living.", price: 499, category: "Home Decor Craft" },
];

async function ensureAdminAndSellerAndStore(client) {
  // 1) admin user
  const adminEmail = "admin@charisatelier.com";
  const adminUsername = "admin";
  const adminPassHash = await bcrypt.hash("Admin123!", 10);

  const adminUser = await client.query(
    `
    INSERT INTO users (username, email, password_hash, status)
    VALUES ($1,$2,$3,'active')
    ON CONFLICT (email) DO UPDATE SET username=EXCLUDED.username
    RETURNING user_id
    `,
    [adminUsername, adminEmail, adminPassHash]
  );
  const adminId = adminUser.rows[0].user_id;

  await client.query(
    `
    INSERT INTO admin (user_id, clearance_level, is_employee)
    VALUES ($1, 10, TRUE)
    ON CONFLICT (user_id) DO NOTHING
    `,
    [adminId]
  );

  // 2) demo seller user
  const sellerEmail = "demo_seller@charisatelier.com";
  const sellerUsername = "demo_seller";
  const sellerPassHash = await bcrypt.hash("Seller123!", 10);

  const sellerUser = await client.query(
    `
    INSERT INTO users (username, email, password_hash, status)
    VALUES ($1,$2,$3,'active')
    ON CONFLICT (email) DO UPDATE SET username=EXCLUDED.username
    RETURNING user_id
    `,
    [sellerUsername, sellerEmail, sellerPassHash]
  );
  const sellerId = sellerUser.rows[0].user_id;

  await client.query(
    `
    INSERT INTO seller (user_id, approved_by, approved_at, business_name, kyc_status)
    VALUES ($1,$2,now(),'Happy Shop','approved')
    ON CONFLICT (user_id) DO UPDATE SET
      kyc_status='approved',
      approved_by=EXCLUDED.approved_by,
      approved_at=now()
    `,
    [sellerId, adminId]
  );

  // 3) store
  const storeRes = await client.query(
    `
    INSERT INTO store (user_id, store_name, store_status, ref_no)
    VALUES ($1, 'Happy Shop', 'active', 'HAPPY_DEMO_001')
    ON CONFLICT (ref_no) DO UPDATE SET store_name=EXCLUDED.store_name
    RETURNING store_id
    `,
    [sellerId]
  );
  const storeId = storeRes.rows[0].store_id;

  return { adminId, sellerId, storeId };
}

async function ensureCategories(client) {
  const map = new Map();
  for (const name of categories) {
    const { rows } = await client.query(
      `
      INSERT INTO category (category_name, visibility_status)
      VALUES ($1, TRUE)
      ON CONFLICT (category_name) DO UPDATE SET category_name=EXCLUDED.category_name
      RETURNING category_id, category_name
      `,
      [name]
    );
    map.set(rows[0].category_name, rows[0].category_id);
  }
  return map;
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { storeId } = await ensureAdminAndSellerAndStore(client);
    const categoryMap = await ensureCategories(client);

    // Insert products (skip duplicates by name+store)
    for (const p of dummyProducts) {
      const categoryId = categoryMap.get(p.category) || null;

      const exists = await client.query(
        `SELECT 1 FROM product WHERE store_id=$1 AND product_name=$2`,
        [storeId, p.name]
      );
      if (exists.rowCount > 0) continue;

      await client.query(
        `
        INSERT INTO product (store_id, category_id, product_name, price, product_description, product_count, discount, status, visibility_status)
        VALUES ($1,$2,$3,$4,$5,50,0,'active',TRUE)
        `,
        [storeId, categoryId, p.name, p.price, p.description]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Seed complete!");
    console.log("Demo admin: admin@charisatelier.com / Admin123!");
    console.log("Demo seller: demo_seller@charisatelier.com / Seller123!");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("SEED ERROR:", e);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
