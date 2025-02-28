// src/extension.ts - Updated with FileDecorationProvider integration
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EmojiFolderDecoratorProvider } from './fileDecoratorProvider';

// Default emoji mappings
const DEFAULT_EMOJI_MAPPINGS: Record<string, string> = {
  src: '📦📦',
  source: '📦',
  assets: '🎨',
  images: '🖼️',
  img: '🖼️',
  docs: '📜',
  documentation: '📄',
  test: '🧪',
  tests: '🧪',
  config: '⚙️',
  configuration: '⚙️',
  dist: '📤',
  build: '🔨',
  lib: '📚',
  libs: '📚',
  scripts: '📜',
  styles: '💅',
  css: '💅',
  components: '🧩',
  utils: '🛠️',
  helpers: '🔧',
  node_modules: '📦',
  public: '🌐',
  static: '📄',
  data: '📊',
  api: '🔌',
  models: '🏗️',
  controllers: '🎮',
  views: '👁️',
  pages: '📃',
  fonts: '🔤',
  audio: '🔊',
  video: '🎬',
  logs: '📝',
  translations: '🌍',
  locales: '🌐',
  i18n: '🌎',
  temp: '🕒',
  tmp: '🕒'
};

let decoratorProvider: EmojiFolderDecoratorProvider;
let decoratorDisposable: vscode.Disposable;

export function activate(context: vscode.ExtensionContext) {
  console.log('Emoji Folder Icons extension is now active!');
  
  // Initialize with default mappings
  const config = vscode.workspace.getConfiguration('emojiFolderIcons');
  const customMappings = config.get<Record<string, string>>('customMappings', {});
  const mappings = { ...DEFAULT_EMOJI_MAPPINGS, ...customMappings };
  
  // Create and register the decorator provider
  decoratorProvider = new EmojiFolderDecoratorProvider(mappings);
  decoratorDisposable = vscode.window.registerFileDecorationProvider(decoratorProvider);
  context.subscriptions.push(decoratorDisposable);
  
  // Register command to manually refresh icons
  const refreshCommand = vscode.commands.registerCommand('emojiFolderIcons.refresh', () => {
    updateEmojiMappings();
    decoratorProvider.refresh();
    vscode.window.showInformationMessage('Emoji Folder Icons refreshed!');
  });
  
  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('emojiFolderIcons')) {
        updateEmojiMappings();
      }
    })
  );
  
  context.subscriptions.push(refreshCommand);
}

function updateEmojiMappings() {
  const config = vscode.workspace.getConfiguration('emojiFolderIcons');
  const enabled = config.get<boolean>('enabled', true);
  
  if (!enabled) {
    // If disabled, use empty mappings
    decoratorProvider.updateMappings({});
    return;
  }
  
  // Get custom mappings from settings
  const customMappings = config.get<Record<string, string>>('customMappings', {});
  
  // Merge default and custom mappings (custom take precedence)
  const mappings = { ...DEFAULT_EMOJI_MAPPINGS, ...customMappings };
  decoratorProvider.updateMappings(mappings);
}

export function deactivate() {
  if (decoratorDisposable) {
    decoratorDisposable.dispose();
  }
}