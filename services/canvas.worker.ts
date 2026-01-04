let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let reticleRotation = 0;

// Render State
let currentHands: any = { leftHand: null, rightHand: null };
let isModalOpen = false;

// Loop Control
let isRunning = false;
let lastDrawTime = 0;
const FPS_LIMIT = 30;
const FRAME_INTERVAL = 1000 / FPS_LIMIT;

const render = (timestamp: number) => {
    if (!isRunning) return;
    
    const elapsed = timestamp - lastDrawTime;
    if (elapsed < FRAME_INTERVAL) {
        requestAnimationFrame(render);
        return;
    }
    
    lastDrawTime = timestamp - (elapsed % FRAME_INTERVAL);

    if (canvas && ctx) {
        if (canvas.width !== 0 && canvas.height !== 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const hands = currentHands;
            reticleRotation += 0.05;

            // --- HAND RENDERING ---
            [hands.leftHand, hands.rightHand].forEach((hand: any) => {
                if (hand) {
                  const isRight = hand.handedness === 'Right';
                  const mainColor = isRight ? '#00F0FF' : '#00A3FF';
                  
                  // Skeleton
                  ctx!.strokeStyle = mainColor;
                  ctx!.lineWidth = 1.5;
                  ctx!.setLineDash([5, 5]);
                  ctx!.beginPath();
                  
                  const connections = [[0,1],[1,2],[2,3],[3,4], [0,5],[5,6],[6,7],[7,8], [5,9],[9,10],[10,11],[11,12], [9,13],[13,14],[14,15],[15,16], [13,17],[17,18],[18,19],[19,20], [0,17]];
                  
                  connections.forEach(([start, end]) => {
                    const p1 = hand.landmarks[start];
                    const p2 = hand.landmarks[end];
                    ctx!.moveTo((1 - p1.x) * canvas!.width, p1.y * canvas!.height);
                    ctx!.lineTo((1 - p2.x) * canvas!.width, p2.y * canvas!.height);
                  });
                  ctx!.stroke();
                  ctx!.setLineDash([]);
        
                  // Joints
                  hand.landmarks.forEach((lm: any, index: number) => {
                    const x = (1 - lm.x) * canvas!.width;
                    const y = lm.y * canvas!.height;
                    
                    ctx!.fillStyle = 'rgba(0,0,0,0.8)';
                    ctx!.strokeStyle = mainColor;
                    ctx!.lineWidth = 1;
                    
                    ctx!.beginPath();
                    ctx!.arc(x, y, 3, 0, Math.PI * 2);
                    ctx!.fill();
                    ctx!.stroke();
                    
                    if ([4, 8, 12, 16, 20].includes(index)) {
                        ctx!.beginPath();
                        ctx!.arc(x, y, 8, reticleRotation, reticleRotation + Math.PI);
                        ctx!.strokeStyle = isRight ? '#FF2A2A' : '#00F0FF';
                        ctx!.stroke();
                    }
                  });
                  
                  // Palm Info
                  const palmX = (1 - hand.landmarks[0].x) * canvas!.width;
                  const palmY = hand.landmarks[0].y * canvas!.height;
                  
                  ctx!.beginPath();
                  ctx!.arc(palmX, palmY, 20, -reticleRotation, -reticleRotation + Math.PI * 1.5);
                  ctx!.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                  ctx!.stroke();
                  
                  ctx!.font = '10px Rajdhani';
                  ctx!.fillStyle = mainColor;
                  const label = isRight ? 'ID: 右手-01' : 'ID: 左手-02';
                  ctx!.fillText(label, palmX + 25, palmY);
                }
            });
        }
    }

    requestAnimationFrame(render);
};

self.onmessage = (e) => {
    const { type, payload } = e.data;

    if (type === 'init') {
        canvas = payload.canvas;
        if (canvas) {
            ctx = canvas.getContext('2d');
            isRunning = true;
            requestAnimationFrame(render);
        }
    } else if (type === 'update') {
        currentHands = payload.hands;
        isModalOpen = payload.isModalOpen;
    } else if (type === 'resize') {
        if (canvas) {
            canvas.width = payload.width;
            canvas.height = payload.height;
        }
    }
};
