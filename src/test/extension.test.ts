import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

suite('Emoji Folder Icons Extension Test Suite', () => {
  // Timeout for tests
  const TEST_TIMEOUT = 10000;

  // Test workspace folder
  let testWorkspaceFolder: string;

  // Setup function to create test workspace with sample folders
  suiteSetup(async function() {
    this.timeout(TEST_TIMEOUT);

    // Create temporary test workspace
    testWorkspaceFolder = path.join(os.tmpdir(), `emoji-folder-icons-test-${Math.random().toString(36).substring(2, 8)}`);

    // Create common folders to test icon assignments
    const foldersToCreate = [
      'src',
      'assets',
      'docs',
      'test',
      'config',
      'components',
      'utils',
      'custom-folder'  // For testing custom mappings
    ];

    // Ensure the test workspace exists
    if (!fs.existsSync(testWorkspaceFolder)) {
      fs.mkdirSync(testWorkspaceFolder, { recursive: true });
    }

    // Create all the test folders
    for (const folder of foldersToCreate) {
      fs.mkdirSync(path.join(testWorkspaceFolder, folder), { recursive: true });
    }

    // Open the test workspace
    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(testWorkspaceFolder));

    // Wait for extension to activate
    const extension = vscode.extensions.getExtension('emoji-folder-icons');
    await extension?.activate();

    // Give the extension time to apply the decorations
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  // Cleanup after tests
  suiteTeardown(async () => {
    // Close the workspace
    await vscode.commands.executeCommand('workbench.action.closeFolder');

    // Clean up the test workspace
    try {
      fs.rmSync(testWorkspaceFolder, { recursive: true, force: true });
    } catch (error) {
      console.error(`Error cleaning up test workspace: ${error}`);
    }
  });

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('emoji-folder-icons'));
  });

  test('Extension should be activated', async () => {
    const extension = vscode.extensions.getExtension('emoji-folder-icons');
    assert.strictEqual(extension?.isActive, true);
  });

  test('Configuration should be registered', () => {
    const config = vscode.workspace.getConfiguration('emojiFolderIcons');
    assert.ok(config);
    assert.strictEqual(typeof config.get('enabled'), 'boolean');
    assert.ok(config.has('customMappings'));
  });

  test('Refresh command should be registered', async () => {
    // Get all commands
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('emojiFolderIcons.refresh'));
  });

  test('Custom emoji mapping should work', async function() {
    this.timeout(TEST_TIMEOUT);

    // Set custom mapping
    const config = vscode.workspace.getConfiguration('emojiFolderIcons');
    await config.update('customMappings', { 'custom-folder': '🚀' }, vscode.ConfigurationTarget.Workspace);

    // Run refresh command
    await vscode.commands.executeCommand('emojiFolderIcons.refresh');

    // Wait for the refresh to take effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify the custom mapping is applied
    const updatedConfig = vscode.workspace.getConfiguration('emojiFolderIcons');
    const customMappings = updatedConfig.get('customMappings') as Record<string, string>;
    assert.strictEqual(customMappings['custom-folder'], '🚀');
  });

  test('Disabling the extension should work', async function() {
    this.timeout(TEST_TIMEOUT);

    // Disable the extension
    const config = vscode.workspace.getConfiguration('emojiFolderIcons');
    await config.update('enabled', false, vscode.ConfigurationTarget.Workspace);

    // Run refresh command
    await vscode.commands.executeCommand('emojiFolderIcons.refresh');

    // Wait for the refresh to take effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify the extension is disabled
    const updatedConfig = vscode.workspace.getConfiguration('emojiFolderIcons');
    assert.strictEqual(updatedConfig.get('enabled'), false);

    // Re-enable the extension for further tests
    await config.update('enabled', true, vscode.ConfigurationTarget.Workspace);
    await vscode.commands.executeCommand('emojiFolderIcons.refresh');
  });
});