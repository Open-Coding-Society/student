# Lesson: Understanding the Shop Object

## 1. What is the `shop`?
The `shop` is an object in JavaScript. Think of it like a toolbox that keeps track of what’s for sale in your game and how players interact with the store.

It has two main parts:  
- Properties (data it stores)  
- Methods (functions it can run)  

---

## 2. Properties
In your code, the shop has:  
- `forSale` → list of items you can buy (like Grandma or Factory)  
- `upgrades` → special one-time boosts (like 2X clicks)  
- `tab` → tells the shop whether to show “Shop” items or “Upgrades”  

Properties are like the memory of the object.

---

## 3. Methods
The shop also has functions to do things:  
- `updateShopDisplay()` → rebuilds the shop UI on screen  
- `addItemForSale(item)` → adds an item to the list  
- `updateForSalePrice(newPrice, index)` → raises the price after you buy something  
- `switchTab(newTab)` → switches between “Shop” and “Upgrades”  

Methods are like the actions the object knows how to perform.

---

## 4. How it Connects to Other Parts
The shop doesn’t work alone. It connects to:  
- `cookie` object → checks if you have enough cookies and deducts the cost  
- `gameLoop` object → gives you auto-clickers or upgrades when you buy  
- UI (`shopContainer`) → updates the buttons the player sees  

This makes the shop a hub that ties together money, gameplay, and visuals.

---

## 5. What You Can Learn From It
- Encapsulation → All shop logic is inside one object, so the code is organized  
- Separation of concerns → Shop only handles buying and displaying; cookies and gameLoop handle their own jobs  
- Scalability → You can add new items or upgrades without rewriting the whole shop  

---

## Takeaway
When learning JavaScript and object-oriented design, notice how each object in your game has a clear role. By keeping properties and methods grouped, your code becomes easier to read, expand, and debug.


```mermaid
flowchart TD

CLICK["Player clicks Buy button"]
CHECK{"Enough cookies?"}

CLICK --> CHECK
CHECK -- No --> ALERT["Show 'Not enough cookies'"]
CHECK -- Yes --> DEDUCT["cookie.addCookies(-price)"]
DEDUCT --> UPDATE["gameLoop adds upgrade or auto-clicker"]
UPDATE --> REFRESH["shop.updateShopDisplay updates UI"]

```