import { AssetManager } from 'cc';
import type { L10nManager } from './l10n-manager';
export default class AMPipeLineManager {
    initialized: boolean;
    l10n?: L10nManager;
    initAssetManager(l10n: L10nManager): void;
    uninstall(): void;
    redirectTask: (task: {
        output: AssetManager.RequestItem[];
        input: AssetManager.RequestItem[];
    }) => void;
}
