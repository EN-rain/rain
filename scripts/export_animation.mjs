globalThis.self = globalThis;
globalThis.window = globalThis;
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import fs from 'fs';

const rokokoVRMRigMap = {
  Hips: 'hips',
  Spine1: 'spine',
  Spine2: 'chest',
  Spine3: 'upperChest',
  Neck: 'neck',
  Head: 'head',
  LeftShoulder: 'leftShoulder',
  LeftArm: 'leftUpperArm',
  LeftForeArm: 'leftLowerArm',
  LeftHand: 'leftHand',
  RightShoulder: 'rightShoulder',
  RightArm: 'rightUpperArm',
  RightForeArm: 'rightLowerArm',
  RightHand: 'rightHand',
  LeftThigh: 'leftUpperLeg',
  LeftShin: 'leftLowerLeg',
  LeftFoot: 'leftFoot',
  LeftToe: 'leftToes',
  RightThigh: 'rightUpperLeg',
  RightShin: 'rightLowerLeg',
  RightFoot: 'rightFoot',
  RightToe: 'rightToes',
  LeftFinger1Metacarpal: 'leftThumbMetacarpal',
  LeftFinger1Proximal: 'leftThumbProximal',
  LeftFinger1Distal: 'leftThumbDistal',
  LeftFinger2Proximal: 'leftIndexProximal',
  LeftFinger2Medial: 'leftIndexIntermediate',
  LeftFinger2Distal: 'leftIndexDistal',
  LeftFinger3Proximal: 'leftMiddleProximal',
  LeftFinger3Medial: 'leftMiddleIntermediate',
  LeftFinger3Distal: 'leftMiddleDistal',
  LeftFinger4Proximal: 'leftRingProximal',
  LeftFinger4Medial: 'leftRingIntermediate',
  LeftFinger4Distal: 'leftRingDistal',
  LeftFinger5Proximal: 'leftLittleProximal',
  LeftFinger5Medial: 'leftLittleIntermediate',
  LeftFinger5Distal: 'leftLittleDistal',
  RightFinger1Metacarpal: 'rightThumbMetacarpal',
  RightFinger1Proximal: 'rightThumbProximal',
  RightFinger1Distal: 'rightThumbDistal',
  RightFinger2Proximal: 'rightIndexProximal',
  RightFinger2Medial: 'rightIndexIntermediate',
  RightFinger2Distal: 'rightIndexDistal',
  RightFinger3Proximal: 'rightMiddleProximal',
  RightFinger3Medial: 'rightMiddleIntermediate',
  RightFinger3Distal: 'rightMiddleDistal',
  RightFinger4Proximal: 'rightRingProximal',
  RightFinger4Medial: 'rightRingIntermediate',
  RightFinger4Distal: 'rightRingDistal',
  RightFinger5Proximal: 'rightLittleProximal',
  RightFinger5Medial: 'rightLittleIntermediate',
  RightFinger5Distal: 'rightLittleDistal',
};

const vrmBuf = fs.readFileSync('public/models/Yumeka_Current.vrm');
const vrmAb = vrmBuf.buffer.slice(vrmBuf.byteOffset, vrmBuf.byteOffset + vrmBuf.byteLength);

const gltfLoader = new GLTFLoader();
gltfLoader.register(p => new VRMLoaderPlugin(p));

gltfLoader.parse(vrmAb, '', (gltf) => {
  const vrm = gltf.userData.vrm;
  VRMUtils.rotateVRM0(vrm);
  
  const fbxPath = 'C:/Users/LENOVO/AppData/LocalLow/Rokoko Electronics/Rokoko Studio/Exports/vidw23.fbx';
  const fbxBuf = fs.readFileSync(fbxPath);
  const fbxAb = fbxBuf.buffer.slice(fbxBuf.byteOffset, fbxBuf.byteOffset + fbxBuf.byteLength);
  
  const fbxLoader = new FBXLoader();
  const asset = fbxLoader.parse(fbxAb, '');
  const clip = asset.animations[0];
  
  const tracks = [];
  const restRotationInverse = new THREE.Quaternion();
  const parentRestWorldRotation = new THREE.Quaternion();
  const _quatA = new THREE.Quaternion();
  
  const motionHipsNode = asset.getObjectByName('Hips');
  const motionHipsHeight = motionHipsNode ? motionHipsNode.position.y : 94;
  const vrmHipsHeight = vrm.humanoid?.normalizedRestPose?.hips?.position?.[1] || 0.756;
  const hipsPositionScale = vrmHipsHeight / motionHipsHeight;
  
  clip.tracks.forEach((track) => {
    const trackSplitted = track.name.split('.');
    const rokokoRigName = trackSplitted[0];
    const propertyName = trackSplitted[1];
    
    // Skip all scale tracks completely
    if (propertyName === 'scale') return;
    
    const vrmBoneName = rokokoVRMRigMap[rokokoRigName];
    const vrmNode = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName);
    const vrmNodeName = vrmNode?.name;
    const rokokoRigNode = asset.getObjectByName(rokokoRigName);
    
    if (vrmNodeName && rokokoRigNode) {
      rokokoRigNode.getWorldQuaternion(restRotationInverse).invert();
      if (rokokoRigNode.parent) {
        rokokoRigNode.parent.getWorldQuaternion(parentRestWorldRotation);
      } else {
        parentRestWorldRotation.identity();
      }
      
      if (track instanceof THREE.QuaternionKeyframeTrack && propertyName === 'quaternion') {
        const values = new Float32Array(track.values.length);
        for (let i = 0; i < track.values.length; i += 4) {
          _quatA.fromArray(track.values, i);
          _quatA.premultiply(parentRestWorldRotation).multiply(restRotationInverse);
          _quatA.toArray(values, i);
          if (vrm.meta?.metaVersion === '0') {
            values[i] = -values[i];
            values[i + 2] = -values[i + 2];
          }
        }
        tracks.push(new THREE.QuaternionKeyframeTrack(vrmNodeName + '.' + propertyName, track.times, Array.from(values)));
      } else if (track instanceof THREE.VectorKeyframeTrack && propertyName === 'position' && vrmBoneName === 'hips') {
        const values = new Float32Array(track.values.length);
        for (let i = 0; i < track.values.length; i += 3) {
          const vx = (vrm.meta?.metaVersion === '0' ? -track.values[i] : track.values[i]) * hipsPositionScale;
          const vy = track.values[i + 1] * hipsPositionScale;
          const vz = (vrm.meta?.metaVersion === '0' ? -track.values[i + 2] : track.values[i + 2]) * hipsPositionScale;
          values[i] = vx;
          values[i + 1] = vy;
          values[i + 2] = vz;
        }
        tracks.push(new THREE.VectorKeyframeTrack(vrmNodeName + '.' + propertyName, track.times, Array.from(values)));
      }
    }
  });
  
  const vrmClip = new THREE.AnimationClip('rokokoClip', clip.duration, tracks);
  console.log('Converted tracks count:', vrmClip.tracks.length);
  
  // Export clip to JSON
  const clipJson = vrmClip.toJSON();
  fs.writeFileSync('public/models/intro_char_animation.json', JSON.stringify(clipJson));
  console.log('Saved to public/models/intro_char_animation.json. File size:', (fs.statSync('public/models/intro_char_animation.json').size / 1024).toFixed(1), 'KB');
});
