class Egg {
    constructor(element, containerWidth) {
        this.element = element;
        this.containerWidth = containerWidth;
        this.positionY = 0;
        this.positionX = Math.random() * (this.containerWidth - 30);
        this.fallingSpeed = 3;
        this.resetPosition();
    }

    resetPosition() {
        this.positionY = 0;
        this.positionX = Math.random() * (this.containerWidth - 60);
        this.element.style.left = `${this.positionX}px`;
        this.element.textContent = this.getRandomCharacter(); 
    }

    getRandomCharacter() {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        const randomIndex = Math.floor(Math.random() * characters.length);
        return characters[randomIndex]; 
    }

    fall() {
        this.positionY += this.fallingSpeed;
        this.element.style.top = `${this.positionY}px`;
    }

    isCaught(basket) {
        return this.positionY >= 560 && this.positionX >= basket.positionX && this.positionX <= basket.positionX + basket.width;
    }

    isMissed() {
        return this.positionY >= 600;
    }

    increaseSpeed() {
        this.fallingSpeed += 1;
    }
}

class Basket {
    constructor(element) {
        this.element = element;
        this.width = 80;
        this.positionX = 360;
        this.moveSpeed = 20;
        this.isDragging = false;
        this.offsetX = 0;
        this.updatePosition();
        this.addDragEvents(); 
        this.pendingUpdate = false;
    }

    moveLeft() {
        if (this.positionX > 0) {
            this.positionX -= this.moveSpeed;
            this.updatePosition();
        }
    }
    addDragEvents() {
        this.element.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.offsetX = e.clientX - this.element.getBoundingClientRect().left;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && !this.pendingUpdate) {
                this.pendingUpdate = true;

                requestAnimationFrame(() => {
                    console.log("e.clientX >>>", e.clientX)
                    console.log("this.offsetX >>>", this.offsetX)
                    this.positionX = e.clientX - this.offsetX - 360;

                    if (this.positionX < 0) this.positionX = 0;
                    if (this.positionX > 720) this.positionX = 720; 

                    this.updatePosition();
                    this.pendingUpdate = false;
                });
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }
    moveRight() {
        if (this.positionX < 720) {
            this.positionX += this.moveSpeed;
            this.updatePosition();
        }
    }

    updatePosition() {
        this.element.style.left = `${this.positionX}px`;
    }

    moveToEgg(eggPositionX) {
        this.positionX = eggPositionX - this.width / 2; 
        this.updatePosition();
    }
}

class Game {
    constructor() {
        this.basket = new Basket(document.getElementById('basket'));
        this.egg = new Egg(document.getElementById('egg'), 800);
        this.scoreElement = document.getElementById('score');
        this.missesElement = document.getElementById('misses');
        this.missMessage = document.getElementById('missMessage'); 
        this.imgMiss = document.querySelector('.img-miss'); 
        this.score = 0;
        this.misses = 0;
        this.speedIncrementInterval = 5;

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.gameLoop();
    }

    handleKeyPress(e) {
        if (e.key === this.egg.element.textContent) {
            this.basket.moveToEgg(this.egg.positionX); 
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.basket.moveLeft();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.basket.moveRight();
        }
    }

    showMissMessage() {
        this.missMessage.style.display = 'block';
        this.imgMiss.style.display = 'block'; 
        document.body.classList.add('red-background');

        setTimeout(() => {
            this.missMessage.style.display = 'none';
            this.imgMiss.style.display = 'none'; 
            document.body.classList.remove('red-background');
        }, 1000);
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    updateMisses() {
        this.missesElement.textContent = `Misses: ${this.misses}`;
    }

    checkCollision() {
        if (this.egg.isCaught(this.basket)) {
            this.score++; 
            this.updateScore();

            if (this.score % this.speedIncrementInterval === 0) {
                this.egg.increaseSpeed();  
            }

            this.egg.resetPosition(); 
        } else if (this.egg.isMissed()) {
            this.misses++;
            this.updateMisses();
            this.egg.resetPosition();
            this.showMissMessage();
        }
    }

    gameLoop() {
        this.egg.fall();
        this.checkCollision();

        if (this.misses < 5) {
            requestAnimationFrame(this.gameLoop.bind(this));
        } else {
            alert(`Bạn thua rồi!`);
            window.location.reload();
        }
    }
}

const game = new Game();