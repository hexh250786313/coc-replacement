import { commands, ExtensionContext, window, workspace } from 'coc.nvim';

export async function activate(context: ExtensionContext): Promise<void> {
  window.showMessage(`coc-replace-globally works!`);

  context.subscriptions.push(
    commands.registerCommand('coc-replace-globally.Command', async () => {
      setTimeout(async () => {
        const mode = await window.showMenuPicker(['Current File', 'Quickfix', 'Global'], 'Replacement mode');
        if (mode === -1) {
          return;
        }
        let target: string = await window.requestInput('Target String');
        if (!target) {
          return;
        }
        target = target.includes('_') ? target.replace(/\_/g, '\\\\_') : target;

        // 没有 target 时
        // commandOutput(`%s/${target}`);
        // workspace.nvim.command(`echo "${text}"`);
        // return;

        let replace = '';
        replace = await window.requestInput('Replace String');
        if (replace === null) {
          replace = '';
          const flag = await window.showMenuPicker(['Cancel', 'Continue but empty'], 'What is next?');
          if ([0, -1].includes(flag)) {
            return;
          }
        }
        replace = replace.includes('_') ? replace.replace(/\_/g, '\\\\_') : replace;

        const confirm = await window.showMenuPicker(['No confirm', 'Confirm'], 'With Confirming?');

        if (mode === 0) {
          try {
            await workspace.nvim.commandOutput(`%s _${target}_${replace}_g${confirm ? 'c' : ''}`);
          } catch (e: any) {
            window.showWarningMessage(e.message);
          }
        } else if (mode === 1) {
          //
        } else if (mode === 2) {
          //
        }
      }, 50);
    })
  );
}
