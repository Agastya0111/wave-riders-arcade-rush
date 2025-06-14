
import type { GameCollectibleType } from "@/components/Game.d";
import type { CollectibleType as GeneratedCollectibleType } from "@/hooks/useGameLogic";
import { checkCollision } from "@/utils/gameUtils";

interface UpdateCollectiblesProps {
    collectibles: GameCollectibleType[];
    currentTime: number;
    lastCollectibleSpawn: number;
    gameSpeed: number;
    generateCollectible: () => GeneratedCollectibleType;
}

interface UpdateCollectiblesResult {
    updatedCollectibles: GameCollectibleType[];
    newLastCollectibleSpawn: number;
}

export const updateCollectibles = ({
    collectibles,
    currentTime,
    lastCollectibleSpawn,
    gameSpeed,
    generateCollectible,
}: UpdateCollectiblesProps): UpdateCollectiblesResult => {
    let updated = collectibles
        .map(collectible => ({
            ...collectible,
            x: collectible.x - collectible.speed,
        }))
        .filter(collectible => collectible.x > -100);

    let newLastCollectibleSpawn = lastCollectibleSpawn;
    const timeSinceLastCollectible = currentTime - lastCollectibleSpawn;
    const spawnInterval = 1500; 

    if (timeSinceLastCollectible > spawnInterval + Math.random() * 1000) {
        const rnd = Math.random();
        if (rnd < 0.8) {
            if (Math.random() < 0.12) {
                updated.push({
                    id: Math.random().toString(),
                    type: "coin",
                    x: 1200,
                    y: Math.random() * 400 + 100,
                    speed: gameSpeed * 0.8,
                    double: true
                });
            } else {
                updated.push(generateCollectible());
            }
        } else if (rnd < 0.93) {
            updated.push({
                id: Math.random().toString(),
                type: "bubble",
                x: 1200,
                y: Math.random() * 400 + 100,
                speed: gameSpeed * 0.76
            });
        } else if (rnd < 0.97) {
            updated.push({
                id: Math.random().toString(),
                type: "starfish",
                x: 1200,
                y: Math.random() * 400 + 100,
                speed: gameSpeed * 0.7
            });
        } else {
            updated.push({
                id: Math.random().toString(),
                type: "magnet",
                x: 1200,
                y: Math.random() * 400 + 100,
                speed: gameSpeed * 0.8
            });
        }
        newLastCollectibleSpawn = currentTime;
    }

    return { updatedCollectibles: updated, newLastCollectibleSpawn };
}

interface HandleCollisionProps {
    collectibles: GameCollectibleType[];
    playerX: number;
    playerY: number;
    setScore: (fn: (prev: number) => number) => void;
    setCoinsCollected: (fn: (prev: number) => number) => void;
    setCollectibles: (fn: (prev: GameCollectibleType[]) => GameCollectibleType[]) => void;
    onCoinCollected?: () => void;
    setInvincibilityItems: (fn: (prev: number) => number) => void;
    setMagnetItems: (fn: (prev: number) => number) => void;
}

export const handleCollectibleCollisions = ({
    collectibles,
    playerX,
    playerY,
    setScore,
    setCoinsCollected,
    setCollectibles,
    onCoinCollected,
    setInvincibilityItems,
    setMagnetItems
}: HandleCollisionProps) => {
    const collidedIds = new Set<string>();

    collectibles.forEach(collectible => {
        if (checkCollision(
            { x: playerX, y: playerY, width: 60, height: 60 },
            { x: collectible.x, y: collectible.y, width: 40, height: 40 }
        )) {
            collidedIds.add(collectible.id);

            if (collectible.type === "coin") {
                if (collectible.double) {
                    setCoinsCollected(prev => prev + 2);
                    onCoinCollected && onCoinCollected();
                    onCoinCollected && onCoinCollected();
                } else {
                    setCoinsCollected(prev => prev + 1);
                    if (onCoinCollected) onCoinCollected();
                }
            } else if (collectible.type === "bubble") {
                setScore(prev => prev + 50);
            } else if (collectible.type === "starfish") {
                setInvincibilityItems(prev => prev + 1);
            } else if (collectible.type === "magnet") {
                setMagnetItems(prev => prev + 1);
            }
        }
    });

    if (collidedIds.size > 0) {
        setCollectibles(prev => prev.filter(c => !collidedIds.has(c.id)));
    }
}
