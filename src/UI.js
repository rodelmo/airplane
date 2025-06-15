export class UI {
    constructor() {
        this.createUI();
    }

    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.bottom = '20px';
        this.container.style.left = '20px';
        this.container.style.color = 'white';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.textShadow = '1px 1px 2px black';
        document.body.appendChild(this.container);

        // Create controls reference
        this.controlsRef = document.createElement('div');
        this.controlsRef.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Controls:</strong><br>
                W/S: Pitch<br>
                A/D: Roll<br>
                Q/E: Speed<br>
                C: Toggle Camera
            </div>
        `;
        this.container.appendChild(this.controlsRef);

        // Create speed indicator
        this.speedIndicator = document.createElement('div');
        this.speedIndicator.style.marginTop = '10px';
        this.container.appendChild(this.speedIndicator);
    }

    updateSpeed(speed, minSpeed, maxSpeed) {
        const speedPercent = (speed - minSpeed) / (maxSpeed - minSpeed);
        const color = this.getSpeedColor(speedPercent);
        
        this.speedIndicator.innerHTML = `
            <div style="
                background: rgba(0, 0, 0, 0.5);
                padding: 5px 10px;
                border-radius: 5px;
                border: 1px solid ${color};
            ">
                <strong>Speed:</strong> ${Math.round(speed)} units
                <div style="
                    width: 100px;
                    height: 5px;
                    background: #333;
                    margin-top: 5px;
                    border-radius: 2px;
                ">
                    <div style="
                        width: ${speedPercent * 100}%;
                        height: 100%;
                        background: ${color};
                        border-radius: 2px;
                        transition: all 0.2s;
                    "></div>
                </div>
            </div>
        `;
    }

    getSpeedColor(speedPercent) {
        if (speedPercent < 0.3) return '#ff4444';  // Red for slow
        if (speedPercent < 0.7) return '#44ff44';  // Green for normal
        return '#4444ff';  // Blue for fast
    }
} 