// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import * as os from 'os';
import { posix } from 'path';

export function activate(context: vscode.ExtensionContext) {
	new TestView(context);
}

class TestView {

	readonly treeView: vscode.TreeView<vscode.Uri>;

	constructor(context: vscode.ExtensionContext) {
		const treeDataProvider = new TestViewDataProvider();
		this.treeView = vscode.window.createTreeView('testView', { treeDataProvider });
		context.subscriptions.push(vscode.commands.registerCommand('testView.doSomething', this.doSomething, this));
	}

	private async doSomething(): Promise<void> {
		return vscode.window.withProgress({ location: { viewId: 'testView' } }, async () => {
			return new Promise<void>(resolve => setTimeout(resolve, 2000));
		});
	}

}

class TestViewDataProvider implements vscode.TreeDataProvider<vscode.Uri> {

	async getTreeItem(element: vscode.Uri): Promise<vscode.TreeItem> {
		const stat = await vscode.workspace.fs.stat(element);
		const treeItem = new vscode.TreeItem(posix.basename(element.path), stat.type === vscode.FileType.Directory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
		if (stat.type === vscode.FileType.File) {
			treeItem.contextValue = 'file';
		}
		return treeItem;
	}

	async getChildren(element?: vscode.Uri): Promise<vscode.Uri[]> {
		if (!element) {
			const uri = vscode.Uri.parse(posix.join(os.homedir())).with({ scheme: 'file' });
			const names = await vscode.workspace.fs.readDirectory(uri);
			return names.map(([name]) => uri.with({ path: posix.join(uri.path, name) }));
		}
		const stat = await vscode.workspace.fs.stat(element);
		if (stat.type === vscode.FileType.Directory) {
			const names = await vscode.workspace.fs.readDirectory(element);
			return names.map(([name]) => element.with({ path: posix.join(element.path, name) }));
		}
		return [];
	}

}

// this method is called when your extension is deactivated
export function deactivate() { }
