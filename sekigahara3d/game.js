document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const sceneCanvas = document.getElementById('scene-canvas');
    const labelsContainer = document.getElementById('labels-container');
    const forwardButton = document.getElementById('forward-button');
    const backwardButton = document.getElementById('backward-button');
    const resetButton = document.getElementById('reset-button');
    const playPauseButton = document.getElementById('play-pause-button');
    const currentTimeSpan = document.getElementById('current-time');
    const eventDescriptionSpan = document.getElementById('event-description');

    // --- データ定義 ---
    const armies = {
        'tokugawa_ieyasu': { id: 'tokugawa_ieyasu', name: '徳川家康', army: 'east', soldiers: 30000 },
        'ii_naomasa': { id: 'ii_naomasa', name: '井伊直政', army: 'east', soldiers: 3600 },
        'fukushima_masanori': { id: 'fukushima_masanori', name: '福島正則', army: 'east', soldiers: 6000 },
        'kuroda_nagamasa': { id: 'kuroda_nagamasa', name: '黒田長政', army: 'east', soldiers: 5400 },
        'hosokawa_tadaoki': { id: 'hosokawa_tadaoki', name: '細川忠興', army: 'east', soldiers: 5000 },
        'honda_tadakatsu': { id: 'honda_tadakatsu', name: '本多忠勝', army: 'east', soldiers: 500 },
        'todo_takatora': { id: 'todo_takatora', name: '藤堂高虎', army: 'east', soldiers: 2500 },
        'ishida_mitsunari': { id: 'ishida_mitsunari', name: '石田三成', army: 'west', soldiers: 6000 },
        'ukita_hideie': { id: 'ukita_hideie', name: '宇喜多秀家', army: 'west', soldiers: 17000 },
        'konishi_yukinaga': { id: 'konishi_yukinaga', name: '小西行長', army: 'west', soldiers: 4000 },
        'shimazu_yoshihiro': { id: 'shimazu_yoshihiro', name: '島津義弘', army: 'west', soldiers: 1500 },
        'otani_yoshitsugu': { id: 'otani_yoshitsugu', name: '大谷吉継', army: 'west', soldiers: 600 },
        'kobayakawa_hideaki': { id: 'kobayakawa_hideaki', name: '小早川秀秋', army: 'west', soldiers: 15000 },
        'mori_hidemoto': { id: 'mori_hidemoto', name: '毛利秀元', army: 'west', soldiers: 16000 },
        'wakisaka_yasuharu': { id: 'wakisaka_yasuharu', name: '脇坂安治', army: 'west', soldiers: 1000 },
    };
    const terrainData = [
        { name: '笹尾山', type: 'mountain', x: 320, y: 20, width: 120, height: 80, elevation: 15 },
        { name: '松尾山', type: 'mountain', x: 680, y: 250, width: 140, height: 100, elevation: 20 },
        { name: '南宮山', type: 'mountain', x: 700, y: 50, width: 110, height: 80, elevation: 10 },
        { name: '天満山', type: 'mountain', x: 350, y: 280, width: 120, height: 80, elevation: 8 },
        { name: '藤川', type: 'river', x: 600, y: 300, width: 30, height: 300, elevation: -2 },
    ];
    const timeline = [
        {
            time: '開戦前', description: '両軍布陣完了。',
            positions: {
                'tokugawa_ieyasu': { x: 350, y: 500, lookAt: {x:350, y:0}, visible: true, army: 'east', soldiers: 30000 },
                'ii_naomasa': { x: 300, y: 380, lookAt: {x:350, y:280}, visible: true, army: 'east', soldiers: 3600 },
                'fukushima_masanori': { x: 250, y: 350, lookAt: {x:350, y:280}, visible: true, army: 'east', soldiers: 6000 },
                'kuroda_nagamasa': { x: 150, y: 320, lookAt: {x:350, y:50}, visible: true, army: 'east', soldiers: 5400 },
                'hosokawa_tadaoki': { x: 100, y: 350, lookAt: {x:350, y:50}, visible: true, army: 'east', soldiers: 5000 },
                'honda_tadakatsu': { x: 400, y: 450, lookAt: {x:350, y:0}, visible: true, army: 'east', soldiers: 500 },
                'todo_takatora': { x: 480, y: 380, lookAt: {x:500, y:350}, visible: true, army: 'east', soldiers: 2500 },
                'ishida_mitsunari': { x: 350, y: 50, lookAt: {x:350, y:600}, visible: true, army: 'west', soldiers: 6000 },
                'ukita_hideie': { x: 350, y: 280, lookAt: {x:350, y:600}, visible: true, army: 'west', soldiers: 17000 },
                'konishi_yukinaga': { x: 450, y: 250, lookAt: {x:350, y:600}, visible: true, army: 'west', soldiers: 4000 },
                'shimazu_yoshihiro': { x: 250, y: 180, lookAt: {x:350, y:600}, visible: true, army: 'west', soldiers: 1500 },
                'otani_yoshitsugu': { x: 500, y: 350, lookAt: {x:480, y:380}, visible: true, army: 'west', soldiers: 600 },
                'kobayakawa_hideaki': { x: 680, y: 250, lookAt: {x:500, y:350}, visible: true, army: 'west', soldiers: 15000 },
                'mori_hidemoto': { x: 700, y: 50, lookAt: {x:350, y:50}, visible: true, army: 'west', soldiers: 16000 },
                'wakisaka_yasuharu': { x: 580, y: 410, lookAt: {x:500, y:350}, visible: true, army: 'west', soldiers: 1000 },
            },
            combats: []
        },
        {
            time: '午前8:00', description: '開戦。井伊・福島隊が宇喜多隊に突撃。',
            positions: { 
                'ii_naomasa': { x: 320, y: 320, lookAt: {x:350, y:280} }, 
                'fukushima_masanori': { x: 280, y: 300, lookAt: {x:350, y:280} }, 
                'ukita_hideie': { soldiers: 16000, lookAt: {x:280, y:300} }
            },
            combats: [['fukushima_masanori', 'ukita_hideie']]
        },
        {
            time: '午前9:00', description: '黒田・細川隊が石田本陣へ進軍。',
            positions: { 
                'kuroda_nagamasa': { x: 250, y: 120, lookAt: {x:350, y:50} }, 
                'hosokawa_tadaoki': { x: 200, y: 150, lookAt: {x:350, y:50} },
                'ishida_mitsunari': { soldiers: 5000, lookAt: {x:200, y:150} }
            },
            combats: [['fukushima_masanori', 'ukita_hideie'], ['kuroda_nagamasa', 'ishida_mitsunari']]
        },
        {
            time: '午前11:00', description: '小西・宇喜多隊が奮戦し、東軍を押し返す。',
            positions: { 
                'fukushima_masanori': { x: 230, y: 360, soldiers: 5500 }, 
                'konishi_yukinaga': { x: 400, y: 300, lookAt: {x:480, y:380} },
                'todo_takatora': { soldiers: 2200 }
            },
            combats: [['fukushima_masanori', 'ukita_hideie'], ['kuroda_nagamasa', 'ishida_mitsunari'], ['konishi_yukinaga', 'todo_takatora']]
        },
        {
            time: '午後0:30', description: '小早川秀秋、裏切り。大谷隊へ攻撃開始。',
            positions: { 
                'kobayakawa_hideaki': { x: 550, y: 350, army: 'betrayal', lookAt: {x:500, y:350} },
                'otani_yoshitsugu': { soldiers: 400, lookAt: {x:680, y:250} }
            },
            combats: [['fukushima_masanori', 'ukita_hideie'], ['kuroda_nagamasa', 'ishida_mitsunari'], ['kobayakawa_hideaki', 'otani_yoshitsugu']]
        },
        {
            time: '午後1:00', description: '脇坂安治らが呼応し裏切り。',
            positions: { 
                'wakisaka_yasuharu': { x: 530, y: 380, army: 'betrayal', lookAt: {x:500, y:350} },
                'todo_takatora': { x: 500, y: 360, lookAt: {x:500, y:350} },
                'otani_yoshitsugu': { soldiers: 200 }
            },
            combats: [['fukushima_masanori', 'ukita_hideie'], ['kuroda_nagamasa', 'ishida_mitsunari'], ['kobayakawa_hideaki', 'otani_yoshitsugu'], ['wakisaka_yasuharu', 'otani_yoshitsugu']]
        },
        {
            time: '午後1:30', description: '大谷吉継隊、壊滅。',
            positions: { 'otani_yoshitsugu': { visible: false, soldiers: 0 } },
            combats: [['fukushima_masanori', 'ukita_hideie'], ['kuroda_nagamasa', 'ishida_mitsunari']]
        },
        {
            time: '午後2:00', description: '西軍総崩れ。石田・小西・宇喜多隊が敗走。',
            positions: {
                'ishida_mitsunari': { visible: false, soldiers: 0 },
                'konishi_yukinaga': { visible: false, soldiers: 0 },
                'ukita_hideie': { visible: false, soldiers: 0 }
            },
            combats: []
        },
        {
            time: '午後3:00', description: '島津隊、敵中突破による退却を開始。',
            positions: {
                'shimazu_yoshihiro': { x: 380, y: 480, soldiers: 500, lookAt: {x:350, y:500} },
                'ii_naomasa': { x: 360, y: 460, soldiers: 3300, lookAt: {x:380, y:480} },
                'honda_tadakatsu': { x: 390, y: 470, soldiers: 400, lookAt: {x:380, y:480} }
            },
            combats: [['shimazu_yoshihiro', 'ii_naomasa'], ['shimazu_yoshihiro', 'honda_tadakatsu']]
        },
        {
            time: '午後4:00', description: '戦闘終結。',
            positions: { 'shimazu_yoshihiro': { visible: false, soldiers: 0 } },
            combats: []
        }
    ];

    // --- 3Dシーンのセットアップ ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(75, sceneCanvas.clientWidth / sceneCanvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 120, 160);
    const renderer = new THREE.WebGLRenderer({ canvas: sceneCanvas, antialias: true });
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(-100, 100, 50);
    scene.add(directionalLight);

    // --- 3Dオブジェクトとヘルパー関数 ---
    const battlefieldSize = { width: 250, height: 200 };
    const mapScale = { x: battlefieldSize.width / 800, z: battlefieldSize.height / 600 };
    const unitObjects = {};
    const armyColors = { east: 0x000080, west: 0x8B0000, betrayal: 0xFFA500 };
    const combatIcons = [];

    const terrainGeometry = new THREE.PlaneGeometry(battlefieldSize.width, battlefieldSize.height, 100, 100);
    const vertices = terrainGeometry.attributes.position;
    const colors = [];
    const green = new THREE.Color(0x228B22);
    const blue = new THREE.Color(0x4682B4);

    for (let i = 0; i < vertices.count; i++) {
        let color = green;
        const x = vertices.getX(i);
        const z = vertices.getY(i);

        terrainData.forEach(feature => {
            const feature3D = {
                x: (feature.x - 400) * mapScale.x,
                z: (feature.y - 300) * mapScale.z,
                width: feature.width * mapScale.x,
                height: feature.height * mapScale.z,
            };
            
            let influence = 0;
            if (feature.type === 'river') {
                if (Math.abs(x - feature3D.x) < feature3D.width / 2 && Math.abs(z - feature3D.z) < feature3D.height / 2) {
                    influence = 1.0;
                    color = blue;
                }
            } else {
                const distSq = (x - feature3D.x)**2 + (z - feature3D.z)**2;
                const radiusSq = (Math.min(feature3D.width, feature3D.height) / 2)**2;
                if (distSq < radiusSq) {
                    influence = Math.cos(Math.sqrt(distSq) / Math.sqrt(radiusSq) * (Math.PI / 2));
                }
            }
            
            if (influence > 0) {
                const currentElevation = vertices.getZ(i);
                vertices.setZ(i, currentElevation + feature.elevation * influence);
            }
        });
        colors.push(color.r, color.g, color.b);
    }
    terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    terrainGeometry.computeVertexNormals();
    const terrainMaterial = new THREE.MeshStandardMaterial({ vertexColors: true });
    const battlefieldPlane = new THREE.Mesh(terrainGeometry, terrainMaterial);
    battlefieldPlane.rotation.x = -Math.PI / 2;
    scene.add(battlefieldPlane);

    function createUnit(unitData) {
        const shape = new THREE.Shape();
        const w = 0.5, h1 = 0.1, h2 = 0.5, w2 = 0.2;
        shape.moveTo(-w, -h2); shape.lineTo(w, -h2); shape.lineTo(w, h1);
        shape.lineTo(w2, h1); shape.lineTo(w2, h2); shape.lineTo(-w2, h2);
        shape.lineTo(-w2, h1); shape.lineTo(-w, h1); shape.lineTo(-w, -h2);
        
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelSize: 0.05, bevelSegments: 2 });
        geometry.center();
        geometry.rotateX(Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({ color: armyColors[unitData.army] });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const label = document.createElement('div');
        label.className = 'unit-label';
        labelsContainer.appendChild(label);
        unitObjects[unitData.id] = { mesh, label };
    }

    function createCombatIcons(count) {
        for (let i = 0; i < count; i++) {
            const iconGeo = new THREE.BoxGeometry(5, 0.8, 0.8); // サイズを大きく
            const iconMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true });
            const sword1 = new THREE.Mesh(iconGeo, iconMat);
            const sword2 = sword1.clone();
            sword1.rotation.z = Math.PI / 4;
            sword2.rotation.z = -Math.PI / 4;
            const icon = new THREE.Group();
            icon.add(sword1);
            icon.add(sword2);
            icon.visible = false;
            scene.add(icon);
            combatIcons.push(icon);
        }
    }

    // --- 状態管理とアニメーション ---
    let currentStep = 0;
    let isPlaying = false;
    let playIntervalId = null;
    let isAnimating = false;

    function getUnitCurrentState(unitId, step) {
        const initialState = armies[unitId];
        const state = { ...timeline[0].positions[unitId], soldiers: initialState.soldiers };
        for (let i = 1; i <= step; i++) {
            if (timeline[i].positions && timeline[i].positions[unitId]) {
                Object.assign(state, timeline[i].positions[unitId]);
            }
        }
        return state;
    }

    function goToStep(step) {
        if (isAnimating || step < 0 || step >= timeline.length) {
            if (step >= timeline.length) stopPlayback();
            return;
        }
        isAnimating = true;
        currentStep = step;
        const event = timeline[currentStep];
        currentTimeSpan.textContent = event.time;
        eventDescriptionSpan.textContent = event.description;
        forwardButton.disabled = true;
        backwardButton.disabled = true;
        playPauseButton.disabled = true;

        combatIcons.forEach(icon => icon.visible = false);

        const animationPromises = [];

        for (const unitId in armies) {
            const state = getUnitCurrentState(unitId, currentStep);
            const { mesh, label } = unitObjects[unitId];
            
            const targetPos = { x: (state.x - 400) * mapScale.x, z: (state.y - 300) * mapScale.z };
            const scale = 2 + (state.soldiers / 30000) * 8;
            
            if (state.lookAt) {
                const target3D = { x: (state.lookAt.x - 400) * mapScale.x, z: (state.lookAt.y - 300) * mapScale.z };
                mesh.lookAt(new THREE.Vector3(target3D.x, mesh.position.y, target3D.z));
            }

            const movePromise = new Promise(resolve => {
                new TWEEN.Tween(mesh.position)
                    .to({ x: targetPos.x, z: targetPos.z }, 1500)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate(() => {
                        // You could add logic here to adjust Y based on terrain height during movement
                    })
                    .onComplete(resolve)
                    .start();
            });
            
            const scalePromise = new Promise(resolve => {
                 new TWEEN.Tween(mesh.scale)
                    .to({ x: scale, y: scale * 0.1, z: scale }, 1500)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onComplete(resolve)
                    .start();
            });

            animationPromises.push(movePromise, scalePromise);

            mesh.visible = state.visible;
            label.style.display = state.visible ? 'flex' : 'none';
            mesh.material.color.setHex(armyColors[state.army]);
            label.innerHTML = `<div class="name">${armies[unitId].name}</div><div class="soldiers">${state.soldiers}</div>`;
        }

        Promise.all(animationPromises).then(() => {
            isAnimating = false;
            forwardButton.disabled = currentStep >= timeline.length - 1;
            backwardButton.disabled = currentStep <= 0;
            playPauseButton.disabled = false;
            
            if (event.combats) {
                event.combats.forEach((pair, index) => {
                    const unit1 = unitObjects[pair[0]].mesh;
                    const unit2 = unitObjects[pair[1]].mesh;
                    if (unit1.visible && unit2.visible && combatIcons[index]) {
                        const icon = combatIcons[index];
                        icon.position.lerpVectors(unit1.position, unit2.position, 0.5);
                        icon.position.y += 5;
                        icon.visible = true;
                    }
                });
            }
        });
    }
    
    function stopPlayback() {
        if (isPlaying) {
            clearInterval(playIntervalId);
            isPlaying = false;
            playPauseButton.textContent = '再生';
        }
    }

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        TWEEN.update();
        controls.update();

        combatIcons.forEach(icon => {
            if (icon.visible) {
                icon.rotation.y += delta * 3;
                const opacity = (Math.sin(clock.getElapsedTime() * 10) + 1) / 2 * 0.75 + 0.25;
                icon.children.forEach(child => {
                    child.material.opacity = opacity;
                });
            }
        });

        for (const id in unitObjects) {
            const { mesh, label } = unitObjects[id];
            if (mesh.visible) {
                const vector = new THREE.Vector3();
                mesh.getWorldPosition(vector);
                vector.y += mesh.scale.y * 1.2;
                vector.project(camera);
                const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
                const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
                label.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
            }
        }
        renderer.render(scene, camera);
    }

    function initialize() {
        stopPlayback();
        if(Object.keys(unitObjects).length === 0) {
            for(const id in armies) createUnit(armies[id]);
            createCombatIcons(10);
        }
        goToStep(0);
    }

    // --- イベントリスナー ---
    window.addEventListener('resize', () => {
        const { clientWidth, clientHeight } = sceneCanvas.parentElement;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight);
    }, false);
    
    resetButton.addEventListener('click', initialize);
    forwardButton.addEventListener('click', () => {
        stopPlayback();
        goToStep(currentStep + 1);
    });
    backwardButton.addEventListener('click', () => {
        stopPlayback();
        goToStep(currentStep - 1);
    });
    playPauseButton.addEventListener('click', () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            isPlaying = true;
            playPauseButton.textContent = '一時停止';
            if (currentStep >= timeline.length - 1) {
                goToStep(0);
            }
            playIntervalId = setInterval(() => {
                goToStep(currentStep + 1);
            }, 2000);
        }
    });

    // --- 初期化実行 ---
    renderer.setSize(sceneCanvas.parentElement.clientWidth, sceneCanvas.parentElement.clientHeight);
    initialize();
    animate();
});
