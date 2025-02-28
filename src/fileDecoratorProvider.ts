// src/fileDecoratorProvider.ts - with async stat() fix
import * as vscode from 'vscode';
import * as path from 'path';

export class EmojiFolderDecoratorProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[]> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
  readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[]> = this._onDidChangeFileDecorations.event;
  
  private emojiMappings: Record<string, string> = {};
  
  constructor(mappings: Record<string, string>) {
    this.emojiMappings = mappings;
  }
  
  updateMappings(mappings: Record<string, string>) {
    this.emojiMappings = mappings;
    this._onDidChangeFileDecorations.fire([]); // Trigger refresh
  }
  
  async provideFileDecoration(uri: vscode.Uri): Promise<vscode.FileDecoration | undefined> {
    if (uri.scheme !== 'file') {
      return undefined;
    }
    
    // Check if this is a folder
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      if (!(stat.type & vscode.FileType.Directory)) {
        return undefined;
      }
    } catch {
      return undefined;
    }
    
    // Check if folder name has an emoji mapping
    const folderName = path.basename(uri.fsPath).toLowerCase();
    const emoji = this.emojiMappings[folderName];
    
    if (emoji) {
      return {
        badge: emoji,
        tooltip: `${folderName} folder`
      };
    }
    
    return undefined;
  }
  
  refresh() {
    this._onDidChangeFileDecorations.fire([]);
  }
}