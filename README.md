<div align="center">
  <img src="icon.png" alt="My Garage Logo" width="120"/>
  
  # 🚗 My Garage

  A modern inventory management application for organizing your garage items, tools, car parts, and equipment.
</div>

[![Support](https://img.shields.io/badge/Support-Visit-blue)](https://support.alokynn.com)
[![Discord](https://img.shields.io/badge/Discord-Join-7289da)](https://discord.alokynn.com)
[![Website](https://img.shields.io/badge/Website-Visit-green)](https://alokynn.com)

---

## 📋 Overview

**My Garage** helps you efficiently organize and manage your garage inventory in one centralized location. Keep track of tools, spare parts, equipment, and everything else you store in your garage with an intuitive interface.

---

## ✨ Features

- 📦 **Inventory Management** - Track all your garage items
- 🔍 **Search & Filter** - Quickly find what you need
- 📊 **Organization** - Categorize items for easy access
- 💾 **Persistent Storage** - MySQL database for reliable data storage

---

## 🛠️ Requirements

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - Make sure it's running

---

## 🚀 Installation

### 1️⃣ Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/)

### 2️⃣ Clone or Extract Project

```bash
git clone <your-repository-url>
cd my-garage
```

### 3️⃣ Install Dependencies

```bash
npm install
```

### 4️⃣ Configure Environment

Create a `.env` file in the project root:

```env
PORT=3000
ALLOW_REGISTRATION=true
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mygarage
DB_USER=mygarage_user
DB_PASSWORD=jaka_sifra_123
```

### 5️⃣ Set Up Database

Open MySQL CLI or your preferred database tool and run:

```sql
CREATE DATABASE mygarage;

CREATE USER 'mygarage_user'@'localhost' IDENTIFIED BY 'jaka_sifra_123';

GRANT ALL PRIVILEGES ON mygarage.* TO 'mygarage_user'@'localhost';

FLUSH PRIVILEGES;
```

### 6️⃣ Start the Application

```bash
npm run start
```

The application will be available at **http://localhost:3000** 🎉

---

## 📝 Configuration

You can customize the application by modifying the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `ALLOW_REGISTRATION` | Enable user registration | `true` |
| `DB_HOST` | MySQL host address | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `mygarage` |
| `DB_USER` | Database username | `mygarage_user` |
| `DB_PASSWORD` | Database password | - |

---

## 🐛 Troubleshooting

### Can't connect to MySQL?
- Ensure MySQL service is running
- Verify credentials in `.env` match your MySQL setup
- Check that the database exists

### Port already in use?
- Change the `PORT` value in `.env` to another port (e.g., 3001)

---

## 🤝 Support

Need help? We're here for you!

- 📧 [Support Portal](https://support.alokynn.com)
- 💬 [Join our Discord](https://discord.alokynn.com)
- 🌐 [Visit our Website](https://alokynn.com)

---

## 📄 License

This project is licensed under the MIT License.

---

**Happy organizing! 🔧🚗**
