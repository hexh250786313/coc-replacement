import { commands, ExtensionContext, window, workspace } from 'coc.nvim';

export async function activate(context: ExtensionContext): Promise<void> {
  window.showMessage(`coc-replace-globally works!`);

  context.subscriptions.push(
    commands.registerCommand('coc-replace-globally.Command', async () => {
      const mode = await window.showMenuPicker(['Current File', 'Quickfix', 'Global'], 'Replacement mode');
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
      try {
        replace = await window.requestInput('Replace String', '🐻 __eMpTy__');
      } catch (e) {
        workspace.nvim.command(`echo "${replace}"`);
      }
      if (replace === null) {
        return;
      }
      if (/__eMpTy__/g.test(replace)) {
        replace = '';
      }
      replace = replace.includes('_') ? replace.replace(/\_/g, '\\\\_') : replace;

      const confirm = await window.showMenuPicker(['No confirm', 'Confirm'], 'With Confirming?');

      if (mode === 0) {
        workspace.nvim.command(`%s _${target}_${replace}_g${confirm ? 'c' : ''}`);
      } else if (mode === 1) {
        //
      } else if (mode === 2) {
        //
      }
    })
  );
}
