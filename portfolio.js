window.onload = function(){
    // --------------------돔 구조--------------------
    const MAP = document.getElementById("field"); //전체 맵
    const CHAR = document.getElementById("char"); //캐릭터
    const GOOSE = document.getElementById("goose"); //메인거위
    const TREE = document.querySelector("#object>.trees");
    const controller = document.getElementById("controller");
    const ctrlActive = document.getElementById("active");
    const ctrlTouch = document.querySelector("#controller>.touch")
    // -------------------- 상수 --------------------
    const CHAR_WIDTH = 150; // 캐릭터 너비
    const CHAR_HEIGHT = 200; // 캐릭터 높이
    const MAP_WIDTH = 6000; // 맵 전체 너비
    const MAP_HEIGHT = 5000; // 맵 전체 높이
    const CHAR_MOVE_SPEED = 150; //max(300) 
    const CHAR_MOVE_PX = 4; //(CHAR_MOVE_PX * CHAR_MOVE_SPEED px/s)
    const CHAR_CROSS_PX = CHAR_MOVE_PX / Math.sqrt(2); //대각선 이동 속도
    const GOOSE_MOVE_SPEED = 300; //max(300) 
    const GOOSE_MOVE_PX = 3;
    const MAP_RATIO = 0.8; // 맵 비율
    const key = keyfuncs();
    const move = movefuncs();
    const goose = gooseFunc();
    const touch = touchFunc();
    // -------------------- 변수 --------------------
    let isMobile = false //모바일 확인
    let screenWidth = window.innerWidth; // 스크린 너비
    let screenHeight = window.innerHeight; // 스크린 높이
    let focusX = screenWidth / 2 - CHAR.offsetLeft - (CHAR_WIDTH / 2); // 초점 X값(음수)
    let focusY = screenHeight / 2 - CHAR.offsetTop - (CHAR_HEIGHT / 2); //초점 Y값(음수)
    
    // --------------------제한구역 이미지 설정--------------------
    let limitImg = document.getElementById('limit_img');
    let limitCanvas = document.createElement("canvas");
    limitCanvas.width = limitImg.width;
    limitCanvas.height = limitImg.height;
    limitCanvas.getContext('2d').drawImage(limitImg,0,0,limitImg.width,limitImg.height);

    // --------------------로딩중...--------------------
    function loading(){
        let ratioW = screenWidth / MAP_WIDTH
        for(let i = 0; i < 43; i++){ // 나무 생성
            let tree = document.createElement("ul");
            for(let j = 0; j < 3; j++){
                let fruits = document.createElement("li");
                tree.appendChild(fruits);
            }
            tree.setAttribute("class","tree");
            switch (Math.floor(Math.random()*6)) { // 과일 랜덤 생성
                case 0:
                    tree.classList.add("apple");
                    break;
                case 1:
                    tree.classList.add("blueberry");
                    break;
                case 2:
                    tree.classList.add("lemon");
                    break;
                case 3:
                    tree.classList.add("orange");
                    break;
                case 4:
                    tree.classList.add("peach");
                    break;
                default: // 그냥 나무
                    break;
            } 
            TREE.appendChild(tree);
        }
        const mapImg = document.createElement("img"); // 메인 배경
        mapImg.setAttribute("src", "./img/map.png");
        mapImg.setAttribute("alt", "배경 이미지");
        mapImg.setAttribute("id", "mapImg");
        MAP.appendChild(mapImg);
        // MAP.style.transformOrigin = -focusX + "px " + -focusY + "px";
        mapImg.onload = function(){ // --------------------------------------------------------------로딩완료
            MAP.style.animation = "load"+parseInt((ratioW) * 100 + 1)+"Ani 5s ease";
            document.getElementById("beforeLoad").classList.add("load");
            let aniTime = setTimeout(function(){
                MAP.style.transition = "2s";
                screenFocus();
            },3000)
            let loadTime = setTimeout(function(){
                afterLoad(); //로딩이 끝난 뒤 호출할 함수
                MAP.style.transition = "none";
                clearTimeout(aniTime);
                clearTimeout(loadTime);
            },5000);
        }
    }
    loading();
    function afterLoad(){ //-----------------------------------------------------------로딩 완료까지 호출 x
        document.addEventListener("keydown",function(e){ // 키가 눌려있는 중에는 setTimeOut 호출 X
            key.presskey(e.key);
            (key.flag()) ? false : key.setKeyTimer(keyDown,0);
        });
        document.addEventListener("keyup",function(e){ // 키가 떨어지면 루프 종료
            key.removeKey(e.key);
            if(!key.keyCode()) {
                CHAR.setAttribute("class","_"+CHAR.getAttribute("class"));
                key.clearKeyTimer();
                key.flagFalse();
                let btnOns = document.getElementsByClassName("btnOn");
                while(btnOns.length){ btnOns[0].classList.remove("btnOn"); }
            }
        });
        
        controller.addEventListener("touchstart",function(e){
            e.preventDefault();
            if(e.target == ctrlActive){
                console.log(e.target);
            }
            else if(!touch.getFlag()){
                touch.setFlag(true);
                ctrlTouch.classList.add("on");
                ctrlTouch.style.left = e.targetTouches[0].clientX - 15 + "px";
                ctrlTouch.style.top = e.targetTouches[0].clientY - 15 + "px";
                touch.setTouch(e.targetTouches[0].clientX,e.targetTouches[0].clientY,e.targetTouches[0].identifier);
            }
        },false);
        controller.addEventListener("touchmove",function(e){
            let {x,y,id} = touch.getTouch();
            if(e.targetTouches[0].identifier === id){
                let _x = e.targetTouches[0].clientX - x;
                let _y = e.targetTouches[0].clientY - y;
                let dir = {x : Math.cos(Math.atan2(_y,_x)), y : Math.sin(Math.atan2(_y,_x)), deg : Math.atan2(_y,_x) * 180 / Math.PI};
                touch.stop();
                touch.move(dir);
            }
        });
        controller.addEventListener("touchend",function(e){
            e.preventDefault();
            if(e.touches.length === 0){
                ctrlTouch.children[0].style.left = 0;
                ctrlTouch.children[0].style.top = 0;
                CHAR.setAttribute("class","_"+CHAR.getAttribute("class"));
                touch.stop();
                touch.setFlag(false);
                touch.setTouch(0,0,null);
                ctrlTouch.classList.remove("on");
            } else if(e.touches[0].identifier !== id){
                ctrlTouch.children[0].style.left = 0;
                ctrlTouch.children[0].style.top = 0;
                CHAR.setAttribute("class","_"+CHAR.getAttribute("class"));
                touch.stop();
                touch.setFlag(false);
                touch.setTouch(0,0,null);
                ctrlTouch.classList.remove("on");
            }
        },false);
        controller.addEventListener("touchcancel",function(e){
            e.preventDefault();
            if(e.touches.length === 0){
                ctrlTouch.children[0].style.left = 0;
                ctrlTouch.children[0].style.top = 0;
                CHAR.setAttribute("class","_"+CHAR.getAttribute("class"));
                touch.stop();
                touch.setFlag(false);
                touch.setTouch(0,0,null);
                ctrlTouch.classList.remove("on");
            } else if(e.touches[0].identifier !== id){
                ctrlTouch.children[0].style.left = 0;
                ctrlTouch.children[0].style.top = 0;
                CHAR.setAttribute("class","_"+CHAR.getAttribute("class"));
                touch.stop();
                touch.setFlag(false);
                touch.setTouch(0,0,null);
                ctrlTouch.classList.remove("on");
            }
        },false);
    }


    // -------------------- 각종 함수 --------------------
    let mobileDivice = [ // 모바일 기기 종류
        'iphone', 'ipod',
        'window ce', 'android',
        'blackberry', 'nokia',
        'webos', 'opera mini',
        'sonyerricsson', 'opera mobi',
        'iemobile'
    ];
    for (let i in mobileDivice) { // 모바일 기기 확인
        if (navigator.userAgent.toLowerCase().match(new RegExp(mobileDivice[i]))) {
            isMobile = true;
            document.querySelector("body").classList.add("mob");
        }
    }

    function isEntryPossible(x,y){ // 이동 가능구역인지 확인
        if(x > CHAR_WIDTH / 2 && x < MAP_WIDTH - CHAR_WIDTH / 2 && y > CHAR_HEIGHT && y < MAP_HEIGHT){

            return !(limitCanvas.getContext('2d').getImageData(x,y,1,1).data[3])
        }else return false
    }
    window.addEventListener("resize", function(){ // 창 크기 변경시 
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
        screenFocus();
    });
    function keyfuncs(){ // 키보드 관련 클로져
        let moveX = 0;
        let moveY = 0;
        let active = false;
        let keyFlag = false;
        let keyTimer = null;
        return {
            presskey : function(key){
                switch (key.toLowerCase()) {
                    case " ":
                        active = true
                        break;
                    case "arrowup":
                        moveY = -1;
                        break;
                    case "arrowleft":
                        moveX = -1;
                        break;
                    case "arrowdown":
                        moveY = 1;
                        break;
                    case "arrowright":
                        moveX = 1;
                        break;
                    case "w":
                        moveY = -1;
                        break;
                    case "a":
                        moveX = -1;
                        break;
                    case "s":
                        moveY = 1;
                        break;
                    case "d":
                        moveX = 1;
                        break;
                    default:
                        return false;
                }
            },
            removeKey : function(key){
                switch (key.toLowerCase()) {
                    case " ":
                        active = false
                        break;
                    case "arrowup":
                        moveY = moveY == -1 ? 0 : 1;
                        break;
                    case "arrowleft":
                        moveX = moveX == -1 ? 0 : 1;
                        break;
                    case "arrowdown":
                        moveY = moveY == 1 ? 0 : -1;
                        break;
                    case "arrowright":
                        moveX = moveX == 1 ? 0 : -1;
                        break;
                    case "w":
                        moveY = moveY == -1 ? 0 : 1;
                        break;
                    case "a":
                        moveX = moveX == -1 ? 0 : 1;
                        break;
                    case "s":
                        moveY = moveY == 1 ? 0 : -1;
                        break;
                    case "d":
                        moveX = moveX == 1 ? 0 : -1;
                        break;
                    default:
                        return false;
                }
            },
            keyCode : function(){
                    if(moveX === 0){ // down : up : 0
                        return moveY > 0 ? 3 : moveY < 0 ? 1 : 0;
                    } else if(moveX < 0){ //left
                        return moveY > 0 ? 7 : moveY < 0 ? 5 : 2;
                    } else{ //right
                        return moveY > 0 ? 8 : moveY < 0 ? 6 : 4;
                    }
                /*  up => 1             down => 3
                    left => 2           right => 4
                    left up => 5        right up => 6
                    left down => 7      right down => 8    */
            },
            length : function(){return moveKeyCodes.length},
            active : function(){return active},
            flag : function(){return keyFlag},
            flagFalse : function(){keyFlag = false; 
                return keyFlag},
            flagTrue : function(){keyFlag = true; 
                return keyFlag},
            setKeyTimer: function(func,time){
                keyTimer = setTimeout(func,time);
            },
            clearKeyTimer: function(){
                clearTimeout(keyTimer);
            }
        }
    }
    function movefuncs(){ // 움직임 관련 클로져
        let moveX = CHAR.offsetLeft;
        let moveY = CHAR.offsetTop;
        return{
            moveTo : function(x,y){ // x,y만큼 이동
                let isBlock = true;
                let count = 0;
                if(x&&isEntryPossible(moveX + CHAR_WIDTH / 2 + x,moveY +  CHAR_HEIGHT)){
                    moveX += x;
                    CHAR.style.left = moveX + "px";
                    isBlock = false;
                }
                if(y&&isEntryPossible(moveX + CHAR_WIDTH / 2,moveY +  CHAR_HEIGHT + y)){
                    moveY += y;
                    CHAR.style.top = moveY + "px";
                    CHAR.style.zIndex = parseInt(moveY + CHAR_HEIGHT / 3);
                    isBlock = false;
                }
                while (isBlock && count < 5) { // 막힐 때 부드러운 움직임
                    count += 2;
                    isBlock = this.moveSmooth(x,y,count);
                } 
                screenFocus();
                goose.sensor(moveX,moveY); //거위센서 온
            },
            moveSmooth : function(x,y,count){ // 방해물에 막혔을 때 
                let dir = [];
                if(x === 0){
                    dir.push(isEntryPossible(moveX + CHAR_WIDTH / 2 - CHAR_CROSS_PX * count,moveY +  CHAR_HEIGHT + y));
                    dir.push(isEntryPossible(moveX + CHAR_WIDTH / 2 + CHAR_CROSS_PX * count,moveY +  CHAR_HEIGHT + y));
                    if(dir[0]^dir[1]){
                        x = dir[0] ? -CHAR_CROSS_PX : CHAR_CROSS_PX;
                        y = y > 0 ? CHAR_CROSS_PX : -CHAR_CROSS_PX;
                        this.moveTo(x,y);
                        return false;
                    }
                } else if(y === 0){
                    dir.push(isEntryPossible(moveX + CHAR_WIDTH / 2 + x, moveY +  CHAR_HEIGHT - CHAR_CROSS_PX * count));
                    dir.push(isEntryPossible(moveX + CHAR_WIDTH / 2 + x, moveY +  CHAR_HEIGHT + CHAR_CROSS_PX * count));
                    if(dir[0]^dir[1]){
                        y = dir[0] ? -CHAR_CROSS_PX : CHAR_CROSS_PX;
                        x = x > 0 ? CHAR_CROSS_PX : -CHAR_CROSS_PX;
                        this.moveTo(x,y)
                        return false;
                    }
                } else{
                    dir.push(isEntryPossible(moveX + CHAR_WIDTH / 2 - x * count, moveY + CHAR_HEIGHT + y * count));
                    dir.push(isEntryPossible(moveX + CHAR_WIDTH / 2 + x * count, moveY + CHAR_HEIGHT - y * count));
                    if(dir[0]^dir[1]){
                        if(dir[0]){
                            this.moveTo(-x,y);
                            return false;
                        } else{
                            this.moveTo(x,-y);
                            return false;
                        }
                    }
                } return true;
            }
        }
    }
    function gooseFunc(){ // 거위 동작 클로져
        const senserLength = 300;
        let goosePosX = GOOSE.offsetLeft;
        let goosePosY = GOOSE.offsetTop;
        let gooseBox = [goosePosX - senserLength,goosePosX + senserLength, goosePosY - senserLength, goosePosY + senserLength];
        let gooseLevel = 1;
        let isMoving = false;
        return{
            moveTo : function(x,y){ // 좌표로 이동
                isMoving = true;
                goosePosX = GOOSE.offsetLeft;
                goosePosY = GOOSE.offsetTop;
                let speedX = Math.cos(Math.atan2((y - goosePosY),(x - goosePosX)))*GOOSE_MOVE_PX;
                let speedY = Math.sin(Math.atan2((y - goosePosY),(x - goosePosX)))*GOOSE_MOVE_PX;
                let moveTimes = (x - goosePosX)/speedX;
                let deg = Math.atan2((y - goosePosY),(x - goosePosX))*180 / Math.PI;
                let count = 0;
                let timer = setTimeout(movement, 0);
                if(deg + 180 >= 45 && deg + 180 < 135){
                    GOOSE.setAttribute("class","back");
                } else if(deg + 180 >= 135 && deg + 180 < 225){
                    GOOSE.setAttribute("class","right");
                } else if(deg + 180 >= 225 && deg + 180 < 315){
                    GOOSE.setAttribute("class","front");
                } else {
                    GOOSE.setAttribute("class","left");
                }
                function movement(){
                    goosePosX = GOOSE.offsetLeft;
                    goosePosY = GOOSE.offsetTop;
                    speedX = Math.cos(Math.atan2((y - goosePosY),(x - goosePosX)))*GOOSE_MOVE_PX;
                    speedY = Math.sin(Math.atan2((y - goosePosY),(x - goosePosX)))*GOOSE_MOVE_PX;
                    count++
                    GOOSE.style.left = (speedX + GOOSE.offsetLeft)+ "px";
                    GOOSE.style.top = (speedY + GOOSE.offsetTop) + "px";
                    GOOSE.style.zIndex = parseInt(y);
                    if(count < Math.ceil(moveTimes)){timer = setTimeout(movement, 1000 / GOOSE_MOVE_SPEED);}
                    else{
                        isMoving = false;
                        clearTimeout(timer);
                        GOOSE.setAttribute("class", "_"+GOOSE.getAttribute("class"));
                        console.log(GOOSE.offsetLeft,GOOSE.offsetTop);
                    };
                }
            },
            sensor : function(x,y){ // 거위근처로 갔나?
                goosePosX = GOOSE.offsetLeft;
                goosePosY = GOOSE.offsetTop;
                gooseBox = [goosePosX - senserLength,goosePosX + senserLength, goosePosY - senserLength, goosePosY + senserLength];
                if(isMoving){return false;}
                if( gooseBox[0] < x && gooseBox[1] > x && gooseBox[2] < y && gooseBox[3] > y){
                    this.level();
                    return true;
                } else return false;
            },
            level : function(){ // 거위 근처로 가면 순서대로 작동
                let moveTime = null;
                switch (gooseLevel){
                    case  1 :
                        this.moveTo(1250,1300);
                        break;
                    case  2 :
                        this.moveTo(1250,2000);
                        break;
                    case  3 :
                        this.moveTo(500,2500);
                        break;
                    case  4 :
                        this.moveTo(500,3500);
                        break;
                    case  5 :
                        this .moveTo(1100,4500);
                        break;
                    case  6 :
                        this.moveTo(2900,4450);
                        break;
                    case  7 :
                        this.moveTo(4500,4600);
                        break;
                    case  8 :
                        this.moveTo(5000,4000);
                        break;
                    case  9 :
                        this.moveTo(5000,3000);
                        break;
                    case  10 :
                        this.moveTo(5700,2700);
                        break;
                    case  11 :
                        this.moveTo(5300,1900);
                        break;
                    case  12 :
                        this.moveTo(4500,1500);
                        break;
                    case  13 :
                        this.moveTo(3800,1200);
                        break;
                    case  14 :
                        this.moveTo(5000,500);
                        break;
                    default : break;
                }
                gooseLevel++;
            },
        }
    }
    function keyDown(){ // 키가 눌리면 setTimeOut 루프 시작
        key.flagTrue();
        let btnOns = document.getElementsByClassName("btnOn");
        while(btnOns.length){ btnOns[0].classList.remove("btnOn"); }
        switch (key.keyCode()) {
            case 1: //up
                move.moveTo(0,-CHAR_MOVE_PX);
                break;
            case 2: //left
                move.moveTo(-CHAR_MOVE_PX,0);
                break;
            case 3: //down
                move.moveTo(0,CHAR_MOVE_PX);
                break;
            case 4: //right
                move.moveTo(CHAR_MOVE_PX,0);
                break;
            case 5: //left up
                move.moveTo(-CHAR_CROSS_PX,-CHAR_CROSS_PX);
                break;
            case 6: //right up
                move.moveTo(CHAR_CROSS_PX,-CHAR_CROSS_PX);
                break;
            case 7: //left down
                move.moveTo(-CHAR_CROSS_PX,CHAR_CROSS_PX);
                break;
            case 8: //right down
                move.moveTo(CHAR_CROSS_PX,CHAR_CROSS_PX);
                break;
            case 0:
                return false;
        }
        function setDir(key){
            CHAR.setAttribute("class","");
            CHAR.classList.add("_"+key);
        }
        setDir(key.keyCode());
        key.setKeyTimer(keyDown,1000/CHAR_MOVE_SPEED);
    }
    function touchFunc(){ //터치관련 클로저
        let touchId = null;
        let x = 0;
        let y = 0;
        let touchStart = false;
        let moveTimeout = null;
        return{
            setFlag : function(set){touchStart = set;},
            getFlag : function(){return touchStart},
            setTouch : function(_x,_y,id){x = _x; y = _y; touchId = id;},
            getTouch : function(){return {x: x, y: y, id : touchId}},
            move : function({x,y,deg}){
                moveTimeout = setTimeout(repeatMove,0)
                function repeatMove(){
                    move.moveTo(x*CHAR_MOVE_PX,y*CHAR_MOVE_PX);
                    ctrlTouch.children[0].style.left = x*20 + "px";
                    ctrlTouch.children[0].style.top = y*20 + "px";
                    moveTimeout = setTimeout(repeatMove,1000 / CHAR_MOVE_SPEED);
                    if(deg + 180 >= 45 && deg + 180 < 135){
                        CHAR.setAttribute("class","_1");
                    } else if(deg + 180 >= 135 && deg + 180 < 225){
                        CHAR.setAttribute("class","_4");
                    } else if(deg + 180 >= 225 && deg + 180 < 315){
                        CHAR.setAttribute("class","_3");
                    } else {
                        CHAR.setAttribute("class","_2");
                    }
                }
            },
            stop : function(){
                clearTimeout(moveTimeout);
            }
        }
    }
    function screenFocus(){ // 캐릭터에 초점을 맞춰 이동(맵 끝으로 가면 고정)
        focusX = screenWidth / 2 - CHAR.offsetLeft * MAP_RATIO - (CHAR_WIDTH / 2);
        focusY = screenHeight / 2 - CHAR.offsetTop * MAP_RATIO - (CHAR_HEIGHT / 2);
        focusX = focusX >= 0 ? 0 : focusX <= screenWidth - MAP_WIDTH * MAP_RATIO ? MAP.offsetLeft : focusX;
        focusY = focusY >= 0 ? 0 : focusY <= screenHeight - MAP_HEIGHT * MAP_RATIO ? MAP.offsetTop : focusY;
        MAP.style.left = focusX  + "px";
        MAP.style.top = focusY + "px";
    }
}