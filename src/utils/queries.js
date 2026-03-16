export const pdfQueries = {
  'Dashboard_Sales': 'SELECT SUM(จำนวนเงินรวม) AS ยอดขายรวมวันนี้\nFROM ใบเสร็จ\nWHERE DATE(วันที่ออกใบเสร็จ) = CURDATE();',
  'Dashboard_Tables': 'SELECT COUNT(*) AS โต๊ะที่ว่าง\nFROM โต๊ะ\nWHERE รหัสลูกค้า IS NULL;',
  'Dashboard_Popular': 'SELECT ชื่อเมนู, SUM(จำนวน) AS ยอดขาย\nFROM สั่งซื้อ\nJOIN รายการอาหาร ON สั่งซื้อ.รหัสเมนูอาหาร = รายการอาหาร.รหัสเมนูอาหาร\nGROUP BY ชื่อเมนู\nORDER BY ยอดขาย DESC\nLIMIT 3;',
  'Ordering': 'SELECT ชื่อเมนู, จำนวน, (จำนวน * ราคา) AS ราคารวม\nFROM สั่งซื้อ\nJOIN รายการอาหาร ON สั่งซื้อ.รหัสเมนูอาหาร = รายการอาหาร.รหัสเมนูอาหาร\nWHERE เลขที่โต๊ะ = ?;',
  'Live Map': 'SELECT * FROM โต๊ะ;',
  'Menu': 'SELECT รหัสเมนูอาหาร, ชื่อเมนู, ประเภทเมนู, ขนาด, ราคา\nFROM รายการอาหาร;',
  'Staff': 'SELECT รหัสพนักงาน, ชื่อพนักงาน, ตำแหน่ง, เงินเดือน, ที่อยู่\nFROM พนักงาน;',
  'Customers': 'SELECT รหัสลูกค้า, ชื่อ, เบอร์\nFROM ลูกค้า;',
  'Receipts': 'SELECT รหัสใบเสร็จ, วันที่ออกใบเสร็จ, รหัสลูกค้า, จำนวนเงินรวม\nFROM ใบเสร็จ\nORDER BY วันที่ออกใบเสร็จ DESC;',
  'Login': 'SELECT รหัสพนักงาน, ชื่อพนักงาน, ตำแหน่ง\nFROM พนักงาน\nWHERE รหัสพนักงาน = ? AND รหัสผ่าน = ?;',
  
  // CRUD - Menu
  'Menu_Insert': 'INSERT INTO รายการอาหาร (รหัสเมนูอาหาร, ชื่อเมนู, ประเภทเมนู, ขนาด, ราคา, image) \nVALUES (?, ?, ?, ?, ?, ?);',
  'Menu_Update': 'UPDATE รายการอาหาร \nSET ชื่อเมนู = ?, ประเภทเมนู = ?, ขนาด = ?, ราคา = ?, image = ? \nWHERE รหัสเมนูอาหาร = ?;',
  'Menu_Delete': 'DELETE FROM รายการอาหาร WHERE รหัสเมนูอาหาร = ?;',

  // CRUD - Staff
  'Staff_Insert': 'INSERT INTO พนักงาน (รหัสพนักงาน, ชื่อพนักงาน, ตำแหน่ง, เงินเดือน, ที่อยู่) \nVALUES (?, ?, ?, ?, ?);',
  'Staff_Update': 'UPDATE พนักงาน \nSET ชื่อพนักงาน = ?, ตำแหน่ง = ?, เงินเดือน = ?, ที่อยู่ = ? \nWHERE รหัสพนักงาน = ?;',
  'Staff_Delete': 'DELETE FROM พนักงาน WHERE รหัสพนักงาน = ?;',

  // CRUD - Customers
  'Customers_Insert': 'INSERT INTO ลูกค้า (รหัสลูกค้า, ชื่อ, เบอร์, รหัสผ่าน) \nVALUES (?, ?, ?, ?);',
  'Customers_Update': 'UPDATE ลูกค้า \nSET ชื่อ = ?, เบอร์ = ?, รหัสผ่าน = ? \nWHERE รหัสลูกค้า = ?;',
  'Customers_Delete': 'DELETE FROM ลูกค้า WHERE รหัสลูกค้า = ?;',

  // CRUD - Tables
  'Tables_Insert': 'INSERT INTO โต๊ะ (เลขที่โต๊ะ, ขนาดโต๊ะ) \nVALUES (?, ?);',
  'Tables_Update': 'UPDATE โต๊ะ \nSET ขนาดโต๊ะ = ? \nWHERE เลขที่โต๊ะ = ?;',

  // Transactions - Orders
  'Order_Insert': 'INSERT INTO ใบสั่งซื้อ (รหัสใบสั่งซื้อ, รหัสลูกค้า, เลขที่โต๊ะ, จำนวนรวม) \nVALUES (?, ?, ?, ?);',
  'OrderItem_Insert': 'INSERT INTO รายการสั่งซื้อ (รหัสใบสั่งซื้อ, รหัสเมนูอาหาร, จำนวน) \nVALUES (?, ?, ?);',
  'Table_Occupy': 'UPDATE โต๊ะ SET รหัสลูกค้า = ?, สถานะ = \'Occupied\' \nWHERE เลขที่โต๊ะ = ?;',

  // Transactions - Payments
  'Receipt_Insert': 'INSERT INTO ใบเสร็จ (รหัสใบเสร็จ, จำนวนเงินรวม, รหัสลูกค้า, รหัสพนักงาน, วันที่ออกใบเสร็จ) \nVALUES (?, ?, ?, ?, NOW());',
  'Table_Release': 'UPDATE โต๊ะ SET รหัสลูกค้า = NULL, สถานะ = \'Available\' \nWHERE เลขที่โต๊ะ = ?;'
};
