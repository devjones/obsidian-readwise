import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type ObsidianReadwisePlugin from '.';
import type { TokenManager } from "./tokenManager";


export class ObsidianReadwiseSettingsTab extends PluginSettingTab {
    private tokenManager: TokenManager;
    private plugin: ObsidianReadwisePlugin;

	constructor(app: App, plugin: ObsidianReadwisePlugin) {
		super(app, plugin);
		this.plugin = plugin;
        this.tokenManager = plugin.tokenManager;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Readwise Community Settings'});

        this.apiTokenSetting();
        this.syncOnBoot();
        this.syncOnInterval();
        this.highlightStoragePath();
        this.headerTemplatePath();
        this.highlightTemplatePath();
        this.notificationSettings();
	}

    apiTokenSetting() {
        const desc = document.createDocumentFragment();
        desc.createEl("span", null, (span) => {
            span.innerText =
                "Specify API Token to download highlights from Readwise. You can find the token ";

            span.createEl("a", null, (link) => {
                link.href = "https://readwise.io/access_token";
                link.innerText = "here!";
            });
        });

		new Setting(this.containerEl)
			.setName('Readwise API Token')
			.setDesc(desc)
			.addText(text => {
                const token = this.tokenManager.get();

                if (token !== null) {
                    text.setValue(token);
                }

                text
                .setPlaceholder('<READWISE_TOKEN>')
				.onChange(token => {
                    this.tokenManager.upsert(token);
                });
        });
    }

    syncOnBoot() {
        new Setting(this.containerEl)
            .setName('Sync on Startup')
            .setDesc('Automatically sync updated highlights when Obsidian starts')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.syncOnBoot)
                .onChange(async (value) => {
                    this.plugin.settings.syncOnBoot = value;
                    await this.plugin.saveSettings();
            }));
    }

    syncAllHighlightsOnFirstSync() {
        new Setting(this.containerEl)
            .setName('Sync All Highlights On Initial Load')
            .setDesc('Sync All Highlights On Initial Load')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.syncAllHighlightsOnFirstSync)
                .onChange(async (value) => {
                    this.plugin.settings.syncAllHighlightsOnFirstSync = value;
                    await this.plugin.saveSettings();
            }))
            .setDisabled(!this.plugin.settings.syncAllHighlightsOnFirstSync);
    }

    highlightStoragePath() {
        new Setting(this.containerEl)
        .setName('Highlight storage path')
        .setDesc('Path to the directory used to store the notes')
        .addText(text => text
            .setValue(this.plugin.settings.highlightStoragePath)
            .onChange(async (value) => {
                this.plugin.settings.highlightStoragePath = value;
                await this.plugin.saveSettings();
            }))
    }

    syncOnInterval() {
        new Setting(this.containerEl)
            .setName('Sync on Interval')
            .setDesc('Sync updated highlights on interval (hours). To disable automatic sync specify a negative value or zero (default)')
            .addText(text => text
                .setValue(String(this.plugin.settings.autoSyncInterval))
                .onChange(async value => {
                    if (!isNaN(Number(value))) {
                        this.plugin.settings.autoSyncInterval = Number(value);
                        await this.plugin.saveSettings();

                        if (this.plugin.settings.autoSyncInterval > 0) {
                            this.plugin.clearAutoSync();
                            this.plugin.startAutoSync(this.plugin.settings.autoSyncInterval);
                            new Notice(
                                `Automatic sync enabled! Every ${this.plugin.settings.autoSyncInterval} hours.`
                            )
                        }
                        else if (this.plugin.settings.autoSyncInterval <= 0 && this.plugin.timeoutIdSync) {
                            this.plugin.clearAutoSync();
                            new Notice(
                                "Automatic sync disabled!"
                            )
                        }
                    }
                    else {
                        new Notice("Please specify a valid number.")
                    }
                })
        );
    }

    headerTemplatePath() {
        new Setting(this.containerEl)
            .setName('Custom Header Template Path')
            .setDesc('Path to template note that overrides how the note header is written')
            .addText(text => text
                .setValue(this.plugin.settings.headerTemplatePath)
                .onChange(async (value) => {
                    this.plugin.settings.headerTemplatePath = value;
                    await this.plugin.saveSettings();
            }));
    }

    highlightTemplatePath() {
        new Setting(this.containerEl)
            .setName('Custom Highlight Template Path')
            .setDesc('Path to template note that overrides how the highlights are written')
            .addText(text => text
                .setValue(this.plugin.settings.highlightTemplatePath)
                .onChange(async (value) => {
                    this.plugin.settings.highlightTemplatePath = value;
                    await this.plugin.saveSettings();
            }));
    }

    notificationSettings() {
        new Setting(this.containerEl)
            .setName('Disable Notifications')
            .setDesc('Disable notifications for plugin operations to minimize distraction (refer to status bar for updates)')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.disableNotifications)
                .onChange(async (value) => {
                    this.plugin.settings.disableNotifications = value;
                    await this.plugin.saveSettings();
            }));
    }
}
