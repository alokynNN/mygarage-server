# ![My Garage](icon.png)
# My Garage

[Support](https://support.alokynn.com) • [Discord](https://discord.alokynn.com) • [Website](https://alokynn.com)

## What is My Garage?

**My Garage** is a modern application that allows you to keep track of your garage inventory. Whether it’s tools, car parts, or other items, My Garage helps you organize and manage everything in one place efficiently.

## Requirements

- Node.js (latest stable version recommended)
- MySQL (make sure it is installed and running)

## Installation

1. Install Node.js by downloading it from https://nodejs.org/.
2. Extract or clone the project into your desired folder.
3. Open a terminal in the project root and install dependencies:
   npm install
4. Create a `.env` file in the project root if it does not exist, with the following content:
   PORT=3000
   ALLOW_REGISTRATION=true
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=mygarage
   DB_USER=mygarage_user
   DB_PASSWORD=jaka_sifra_123
5. Set up MySQL database and user. Open MySQL CLI or your preferred GUI and run:
   CREATE DATABASE howtosay;
   CREATE USER 'mygarage_user'@'localhost' IDENTIFIED BY 'jaka_sifra_123';
   GRANT ALL PRIVILEGES ON howtosay.* TO 'mygarage_user'@'localhost';
   FLUSH PRIVILEGES;
6. Start the server:
   npm run start

The application should now be running on http://localhost:3000.

Enjoy managing your garage! 🚗🔧
