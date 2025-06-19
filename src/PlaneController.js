// Use global variable from CDN instead of ES6 import
const THREE = window.THREE;

export class PlaneController {
    constructor(plane) {
        this.plane = plane;
        this.speed = 30; // Initial speed
        this.maxSpeed = 50;
        this.minSpeed = 10;
        this.speedChangeRate = 20; // Units per second

        // Control parameters
        this.pitchSensitivity = 0.8;
        this.rollSensitivity = 2.0;
        this.turnSensitivity = 1.5;
        
        // Control limits
        this.maxPitchAngle = Math.PI / 3; // 60 degrees
        this.maxRollAngle = Math.PI / 4;  // 45 degrees
        
        // Current control values
        this.pitch = 0;
        this.roll = 0;
        this.yaw = 0;
        
        // Auto-centering parameters
        this.autoCenterStrength = 2.0;
        this.autoLevelStrength = 1.5;

        // Input state
        this.input = {
            pitch: 0,
            roll: 0,
            speed: 0
        };
    }

    update(deltaTime) {
        // Handle speed changes
        this.speed = THREE.MathUtils.clamp(
            this.speed + this.input.speed * this.speedChangeRate * deltaTime,
            this.minSpeed,
            this.maxSpeed
        );

        // Calculate pitch with auto-centering
        this.pitch = THREE.MathUtils.clamp(
            this.pitch + this.input.pitch * this.pitchSensitivity * deltaTime,
            -this.maxPitchAngle,
            this.maxPitchAngle
        );
        if (Math.abs(this.input.pitch) < 0.1) {
            this.pitch *= (1 - this.autoCenterStrength * deltaTime);
        }

        // Calculate roll with auto-leveling
        this.roll = THREE.MathUtils.clamp(
            this.roll + this.input.roll * this.rollSensitivity * deltaTime,
            -this.maxRollAngle,
            this.maxRollAngle
        );
        if (Math.abs(this.input.roll) < 0.1) {
            this.roll *= (1 - this.autoLevelStrength * deltaTime);
        }

        // Calculate yaw based on roll (negative coupling)
        this.yaw += -this.roll * this.turnSensitivity * deltaTime;

        // Apply rotations using quaternions
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, this.roll, 'YXZ'));
        this.plane.quaternion.copy(quaternion);

        // Move forward based on current orientation and speed
        const direction = new THREE.Vector3(0, 0, 1); // +Z is forward
        direction.applyQuaternion(this.plane.quaternion);
        this.plane.position.add(direction.multiplyScalar(this.speed * deltaTime));
    }

    setInput(pitch, roll, speed) {
        this.input.pitch = THREE.MathUtils.clamp(pitch, -1, 1);
        this.input.roll = THREE.MathUtils.clamp(roll, -1, 1);
        this.input.speed = THREE.MathUtils.clamp(speed, -1, 1);
    }
} 