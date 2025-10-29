const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'mygarage',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const checkColumnExists = async (connection, table, column) => {
  const [columns] = await connection.query(
    `SHOW COLUMNS FROM ${table} LIKE ?`,
    [column]
  );
  return columns.length > 0;
};

const addColumnIfNotExists = async (connection, table, column, definition) => {
  const exists = await checkColumnExists(connection, table, column);
  if (!exists) {
    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`✅ Added column ${table}.${column}`);
  }
};

const initDatabase = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_username (username),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await addColumnIfNotExists(connection, 'users', 'is_admin', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists(connection, 'users', 'perm_manage_users', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists(connection, 'users', 'perm_edit_inventory', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists(connection, 'users', 'perm_delete_inventory', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists(connection, 'users', 'perm_add_inventory', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists(connection, 'users', 'perm_manage_categories', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists(connection, 'users', 'perm_view_logs', 'BOOLEAN DEFAULT FALSE');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category_id INT,
        quantity INT DEFAULT 0,
        description TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category_id),
        INDEX idx_name (name),
        INDEX idx_item_id (item_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await addColumnIfNotExists(connection, 'inventory_items', 'item_id', 'VARCHAR(20) UNIQUE NOT NULL DEFAULT ""');
    await addColumnIfNotExists(connection, 'inventory_items', 'image_url', 'VARCHAR(500)');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inventory_item_id INT NOT NULL,
        user_id INT,
        action_type ENUM('add', 'remove', 'adjust', 'create', 'delete') NOT NULL,
        quantity_change INT NOT NULL,
        quantity_before INT NOT NULL,
        quantity_after INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_item (inventory_item_id),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [adminCheck] = await connection.query(
      "SELECT id FROM users WHERE username = 'admin'"
    );

    if (adminCheck.length === 0) {
      const adminPassword = await bcrypt.hash('admin', 10);
      await connection.query(
        `INSERT INTO users (
          username, email, password_hash, is_admin,
          perm_manage_users, perm_edit_inventory, perm_delete_inventory,
          perm_add_inventory, perm_manage_categories, perm_view_logs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin', 'admin@admin.com', adminPassword, true, true, true, true, true, true, true]
      );
      console.log('✅ Default admin user created (username: admin, password: admin)');
      console.log('⚠️  PLEASE CHANGE ADMIN PASSWORD IMMEDIATELY!');
    }

    const [settings] = await connection.query(
      "SELECT value FROM settings WHERE \`key\` = 'allow_registration'"
    );

    if (settings.length === 0) {
      await connection.query(
        "INSERT INTO settings (\`key\`, value) VALUES ('allow_registration', ?)",
        [process.env.ALLOW_REGISTRATION || 'true']
      );
    }

    const [stockSettings] = await connection.query(
      "SELECT value FROM settings WHERE \`key\` = 'low_stock_threshold'"
    );

    if (stockSettings.length === 0) {
      await connection.query(
        "INSERT INTO settings (\`key\`, value) VALUES ('low_stock_threshold', '10')"
      );
    }

    connection.release();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    if (connection) connection.release();
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = { pool, initDatabase };