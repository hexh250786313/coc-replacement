import { commands, ExtensionContext, window, workspace } from 'coc.nvim';
import { URI } from 'vscode-uri';

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand('coc-replacement.replace', async () => {
      setTimeout(async () => {
        const mode = await window.showMenuPicker(['Current File', 'Quickfix'], 'Replacement mode');
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
            await workspace.nvim.command(`%s _${target}_${replace}_g${confirm ? 'c' : ''}`);
          } catch (e: any) {
            window.showWarningMessage(e.message);
          }
        } else if (mode === 1) {
          await workspace.nvim.command(`ccl`);
          await workspace.nvim.command(`ScrollViewDisable`);
          try {
            if (confirm) {
              // === 关闭缓存的
              await workspace.nvim.command(`cfdo %s_${target}_${replace}_gc | redraw | silent update | redraw | bd`);
              await workspace.nvim.command(`e# | bd#`);
              // === 不关闭缓存的
              // await workspace.nvim.command(`cfdo %s_${target}_${replace}_gc | redraw | silent update | redraw`);
              // ===
            } else {
              const list: any[] = await workspace.nvim.call('getqflist');
              // let fileNames = '';
              const fileNames = await Promise.all(
                list.map(async (item) => {
                  const { bufnr } = item;
                  const bufname = await workspace.nvim.call('bufname', bufnr);
                  await workspace.nvim.command(`echo "${bufname}"`);
                  const fullpath = await workspace.nvim.call('fnamemodify', [bufname, ':p']);
                  const uri = URI.file(fullpath)
                    .toString()
                    .replace(/file:\/\//g, ''); // file:///home/hexh/workspace/MOBILE/src/index.js
                  return uri;
                })
              );
              await workspace.runCommand(
                `sed -i 's_${target}_${replace}_gi' ${fileNames
                  .filter((file, index, self) => self.findIndex((T) => T === file) === index)
                  .join(' ')}`
              );
              await workspace.nvim.command(`echo "Done!"`);
            }
          } catch (e: any) {
            window.showWarningMessage(e.message);
          }
          await workspace.nvim.command(`ScrollViewEnable`);
        } else if (mode === 2) {
          //
        }
      }, 50);
    })
  );
}
