let BG;
// 定義角色的各種動作狀態和對應的精靈圖資訊
let player1 = {
  idle: {
    img: null,
    width: 469/6,    // 單一幀的寬度
    height: 99,      // 單一幀的高度
    frames: 6        // 總幀數
  },
  walk: {
    img: null,
    width: 511/4,
    height: 86,
    frames: 4
  },
  jump: {
    img: null,
    width: 535/5,
    height: 83,
    frames: 5
  }
};

let player2 = {
  idle: {
    img: null,
    width: 1387/8,
    height: 140,
    frames: 8
  },
  walk: {
    img: null,
    width: 977/6,
    height: 150,
    frames: 6
  },
  jump: {
    img: null,
    width: 833/6,
    height: 213,
    frames: 6
  }
};

let character1, character2;

// 在檔案開頭添加子彈陣列
let bullets1 = []; // 角色1的子彈
let bullets2 = []; // 角色2的子彈

// 添加 Bullet 類別
class Bullet {
  constructor(x, y, direction, isPlayer2) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.direction = direction;
    this.size = 15;
    this.isPlayer2 = isPlayer2;
    this.active = true;
  }
  
  update() {
    this.x += this.speed * this.direction;
  }
  
  display() {
    push();
    noStroke();
    // 角色1的子彈是綠色，角色2的子彈是紅色
    fill(this.isPlayer2 ? '#ff0000' : '#00ff00');
    circle(this.x, this.y, this.size);
    pop();
  }
  
  hits(character) {
    let d = dist(this.x, this.y, character.x, character.y);
    return d < 50; // 碰撞判定範圍
  }
}

