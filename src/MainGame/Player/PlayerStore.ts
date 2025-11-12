export interface PlayerProfile {
  name: string;
  currentLevel: number;
}

const CURRENT_PLAYER_KEY = "currentPlayerName";

export class PlayerStore {
  static loadProfile(name: string): PlayerProfile {
    const raw = localStorage.getItem(PlayerStore.keyFor(name));
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PlayerProfile;
        // Ensure name is set correctly
        return { name, currentLevel: parsed.currentLevel ?? 1 };
      } catch {
        // ignore and create new profile
      }
    }
    const profile: PlayerProfile = { name, currentLevel: 1 };
    PlayerStore.saveProfile(profile);
    return profile;
  }

  static saveProfile(profile: PlayerProfile) {
    localStorage.setItem(PlayerStore.keyFor(profile.name), JSON.stringify(profile));
  }

  static setCurrentPlayerName(name: string) {
    localStorage.setItem(CURRENT_PLAYER_KEY, name);
  }

  static getCurrentPlayerName(): string | null {
    return localStorage.getItem(CURRENT_PLAYER_KEY);
  }

  static updateLevel(name: string, level: number) {
    const profile = PlayerStore.loadProfile(name);
    profile.currentLevel = level;
    PlayerStore.saveProfile(profile);
  }

  private static keyFor(name: string) {
    return `player:${name}`;
  }
}

