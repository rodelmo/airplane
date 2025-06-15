import * as THREE from 'three';

export class CameraController {
    constructor(camera, plane) {
        this.camera = camera;
        this.plane = plane;
        this.mode = 'follow'; // 'follow' or 'orbit'
        
        // Follow camera parameters
        this.followOffset = new THREE.Vector3(0, 3, -8);
        this.followLerpFactor = 0.1;
        
        // Orbit camera parameters
        this.orbitDistance = 15;
        this.orbitHeight = 5;
        this.orbitAngle = 0;
        this.orbitSpeed = 0.5;
        
        // Camera state
        this.targetPosition = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
    }

    update(deltaTime) {
        if (this.mode === 'follow') {
            this.updateFollowCamera();
        } else {
            this.updateOrbitCamera(deltaTime);
        }
    }

    updateFollowCamera() {
        // Calculate target position behind and above the plane
        this.targetPosition.copy(this.followOffset);
        this.targetPosition.applyQuaternion(this.plane.quaternion);
        this.targetPosition.add(this.plane.position);

        // Smoothly move camera to target position
        this.camera.position.lerp(this.targetPosition, this.followLerpFactor);

        // Calculate look-at point slightly ahead of the plane
        this.targetLookAt.copy(this.plane.position);
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.plane.quaternion);
        forward.multiplyScalar(5);
        this.targetLookAt.add(forward);

        // Smoothly update camera look-at
        const currentLookAt = new THREE.Vector3();
        this.camera.getWorldDirection(currentLookAt);
        currentLookAt.multiplyScalar(5).add(this.camera.position);
        currentLookAt.lerp(this.targetLookAt, this.followLerpFactor);
        this.camera.lookAt(currentLookAt);
    }

    updateOrbitCamera(deltaTime) {
        // Update orbit angle
        this.orbitAngle += this.orbitSpeed * deltaTime;

        // Calculate camera position
        this.camera.position.x = Math.cos(this.orbitAngle) * this.orbitDistance;
        this.camera.position.z = Math.sin(this.orbitAngle) * this.orbitDistance;
        this.camera.position.y = this.orbitHeight;

        // Look at the plane
        this.camera.lookAt(this.plane.position);
    }

    toggleMode() {
        this.mode = this.mode === 'follow' ? 'orbit' : 'follow';
    }
} 