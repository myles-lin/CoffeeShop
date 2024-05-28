# CoffeeShop-website
## 目錄
1. #### [專案摘要](#專案摘要)
2. #### [技術架構](#技術架構)    
3. #### [後端開發](#後端開發)
    - [**Database Schema**](#Database%20Schema)
    - [**RESTful API**](#RESTful%20API)

## 專案摘要
「CoffeeShop」是一個咖啡電商網站，為店家提供販售咖啡商品的服務，包含會員、商品、購物車、訂單系統，店家能夠修改商品內容及管理訂單。

## 技術架構

- Frontend: HTML, CSS, Javascript, AJAX
- Backend: Node.js, Express.js, MongoDB(Mongoose), Redis, Linux
- Cloud Service(AWS): EC2, S3 
- Deployment Tools: Git(Github), Docker & Docker-Compose


## 後端開發
- ## Database Schema
	+ Member Model
		+  | 欄位名稱 | Type | Constraints | 欄位說明 |  
            | :--- | :---: | :---: | :---: | 
            |   account | string | required, unique | 帳號 |  
            |   password | string | required | 密碼 |
            |   name | string | none | 使用者姓名 |
            |   address | string | none | 使用者地址 |
	+ Product Model
		+  | 欄位名稱 | Type | Constraints | 欄位說明 |  
           | :--- | :---: | :---: | :---: | 
           |   pid | number | required, unique | 商品序號 |  
           |   name | string | required, unique | 商品名稱 |
           |   category | string | required | 商品種類 |
           |   roastLevel | string | none | 咖啡烘焙程度 |
           |   region | string | none | 咖啡產地 |
           |   quantity | number | none | 數量 |
           |   price | number | none | 價格 |
           |   content | string | none | 商品敘述 |
           |   imageUrl | string | none | 商品圖片 |
	+ Order Model
		+ | 欄位名稱 | Type | Constraints | 欄位說明 |  
          | :--- | :---: | :---: | :---: | 
          | orderId | number | required, unique | 訂單序號 |  
          | account | string | required | 使用者帳號 |
          | purchase | array | required | 訂單列表 |
          | name | string | required | 收件姓名 |
          | deliveryAddress | string | required | 收件地址 |
          | totalAmount | number | none | 付款金額 |
          | status | string | none | 訂單狀態 |
          | message | array | none | 訂單留言訊息 |
- ## RESTful API
	+ | Function | Method | Path | Permissions |
      | :--- | :---: | --- | :---: |
      | Login | POST | /login | none
      | Signup | POST | /register | none
      | |
      | Products List | GET | /products | admin
      | Read Product | GET | /products/:id | none
      | Create Product | POST | /products | admin
      | Update Product | PATCH | /products/:id | admin
      | Delete Product | DELETE | /products/:id | admin
      | |
      | Cart List | GET | /shoppingCarts | member
      | Create Cart | POST | /shoppingCarts | member
      | Delete Cart | DELETE | /shoppingCarts/:id | member
      | |
      | Orders List | GET | /orders | admin
      | Read Order | GET | /orders/:id | admin / buyer
      | Create Order | POST | /orders | member
      | |
      | Members List | GET | /members | admin
      | Update Member | PATCH | /members/:id | member