function preload() {
  BG=loadImage('BG.jpg')
  // 預載入第一個角色的精靈圖
  player1.idle.img = loadImage('player1/idle.png');
  player1.walk.img = loadImage('player1/walk.png');
  player1.jump.img = loadImage('player1/jump.png');
  
  // 預載入第二個角色的精靈圖
  player2.idle.img = loadImage('player2/idle1.png');
  player2.walk.img = loadImage('player2/walk1.png');
  player2.jump.img = loadImage('player2/jump1.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 創建兩個角色實例
  character1 = new Character(width/3, height/2, player1, false);  // 左側
  character2 = new Character(2*width/3, height/2, player2, true); // 右側
}

class Character {
  constructor(x, y, playerData, isPlayer2 = false) {
    this.x = x;
    this.y = y;
    this.playerData = playerData;  // 儲存角色的資料
    this.currentFrame = 0;
    this.currentAction = 'idle';
    this.frameCount = 0;
    this.animationSpeed = 0.1;
    this.isPlayer2 = isPlayer2;
    this.scale = isPlayer2 ? -1 : 1;  // 角色二預設為 -1
    this.health = 100; // 最大生命值
    this.maxHealth = 100;
  }
  
  update() {
    this.frameCount += this.animationSpeed;
    const totalFrames = this.playerData[this.currentAction].frames;
    this.currentFrame = floor(this.frameCount % totalFrames);
  }
  
  display() {
    const action = this.playerData[this.currentAction];
    let sx = this.currentFrame * action.width;
    
    push();  // 儲存當前繪圖狀態
    translate(this.x, this.y);  // 移動到角色位置
    
    if (this.isPlayer2) {
      // 角色二的顯示處理
      scale(-2, 2);  // 水平翻轉並放大
    } else {
      // 角色一的顯示處理
      scale(2, 2);  // 只放大
    }
    
    image(action.img, 
          -action.width/2,  // 調整錨點到中心
          -action.height/2, 
          action.width,
          action.height,
          sx, 0,
          action.width, 
          action.height);
          
    pop();  // 恢復繪圖狀態
  }
  
  changeAction(action) {
    if (this.currentAction !== action) {
      this.currentAction = action;
      this.frameCount = 0;
    }
  }
  
  moveLeft() {
    this.x -= this.speed;
    if (this.isGrounded) {
      this.changeAction('walk');
    }
    // 不需要改變 scale，保持原本的翻轉狀態
  }
  
  moveRight() {
    this.x += this.speed;
    if (this.isGrounded) {
      this.changeAction('walk');
    }
    // 不需要改變 scale，保持原本的翻轉狀態
  }
  
  displayHealthBar() {
    push();
    // 血條位置（在角色頭上）
    let barX = this.x - 50; // 血條寬度的一半
    let barY = this.y - this.playerData[this.currentAction].height - 20; // 角色高度加上一些間距
    
    // 血條背景（灰色）
    noStroke();
    fill(80);
    rect(barX, barY, 100, 10, 5);
    
    // 血條（從綠色漸變到紅色）
    let healthPercent = this.health / this.maxHealth;
    let barColor = color(
      map(healthPercent, 0, 1, 255, 0),  // R
      map(healthPercent, 0, 1, 0, 255),   // G
      0                                   // B
    );
    fill(barColor);
    rect(barX, barY, 100 * healthPercent, 10, 5);
    
    // 顯示數值
    textAlign(CENTER);
    textSize(14);
    fill(255);
    stroke(0);
    strokeWeight(2);
    text(ceil(this.health) + "/" + this.maxHealth, this.x, barY - 5);
    pop();
  }
}

function draw() {
  background(BG);
  
  // 角色1的 A/D 控制
  if (keyIsDown(65)) { // A key
    character1.x -= 5;
    character1.changeAction('walk');
    character1.scale = -1;
  } else if (keyIsDown(68)) { // D key
    character1.x += 5;
    character1.changeAction('walk');
    character1.scale = 1;
  } else if (character1.currentAction === 'walk') {
    character1.changeAction('idle');
  }
  
  // 角色2的左右方向鍵控制
  if (keyIsDown(LEFT_ARROW)) {
    character2.x -= 5;
    character2.changeAction('walk');
    character2.scale = 1;
  } else if (keyIsDown(RIGHT_ARROW)) {
    character2.x += 5;
    character2.changeAction('walk');
    character2.scale = -1;
  } else if (character2.currentAction === 'walk') {
    character2.changeAction('idle');
  }
  
  // 更新和顯示角色
  character1.update();
  character2.update();
  character1.display();
  character2.update();
  character2.display();
  
  // 顯示角色和血條
  character1.display();
  character2.display();
  character1.displayHealthBar();
  character2.displayHealthBar();
  
  // 設定文字樣式
  textSize(48);  // 設定較大的文字大小
  textAlign(CENTER, BOTTOM);  // 文字水平置中，垂直對齊底部
  textStyle(BOLD);  // 文字粗體
  fill(255);  // 文字顏色為白色
  stroke(0);  // 文字外框顏色為黑色
  strokeWeight(3);  // 文字外框粗細
  
  // 在視窗下方中央顯示文字
  text("淡江教科", width/2, height - 50);
  
  // 在左上角添加控制說明文字
  push();
  textAlign(LEFT);
  textSize(16);
  fill(255);
  stroke(0);
  strokeWeight(2);
  let lineHeight = 25;
  let startX = 20;
  let startY = 30;
  
  text("角色1控制：", startX, startY);
  text("- A/D：左右移動", startX, startY + lineHeight);
  text("- F：發射子彈", startX, startY + lineHeight * 2);
  text("- 空白鍵：發射爆炸", startX, startY + lineHeight * 3);
  
  text("角色2控制：", startX, startY + lineHeight * 4);
  text("- ←/→：左右移動", startX, startY + lineHeight * 5);
  text("- L：發射子彈", startX, startY + lineHeight * 6);
  
 pop();
  
  // 更新和顯示子彈
  // 角色1的子彈
  for (let i = bullets1.length - 1; i >= 0; i--) {
    bullets1[i].update();
    bullets1[i].display();
    
    // 檢查是否擊中角色2
    if (bullets1[i].hits(character2)) {
      character2.health = max(0, character2.health - 10); // 扣血
      bullets1.splice(i, 1); // 移除子彈
      continue;
    }
    
    // 移除超出畫面的子彈
    if (bullets1[i].x < 0 || bullets1[i].x > width) {
      bullets1.splice(i, 1);
    }
  }
  
  // 角色2的子彈
  for (let i = bullets2.length - 1; i >= 0; i--) {
    bullets2[i].update();
    bullets2[i].display();
    
    // 檢查是否擊中角色1
    if (bullets2[i].hits(character1)) {
      character1.health = max(0, character1.health - 10); // 扣血
      bullets2.splice(i, 1); // 移除子彈
      continue;
    }
    
    // 移除超出畫面的子彈
    if (bullets2[i].x < 0 || bullets2[i].x > width) {
      bullets2.splice(i, 1);
    }
  }
}

function keyPressed() {
  // 第一個角色的控制鍵（1,2,3）
  if (key === '1') {
    character1.changeAction('idle');
  } else if (key === '2') {
    character1.changeAction('walk');
  } else if (key === '3') {
    character1.changeAction('jump');
  }
  
  // 第二個角色的控制鍵（4,5,6）
  if (key === '4') {
    character2.changeAction('idle');
  } else if (key === '5') {
    character2.changeAction('walk');
  } else if (key === '6') {
    character2.changeAction('jump');
  }
  
  // 角色1用F鍵發射子彈
  if (key === 'f' || key === 'F') {
    let bullet = new Bullet(
      character1.x + (30 * character1.scale), // 子彈生成位置
      character1.y,
      character1.scale,
      false
    );
    bullets1.push(bullet);
  }
  
  // 角色2用L鍵發射子彈
  if (key === 'l' || key === 'L') {
    let bullet = new Bullet(
      character2.x + (30 * character2.scale),
      character2.y,
      character2.scale,
      true
    );
    bullets2.push(bullet);
  }
}
